'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'

// Helper to get model from string to handle possible out-of-sync client
const getModel = (modelName: string) => {
    const client = prisma as any
    if (!client[modelName]) {
        console.warn(`Prisma model ${modelName} not found in client. Ensure npx prisma generate has run.`)
        return null
    }
    return client[modelName]
}

async function getAttributes(modelName: string) {
    const model = getModel(modelName)
    if (!model) return []
    return await model.findMany({
        orderBy: { name: 'asc' }
    })
}

async function createAttribute(modelName: string, name: string) {
    const model = getModel(modelName)
    if (!model) throw new Error(`Model ${modelName} not available`)
    if (!name) throw new Error("Nombre requerido")

    const existing = await model.findUnique({ where: { name } })
    if (existing) throw new Error("Este valor ya existe")

    const result = await model.create({
        data: { name }
    })
    revalidatePath('/admin/attributes')
    return result
}

async function updateAttribute(modelName: string, id: string, name: string) {
    const model = getModel(modelName)
    if (!model) throw new Error(`Model ${modelName} not available`)
    if (!name) throw new Error("Nombre requerido")

    const result = await model.update({
        where: { id },
        data: { name }
    })
    revalidatePath('/admin/attributes')
    return result
}

async function deleteAttribute(modelName: string, id: string) {
    const model = getModel(modelName)
    if (!model) throw new Error(`Model ${modelName} not available`)
    try {
        const result = await model.delete({
            where: { id }
        })
        revalidatePath('/admin/attributes')
        return result
    } catch (error) {
        throw new Error("No se puede eliminar el atributo porque está en uso por uno o más productos.")
    }
}

// Exported CRUD actions for each type
export const getQualities = async () => getAttributes('quality')
export const addQuality = async (name: string) => createAttribute('quality', name)
export const editQuality = async (id: string, name: string) => updateAttribute('quality', id, name)
export const removeQuality = async (id: string) => deleteAttribute('quality', id)

export const getStyles = async () => getAttributes('style')
export const addStyle = async (name: string) => createAttribute('style', name)
export const editStyle = async (id: string, name: string) => updateAttribute('style', id, name)
export const removeStyle = async (id: string) => deleteAttribute('style', id)

export const getMaterials = async () => getAttributes('material')
export const addMaterial = async (name: string) => createAttribute('material', name)
export const editMaterial = async (id: string, name: string) => updateAttribute('material', id, name)
export const removeMaterial = async (id: string) => deleteAttribute('material', id)

export const getCategories = async () => getAttributes('category')
export const addCategory = async (name: string) => createAttribute('category', name)
export const editCategory = async (id: string, name: string) => updateAttribute('category', id, name)
export const removeCategory = async (id: string) => deleteAttribute('category', id)

/**
 * Seeds default attributes if they don't exist
 */
export async function seedDefaults() {
    const data = {
        quality: ["Básica", "Estándar", "Premium"],
        style: ["Snapback", "Trucker", "Fitted", "Dad Hat", "Diseñador", "Beanie"],
        material: ["Poliéster", "Algodón", "Cuero", "Lana", "Acrílico", "Malla"],
        category: ["Colección Urbana", "Colección Deportiva", "Edición Limitada", "Diseño Exclusivo"]
    }

    for (const [modelName, names] of Object.entries(data)) {
        const model = getModel(modelName)
        if (!model) continue

        for (const name of names) {
            await model.upsert({
                where: { name },
                update: {},
                create: { name }
            })
        }
    }

    revalidatePath('/admin/attributes')
    return { success: true }
}
