import { getProducts } from "@/lib/actions"
import StockRow from "./stock-row"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminStockPage() {
    const { products } = await getProducts({ limit: 200 })

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Inventario</h1>
                <p className="text-slate-500 text-sm mt-1">Monitorea y actualiza rápidamente los niveles de stock de tus productos.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <StockRow key={product.id} product={product} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
