import { getProducts } from "@/lib/actions"
import StockRow from "./stock-row"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminStockPage() {
    const products = await getProducts({ limit: 100 } as any)

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Inventario</h1>
            <p className="text-slate-500 mb-6">Actualiza los niveles de stock directamente a continuación.</p>

            <div className="bg-white rounded-md border shadow-sm max-w-4xl">
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
