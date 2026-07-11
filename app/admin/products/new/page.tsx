import { addProduct } from '@/lib/actions'
import { getQualities, getStyles, getMaterials, getCategories } from '@/lib/attribute-actions'
import { ProductForm } from '../product-form'

export default async function NewProductPage() {
    const qualities = await getQualities()
    const styles = await getStyles()
    const materials = await getMaterials()
    const categories = await getCategories()

    const options = {
        qualities,
        styles,
        materials,
        categories
    }

    const handleSubmit = async (formData: FormData) => {
        'use server'
        return await addProduct(formData)
    }

    return (
        <ProductForm
            title="Agregar Nuevo Producto"
            onSubmit={handleSubmit}
            options={options}
        />
    )
}
