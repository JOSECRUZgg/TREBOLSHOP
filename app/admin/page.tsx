import { getAdminStats } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, ShoppingBag, Users, DollarSign } from "lucide-react"

export default async function AdminDashboard() {
    const stats = await getAdminStats()

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">Panel de Control</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total de Productos</CardTitle>
                        <Package className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.productCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Ventas Totales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.saleCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Clientes</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customerCount}</div>
                    </CardContent>
                </Card>
            </div>

            {stats.lowStockCount > 0 && (
                <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-sm flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 h-6 w-6 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-amber-800 text-lg">Alerta de Stock Bajo</h3>
                        <p className="text-amber-700">
                            Hay <strong>{stats.lowStockCount}</strong> productos con stock bajo (5 o menos).
                            Por favor, revisa la página de Inventario.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
