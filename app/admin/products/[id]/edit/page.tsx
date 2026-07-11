import { getProductById, updateProduct } from '@/lib/actions'
import { getQualities, getStyles, getMaterials, getCategories } from '@/lib/attribute-actions'
import { ProductForm } from '../../product-form'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const { id } = await (params as any)
    const product = await getProductById(id)

    if (!product) {
        notFound()
    }

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

    // Convert Decimals to numbers for the form
    const initialData = {
        ...product,
        price: Number(product.price),
    }

    const handleSubmit = async (formData: FormData) => {
        'use server'
        return await updateProduct(id, formData)
    }

    return (
        <ProductForm
            title="Editar Producto"
            initialData={initialData}
            onSubmit={handleSubmit}
            options={options}
        />
    )
}
