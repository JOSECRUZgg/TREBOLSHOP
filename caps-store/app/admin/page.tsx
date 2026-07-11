import { getAdminStats } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, ShoppingBag, Users, DollarSign, Briefcase, ArrowUpRight, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboard() {
    const stats = await getAdminStats()

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
                <p className="text-slate-500 text-sm mt-1">Resumen general de tu negocio y alertas de sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <Card className="border border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Productos</CardTitle>
                        <Package className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.productCount}</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Ventas Totales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.saleCount}</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Clientes</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customerCount}</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow bg-slate-900 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Trabajadores</CardTitle>
                        <Briefcase className="h-4 w-4 text-slate-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.workerCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Últimos Pedidos</h2>
                        <Button asChild variant="ghost" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                            <Link href="/admin/orders">
                                Ver todos <ArrowUpRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {stats.recentOrders.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 font-medium">No hay pedidos recientes.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {stats.recentOrders.map((order) => (
                                    <div key={order.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                                                order.status === 'PENDING' ? 'bg-orange-100/50 text-orange-600' : 
                                                order.status === 'COMPLETED' ? 'bg-green-100/50 text-green-600' : 'bg-red-100/50 text-red-600'
                                            }`}>
                                                {order.status === 'PENDING' ? <Clock size={18} /> : 
                                                order.status === 'COMPLETED' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{order.customerName}</p>
                                                <p className="text-xs text-slate-500">{order.itemsCount} producto(s) &bull; {new Date(order.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                                            <p className="font-bold text-slate-900">${order.total.toFixed(2)}</p>
                                            <Badge variant="outline" className={`mt-0 sm:mt-1 border-none font-semibold text-[10px] ${
                                                order.status === 'PENDING' ? 'bg-orange-100/50 text-orange-700' : 
                                                order.status === 'COMPLETED' ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'
                                            }`}>
                                                {order.status === 'PENDING' ? 'Pendiente' : order.status === 'COMPLETED' ? 'Aprobado' : 'Cancelado'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Alertas del Sistema</h2>

                    {stats.lowStockCount > 0 ? (
                        <div className="bg-amber-50/80 border border-amber-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100/50 rounded-lg shrink-0">
                                    <AlertTriangle className="text-amber-600 h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-amber-900">Stock Bajo</h3>
                            </div>
                            <p className="text-amber-800 text-sm">
                                Tienes <strong className="font-bold">{stats.lowStockCount}</strong> producto(s) operando en niveles críticos de inventario.
                            </p>
                            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-medium mt-2">
                                <Link href="/admin/stock">Revisar Inventario</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-emerald-100/50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900">Todo en orden</h3>
                                <p className="text-emerald-700 text-sm mt-1">El inventario fluye correctamente.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
