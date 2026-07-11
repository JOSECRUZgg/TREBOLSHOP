'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from './auth'

export async function getWorkers() {
    const workers = await prisma.employee.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return workers
}

export async function getWorkerById(id: string) {
    return await prisma.employee.findUnique({
        where: { id }
    })
}

export async function createWorker(formData: FormData) {
    await requireAdmin()
    const dni = formData.get('dni') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const socialSecurity = formData.get('socialSecurity') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const dateOfBirthStr = formData.get('dateOfBirth') as string

    if (!dni || !firstName || !lastName) {
        throw new Error("DNI, Nombre y Apellidos son obligatorios")
    }

    // Check if DNI exists
    const existing = await prisma.employee.findUnique({ where: { dni } })
    if (existing) {
        throw new Error("Ya existe un trabajador con este DNI")
    }

    await prisma.employee.create({
        data: {
            dni,
            firstName,
            lastName,
            socialSecurity,
            phone,
            address,
            dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null
        }
    })

    revalidatePath('/admin/workers')
    return { success: true }
}

export async function updateWorker(id: string, formData: FormData) {
    await requireAdmin()
    const dni = formData.get('dni') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const socialSecurity = formData.get('socialSecurity') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const dateOfBirthStr = formData.get('dateOfBirth') as string

    if (!dni || !firstName || !lastName) {
        throw new Error("DNI, Nombre y Apellidos son obligatorios")
    }

    // Check if DNI exists for other users
    const existing = await prisma.employee.findFirst({
        where: {
            dni,
            NOT: { id }
        }
    })

    if (existing) {
        throw new Error("Ya existe otro trabajador con este DNI")
    }

    await prisma.employee.update({
        where: { id },
        data: {
            dni,
            firstName,
            lastName,
            socialSecurity,
            phone,
            address,
            dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null
        }
    })

    revalidatePath('/admin/workers')
    return { success: true }
}

export async function deleteWorker(id: string) {
    await requireAdmin()
    try {
        await prisma.employee.delete({
            where: { id }
        })
        revalidatePath('/admin/workers')
        return { success: true }
    } catch (error) {
        console.error("Error deleting worker:", error)
        throw new Error("No se pudo eliminar el trabajador. Puede que tenga ventas asociadas.")
    }
}
