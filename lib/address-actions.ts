'use server'

import { prisma } from './prisma'
import { auth } from './auth'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

export async function getAddresses() {
    noStore()
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
    })
}

export async function addAddress(formData: FormData) {
    noStore()
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    const name = formData.get('name') as string
    const street = formData.get('street') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const postalCode = formData.get('postalCode') as string
    const isDefault = formData.get('isDefault') === 'on'

    if (isDefault) {
        // Unset current default
        await prisma.address.updateMany({
            where: { userId: session.user.id, isDefault: true },
            data: { isDefault: false },
        })
    }

    await prisma.address.create({
        data: {
            userId: session.user.id,
            name,
            street,
            city,
            state,
            postalCode,
            isDefault,
        },
    })

    revalidatePath('/profile')
    return { success: true }
}

export async function deleteAddress(id: string) {
    noStore()
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    await prisma.address.delete({
        where: { id, userId: session.user.id },
    })

    revalidatePath('/profile')
    return { success: true }
}

export async function setDefaultAddress(id: string) {
    noStore()
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    await prisma.$transaction([
        prisma.address.updateMany({
            where: { userId: session.user.id, isDefault: true },
            data: { isDefault: false },
        }),
        prisma.address.update({
            where: { id },
            data: { isDefault: true },
        }),
    ])

    revalidatePath('/profile')
    return { success: true }
}
