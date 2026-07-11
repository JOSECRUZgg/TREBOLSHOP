import { getQualities, getStyles, getMaterials, getCategories } from "@/lib/attribute-actions"
import { ProductForm } from "../product-form"

export default async function NewProductPage() {
    const [qualities, styles, materials, categories] = await Promise.all([
        getQualities(), getStyles(), getMaterials(), getCategories()
    ])

    return (
        <ProductForm
            title="Crear Producto"
            mode="create"
            options={{ qualities, styles, materials, categories }}
        />
    )
}
