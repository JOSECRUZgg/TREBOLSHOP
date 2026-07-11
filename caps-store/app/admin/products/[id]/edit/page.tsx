import { notFound } from "next/navigation"
import { getProductById } from "@/lib/actions"
import { getQualities, getStyles, getMaterials, getCategories } from "@/lib/attribute-actions"
import { ProductForm } from "@/app/admin/products/product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await getProductById(id)
    if (!product) notFound()

    const [qualities, styles, materials, categories] = await Promise.all([
        getQualities(), getStyles(), getMaterials(), getCategories()
    ])

    return (
        <ProductForm
            title="Editar Producto"
            mode="update"
            productId={id}
            initialData={product}
            options={{ qualities, styles, materials, categories }}
        />
    )
}
