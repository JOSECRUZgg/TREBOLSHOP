import { getProducts } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { ProductActions } from "./product-actions"

export default async function AdminProductsPage() {
    const products = await getProducts({ limit: 100 } as any) // Fetch all (simplified)

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Productos</h1>
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" /> Agregar Producto
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Calidad</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.code}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.qualityRef?.name || product.quality || '-'}</TableCell>
                                <TableCell>{product.styleRef?.name || product.subcategory || '-'}</TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <span className={product.quantity <= 5 ? "text-red-600 font-bold" : "text-green-600"}>
                                        {product.quantity}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <ProductActions productId={product.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
