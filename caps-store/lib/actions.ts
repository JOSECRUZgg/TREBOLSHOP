'use server'

import { prisma } from './prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { signIn, signOut, auth } from './auth'
import { AuthError } from 'next-auth'
import { writeFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { revalidatePath } from 'next/cache'

export type ProductFilters = {
    query?: string
    quality?: string
    subcategory?: string
    material?: string
    style?: string
    audience?: string
    minPrice?: number
    maxPrice?: number
    view?: string
}

export async function registerAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (!email || !password || !name) throw new Error("Faltan campos obligatorios")

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error("El usuario ya existe")

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
        throw new Error("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'CUSTOMER'
        }
    })

    // We can just return success and let client redirect to login
    return { success: true }
}

export async function loginAction(formData: FormData) {
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false,
        })
        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    throw new Error('Credenciales inválidas.')
                default:
                    throw new Error('Algo salió mal.')
            }
        }
        throw error
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: '/' })
}

export async function getProducts(filters: ProductFilters = {}) {
    const where: any = {}

    if (filters.quality && filters.quality !== 'all') {
        where.OR = [
            { quality: filters.quality },
            { qualityRef: { name: filters.quality } }
        ]
    }
    if (filters.subcategory && filters.subcategory !== 'all') {
        const subFilteredWhere = [
            { subcategory: filters.subcategory },
            { styleRef: { name: filters.subcategory } }
        ]
        if (where.OR) {
            where.AND = [{ OR: where.OR }, { OR: subFilteredWhere }]
            delete where.OR
        } else {
            where.OR = subFilteredWhere
        }
    }
    if (filters.style && filters.style !== 'all') {
        const styleFilteredWhere = [
            { style: filters.style },
            { categoryRef: { name: filters.style } }
        ]
        if (where.AND) {
            where.AND.push({ OR: styleFilteredWhere })
        } else if (where.OR) {
            where.AND = [{ OR: where.OR }, { OR: styleFilteredWhere }]
            delete where.OR
        } else {
            where.OR = styleFilteredWhere
        }
    }
    if (filters.material && filters.material !== 'all') {
        const matWhere = [
            { material: filters.material },
            { materialRef: { name: filters.material } }
        ]
        if (where.AND) {
            where.AND.push({ OR: matWhere })
        } else if (where.OR) {
            where.AND = [{ OR: where.OR }, { OR: matWhere }]
            delete where.OR
        } else {
            where.OR = matWhere
        }
    }
    if (filters.audience && filters.audience !== 'all') where.audience = filters.audience

    if (filters.minPrice || filters.maxPrice) {
        where.price = {}
        if (filters.minPrice) where.price.gte = filters.minPrice
        if (filters.maxPrice) where.price.lte = filters.maxPrice
    }
    
    if (filters.query) {
        const qWhere = {
            OR: [
                { name: { contains: filters.query } },
                { code: { contains: filters.query } },
                { commercialName: { contains: filters.query } }
            ]
        }
        if (where.AND) {
            where.AND.push(qWhere)
        } else if (where.OR) {
            where.AND = [{ OR: where.OR }, qWhere]
            delete where.OR
        } else {
            where.OR = qWhere.OR
        }
    }

    const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            qualityRef: true,
            styleRef: true,
            materialRef: true,
            categoryRef: true
        }
    })

    return products.map(p => ({
        ...p,
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : 0,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }))
}

export async function createSale(data: { employeeId: string, items: { productId: string, quantity: number }[], paymentMethod: string }) {
    // Transaction to deduct stock and create sale
    return await prisma.$transaction(async (tx) => {
        let total = 0

        // 1. Calculate total and check stock
        for (const item of data.items) {
            const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId } })
            if (product.quantity < item.quantity) {
                throw new Error(`Stock insuficiente para ${product.name}`)
            }
            total += product.price.toNumber() * item.quantity
        }

        // 2. Create Sale
        const sale = await tx.sale.create({
            data: {
                total,
                paymentMethod: data.paymentMethod,
                employeeId: data.employeeId,
                items: {
                    create: await Promise.all(data.items.map(async (item) => {
                        const product = await tx.product.findUnique({ where: { id: item.productId } })
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            price: product!.price
                        }
                    }))
                }
            }
        })

        // 3. Update Stock
        for (const item of data.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { quantity: { decrement: item.quantity } }
            })
        }

        return {
            ...sale,
            total: Number(sale.total),
        }
    })
}

export async function getAdminStats() {
    const productCount = await prisma.product.count()
    const lowStockCount = await prisma.product.count({ where: { quantity: { lte: 5 } } })
    const saleCount = await prisma.sale.count({ where: { status: 'COMPLETED' } })
    const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } })
    const workerCount = await prisma.employee.count()

    // Calculate total revenue
    const sales = await prisma.sale.findMany({
        where: { status: 'COMPLETED' },
        select: { total: true }
    })
    const totalRevenue = sales.reduce((acc, curr) => acc + curr.total.toNumber(), 0)

    const recentOrders = await prisma.sale.findMany({
        orderBy: { date: 'desc' },
        take: 5,
        include: {
            user: { select: { name: true, email: true } },
            items: true
        }
    })

    return {
        productCount,
        lowStockCount,
        saleCount,
        customerCount,
        workerCount,
        totalRevenue: Number(totalRevenue),
        recentOrders: recentOrders.map(order => ({
            id: order.id,
            status: order.status,
            total: Number(order.total),
            date: order.date.toISOString(),
            customerName: order.user?.name || 'Venta Directa',
            itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0)
        }))
    }
}

export async function getProductById(id: string) {
    const product = await prisma.product.findUnique({
        where: { id }
    })
    if (!product) return null
    return {
        ...product,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : 0,
    }
}

export async function addProduct(formData: FormData) {
    const code = formData.get('code') as string
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const quantity = parseInt(formData.get('quantity') as string)
    const qualityId = formData.get('qualityId') as string
    const styleId = formData.get('styleId') as string
    const materialId = formData.get('materialId') as string
    const categoryId = formData.get('categoryId') as string
    const brand = formData.get('brand') as string
    const imageFile = formData.get('image') as File | null

    // Check if code exists
    const existing = await prisma.product.findUnique({ where: { code } })
    if (existing) throw new Error("Ya existe un producto con este código")

    let imageUrl = '/placeholder.jpg'

    if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate semi-unique filename
        const filename = `${code}-${Date.now()}-${imageFile.name}`
        const path = join(process.cwd(), 'public', 'products', filename)

        await writeFile(path, buffer)
        imageUrl = `/products/${filename}`
    }

    await prisma.product.create({
        data: {
            code, name, price, quantity, brand,
            qualityId,
            styleId,
            materialId,
            categoryId,
            commercialName: name,
            audience: 'Unisex',
            imageUrl
        }
    })

    revalidatePath('/admin/products')
    return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
    const code = formData.get('code') as string
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const quantity = parseInt(formData.get('quantity') as string)
    const qualityId = formData.get('qualityId') as string
    const styleId = formData.get('styleId') as string
    const materialId = formData.get('materialId') as string
    const categoryId = formData.get('categoryId') as string
    const brand = formData.get('brand') as string
    const imageFile = formData.get('image') as File | null

    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) throw new Error("Producto no encontrado")

    let imageUrl = existingProduct.imageUrl

    if (imageFile && imageFile.size > 0) {
        // Delete old image if it exists and isn't the placeholder
        if (existingProduct.imageUrl && !existingProduct.imageUrl.includes('placeholder')) {
            try {
                const oldPath = join(process.cwd(), 'public', existingProduct.imageUrl)
                await unlink(oldPath)
            } catch (error) {
                console.error("Error deleting old image:", error)
            }
        }

        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${code}-${Date.now()}-${imageFile.name}`
        const path = join(process.cwd(), 'public', 'products', filename)
        await writeFile(path, buffer)
        imageUrl = `/products/${filename}`
    }

    await prisma.product.update({
        where: { id },
        data: {
            code, name, price, quantity, brand,
            qualityId,
            styleId,
            materialId,
            categoryId,
            commercialName: name,
            imageUrl
        }
    })

    revalidatePath('/admin/products')
    return { success: true }
}

export async function deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error("Producto no encontrado")

    // Delete image file if exists
    if (product.imageUrl && !product.imageUrl.includes('placeholder')) {
        try {
            const path = join(process.cwd(), 'public', product.imageUrl)
            await unlink(path)
        } catch (error) {
            console.error("Error deleting image file:", error)
        }
    }

    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/products')
    return { success: true }
}

export async function updateStock(productId: string, newQuantity: number) {
    await prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity }
    })
    return { success: true }
}


export async function getEmployeeByDni(dni: string) {
    return await prisma.employee.findUnique({
        where: { dni },
        select: { id: true, firstName: true, lastName: true }
    })
}

export async function googleLogin() {
    await signIn('google', { redirectTo: '/' })
}

export async function updateUserPreferences(userId: string, data: { favoriteStyle?: string, headSize?: string, favoriteMaterial?: string }) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                favoriteStyle: data.favoriteStyle,
                headSize: data.headSize,
                favoriteMaterial: data.favoriteMaterial
            }
        })
        return { success: true }
    } catch (error) {
        console.error("Error al actualizar preferencias:", error)
        return {
            success: false,
            error: "No se encontró tu usuario en la base de datos. Esto puede pasar si se reinició la base de datos recientemente. Por favor, cierra sesión e inicia de nuevo."
        }
    }
}

export async function getCart() {
    const session = await auth()
    if (!session?.user?.id) return []

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { cart: true } as any
    }) as any

    if (!user?.cart) return []
    try {
        return JSON.parse(user.cart)
    } catch (e) {
        return []
    }
}

export async function updateCart(items: any[]) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'No autorizado' }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { cart: JSON.stringify(items) } as any
    })

    return { success: true }
}

export async function syncCartPrices(itemIds: string[]) {
    const products = await prisma.product.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, price: true }
    })

    return products.map(p => ({
        id: p.id,
        price: p.price.toNumber()
    }))
}

export async function createPendingOrder(data: { total: number, items: any[], paymentMethod: string }) {
    const session = await auth()
    const userId = session?.user?.id

    const order = await prisma.sale.create({
        data: {
            total: data.total,
            paymentMethod: data.paymentMethod,
            status: 'PENDING',
            userId,
            items: {
                create: data.items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        }
    })

    return {
        ...order,
        total: order.total.toNumber(),
    }
}

export async function getOrders(filters: { status?: string, startDate?: string, endDate?: string, customerName?: string } = {}) {
    const where: any = {}
    if (filters.status && filters.status !== 'ALL') {
        where.status = filters.status
    }
    if (filters.customerName) {
        where.user = {
            name: {
                contains: filters.customerName,
                // mode: 'insensitive' is not supported in all SQLite versions, 
                // but let's try it or use standard filter
            }
        }
    }
    if (filters.startDate || filters.endDate) {
        where.date = {}
        if (filters.startDate) where.date.gte = new Date(filters.startDate)
        if (filters.endDate) {
            const end = new Date(filters.endDate)
            end.setHours(23, 59, 59, 999)
            where.date.lte = end
        }
    }

    const orders = await prisma.sale.findMany({
        where,
        include: {
            items: {
                include: {
                    product: true
                }
            },
            user: {
                select: { name: true, email: true }
            }
        },
        orderBy: { date: 'desc' }
    })

    return orders.map(order => ({
        ...order,
        total: Number(order.total),
        date: order.date.toISOString(),
        items: order.items.map(item => ({
            ...item,
            price: Number(item.price),
            product: item.product ? {
                ...item.product,
                price: Number(item.product.price),
                cost: item.product.cost ? Number(item.product.cost) : 0
            } : undefined
        }))
    }))
}

export async function updateOrder(orderId: string, data: { status?: string, items?: { productId: string, quantity: number, price: number }[] }) {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.sale.findUniqueOrThrow({
            where: { id: orderId },
            include: { items: true }
        })

        // If items are being updated, we might need to adjust stock (complex for completed orders)
        // For simplicity, we only allow updating items if it was PENDING
        if (data.items && order.status === 'PENDING') {
            await tx.saleItem.deleteMany({ where: { saleId: orderId } })
            await tx.saleItem.createMany({
                data: data.items.map(item => ({
                    saleId: orderId,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            })

            // Recalculate total
            const total = data.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
            await tx.sale.update({
                where: { id: orderId },
                data: { total }
            })
        }

        if (data.status) {
            // Handle stock deduction if transitioning to COMPLETED
            if (data.status === 'COMPLETED' && order.status === 'PENDING') {
                const updatedOrder = await tx.sale.findUniqueOrThrow({
                    where: { id: orderId },
                    include: { items: true }
                })
                for (const item of updatedOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { quantity: { decrement: item.quantity } }
                    })
                }
            }

            await tx.sale.update({
                where: { id: orderId },
                data: { status: data.status }
            })
        }

        return { success: true }
    })
}

export async function getReportStats(filters: { startDate?: string, endDate?: string, customerName?: string } = {}) {
    const where: any = { status: 'COMPLETED' }
    if (filters.customerName) {
        where.user = {
            name: {
                contains: filters.customerName
            }
        }
    }
    if (filters.startDate || filters.endDate) {
        where.date = {}
        if (filters.startDate) where.date.gte = new Date(filters.startDate)
        if (filters.endDate) {
            const end = new Date(filters.endDate)
            end.setHours(23, 59, 59, 999)
            where.date.lte = end
        }
    }

    const sales = await prisma.sale.findMany({
        where,
        select: { total: true, date: true }
    })

    const totalRevenue = sales.reduce((acc, curr) => acc + Number(curr.total), 0)
    const saleCount = sales.length

    return {
        totalRevenue,
        saleCount,
        sales: sales.map(s => ({
            total: Number(s.total),
            date: s.date.toISOString()
        }))
    }
}

export async function confirmOrder(orderId: string) {
    return updateOrder(orderId, { status: 'COMPLETED' })
}

export async function cancelOrder(orderId: string) {
    return updateOrder(orderId, { status: 'CANCELLED' })
}

export async function getPendingOrders() {
    return getOrders({ status: 'PENDING' })
}

export async function getUserOrders() {
    const session = await auth()
    if (!session?.user?.id) return []

    const orders = await prisma.sale.findMany({
        where: { userId: session.user.id },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        },
        orderBy: { date: 'desc' }
    })

    return orders.map(order => ({
        ...order,
        total: Number(order.total),
        date: order.date.toISOString(),
        items: order.items.map(item => ({
            ...item,
            price: Number(item.price),
            product: item.product ? {
                ...item.product,
                price: Number(item.product.price),
                cost: item.product.cost ? Number(item.product.cost) : 0
            } : undefined
        }))
    }))
}
