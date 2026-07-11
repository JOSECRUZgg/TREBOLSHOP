import { getProducts } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { ProductActions } from "./product-actions"

export default async function AdminProductsPage() {
    const { products } = await getProducts({ limit: 200 })

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Catálogo de Productos</h1>
                    <p className="text-slate-500 text-sm mt-1">Administra tu inventario, precios y detalles de tus productos.</p>
                </div>
                <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm font-medium transition-all h-10 px-6">
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" /> Agregar Producto
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
