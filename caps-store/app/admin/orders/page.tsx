'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getOrders, updateOrder, getReportStats, getProducts } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ShoppingBag, Clock, CheckCircle, XCircle, User,
    Calendar, Receipt, ChevronDown, ChevronUp,
    TrendingUp, BarChart3, Download, Search, Edit2, Plus, Minus, Trash2, RefreshCcw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [reportData, setReportData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('pending')

    // Editing state
    const [editingOrder, setEditingOrder] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    // Filters
    const [filters, setFilters] = useState({
        status: 'ALL',
        customerName: '',
        startDate: '',
        endDate: ''
    })

    const fetchOrders = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await getOrders({
                status: activeTab === 'pending' ? 'PENDING' : filters.status,
                startDate: filters.startDate,
                endDate: filters.endDate,
                customerName: filters.customerName
            })
            setOrders(data)

            if (activeTab === 'reports') {
                const stats = await getReportStats({
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    customerName: filters.customerName
                })
                setReportData(stats)
            }
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setIsLoading(false)
        }
    }, [activeTab, filters])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts()
                setProducts(data)
            } catch (error) {
                console.error("Error fetching products:", error)
            }
        }
        fetchProducts()
    }, [])

    const handleUpdateOrderItems = async () => {
        if (!editingOrder) return
        setIsLoading(true)
        try {
            await updateOrder(editingOrder.id, {
                items: editingOrder.items.map((item: any) => ({
                    productId: item.productId || item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            })
            setEditingOrder(null)
            fetchOrders()
            alert('Pedido actualizado con éxito.')
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsLoading(false)
        }
    }


    const handleConfirm = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres confirmar este pedido? Se descontará del inventario.')) return
        try {
            await updateOrder(id, { status: 'COMPLETED' })
            fetchOrders()
            alert('Pedido confirmado y stock actualizado.')
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleCancel = async (id: string) => {
        if (!confirm('¿Estas seguro de que quieres cancelar este pedido?')) return
        try {
            await updateOrder(id, { status: 'CANCELLED' })
            fetchOrders()
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleResetFilters = () => {
        setFilters({
            status: activeTab === 'pending' ? 'PENDING' : 'ALL',
            customerName: '',
            startDate: '',
            endDate: ''
        })
    }

    const handleExport = () => {
        if (!reportData?.sales || reportData.sales.length === 0) {
            alert('No hay datos para exportar.')
            return
        }

        const headers = ['ID', 'Fecha', 'Total', 'Metodo de Pago', 'Estado']
        const rows = reportData.sales.map((sale: any) => [
            sale.id,
            new Date(sale.date).toLocaleString(),
            sale.total.toFixed(2),
            sale.paymentMethod,
            sale.status
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map((row: any) => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Pedidos</h1>
                    <p className="text-slate-500 text-sm mt-1">Administra tus ventas, historial y reportes financieros.</p>
                </div>
            </div>

            {/* Filters Bar */}
            {activeTab === 'all' && (
                <Card className="border-none shadow-sm bg-white overflow-visible rounded-[1.5rem]">
                    <CardContent className="p-4 flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[240px] relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre de cliente..."
                                value={filters.customerName}
                                onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 ml-auto md:ml-0">
                            <Button
                                onClick={handleResetFilters}
                                variant="ghost"
                                className="rounded-xl h-9 px-4 text-slate-500 hover:text-slate-900 font-medium text-sm gap-2 transition-colors"
                            >
                                <RefreshCcw size={16} />
                                Reiniciar
                            </Button>

                            <Button
                                onClick={() => fetchOrders()}
                                disabled={isLoading}
                                className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-9 px-6 font-medium text-sm shadow-sm transition-all disabled:opacity-50"
                            >
                                <Search size={16} className="mr-2" />
                                {isLoading ? 'Filtrando...' : 'Filtrar'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 h-12 w-full md:w-auto gap-1">
                    <TabsTrigger value="pending" className="rounded-xl px-6 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 font-medium text-sm h-full transition-all">
                        Pendientes
                    </TabsTrigger>
                    <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-medium text-sm h-full transition-all">
                        Historial
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="rounded-xl px-6 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 font-medium text-sm h-full transition-all">
                        Reportes
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="pending" className="mt-0">
                        <OrderList
                            orders={orders}
                            expandedOrder={expandedOrder}
                            setExpandedOrder={setExpandedOrder}
                            handleConfirm={handleConfirm}
                            handleCancel={handleCancel}
                            setEditingOrder={setEditingOrder}
                            isLoading={isLoading}
                        />
                    </TabsContent>

                    <TabsContent value="all" className="mt-0">
                        <OrderList
                            orders={orders}
                            expandedOrder={expandedOrder}
                            setExpandedOrder={setExpandedOrder}
                            handleConfirm={handleConfirm}
                            handleCancel={handleCancel}
                            setEditingOrder={setEditingOrder}
                            isLoading={isLoading}
                        />
                    </TabsContent>

                    <TabsContent value="reports" className="mt-0 space-y-8">
                        {reportData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg rounded-2xl">
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="font-medium text-sm text-slate-300">Ingresos Totales</p>
                                            <div className="p-2 bg-white/10 rounded-lg">
                                                <ShoppingBag className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-4xl font-bold tracking-tight">${reportData.totalRevenue.toFixed(2)}</h3>
                                        <p className="text-sm mt-4 text-slate-400">Total Acumulado</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="font-medium text-sm text-slate-500">Ventas Realizadas</p>
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{reportData.saleCount}</h3>
                                        <div className="mt-4 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium text-green-600">Órdenes Completadas</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <Card className="bg-white border-none shadow-sm overflow-hidden rounded-[2rem]">
                            <CardHeader className="p-8 border-b border-slate-50 flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="font-black uppercase tracking-widest text-xs">Ventas Detalladas</CardTitle>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">Lista de transacciones en el periodo</p>
                                </div>
                                <Button
                                    onClick={handleExport}
                                    variant="outline"
                                    className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 h-10"
                                >
                                    <Download size={14} /> Exportar
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-8 py-4 font-black uppercase text-[9px] tracking-widest text-slate-400">Fecha</th>
                                                <th className="px-8 py-4 font-black uppercase text-[9px] tracking-widest text-slate-400">Importe</th>
                                                <th className="px-8 py-4 font-black uppercase text-[9px] tracking-widest text-slate-400">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {reportData?.sales?.map((sale: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-4 text-xs font-bold text-slate-600">
                                                        {new Date(sale.date).toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-4 text-sm font-black text-slate-900">
                                                        ${sale.total.toFixed(2)}
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <Badge className="bg-green-100 text-green-600 border-none font-bold text-[9px]">Aprobada</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!reportData?.sales || reportData.sales.length === 0) && (
                                                <tr>
                                                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-bold text-sm">
                                                        No hay datos para mostrar en este rango de fechas.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setEditingOrder(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Editar Pedido</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {editingOrder.id.substring(0, 12)}</p>
                                </div>
                                <Button variant="ghost" onClick={() => setEditingOrder(null)} className="rounded-full hover:bg-slate-100 h-10 w-10 p-0">
                                    <XCircle size={24} className="text-slate-400" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Productos en el Pedido</h3>
                                    <div className="space-y-4">
                                        {editingOrder.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                                <div className="h-14 w-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {item.product?.imageUrl ? <img src={item.product.imageUrl} className="h-full w-full object-cover" /> : "🧢"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-slate-900 text-xs uppercase truncate">{item.product?.commercialName || item.product?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">${item.price.toFixed(2)} c/u</p>
                                                </div>
                                                <div className="flex items-center bg-white rounded-xl border border-slate-100 h-10 px-1">
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...editingOrder.items]
                                                            if (newItems[idx].quantity > 1) {
                                                                newItems[idx].quantity--
                                                                setEditingOrder({ ...editingOrder, items: newItems })
                                                            }
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400"
                                                    ><Minus size={14} /></button>
                                                    <span className="w-8 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...editingOrder.items]
                                                            newItems[idx].quantity++
                                                            setEditingOrder({ ...editingOrder, items: newItems })
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-900 font-bold"
                                                    ><Plus size={14} /></button>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newItems = editingOrder.items.filter((_: any, i: number) => i !== idx)
                                                        setEditingOrder({ ...editingOrder, items: newItems })
                                                    }}
                                                    className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-slate-900 rounded-[1.5rem] text-white flex justify-between items-center">
                                        <p className="font-black uppercase text-[10px] tracking-widest opacity-60">Nuevo Total</p>
                                        <p className="text-2xl font-black italic">
                                            ${editingOrder.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Añadir Productos</h3>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar producto por nombre..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-black outline-none"
                                        />
                                    </div>
                                    <div className="h-[300px] overflow-y-auto space-y-2 pr-2">
                                        {products.filter(p => (p.commercialName || p.name).toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => {
                                                    const exists = editingOrder.items.find((i: any) => (i.productId || i.id) === product.id)
                                                    if (exists) {
                                                        const newItems = editingOrder.items.map((i: any) =>
                                                            (i.productId || i.id) === product.id ? { ...i, quantity: i.quantity + 1 } : i
                                                        )
                                                        setEditingOrder({ ...editingOrder, items: newItems })
                                                    } else {
                                                        setEditingOrder({
                                                            ...editingOrder,
                                                            items: [...editingOrder.items, {
                                                                productId: product.id,
                                                                product: product,
                                                                quantity: 1,
                                                                price: product.price
                                                            }]
                                                        })
                                                    }
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 text-left group"
                                            >
                                                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden font-bold">
                                                    {product.imageUrl ? <img src={product.imageUrl} className="h-full w-full object-cover" /> : "🧢"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-900 truncate uppercase group-hover:text-black">{product.commercialName || product.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">${product.price.toFixed(2)} • Stock: {product.quantity}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-all bg-black text-white p-1.5 rounded-lg">
                                                    <Plus size={14} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setEditingOrder(null)}
                                    className="font-black uppercase text-[10px] tracking-widest px-8"
                                >Cancelar</Button>
                                <Button
                                    onClick={handleUpdateOrderItems}
                                    className="bg-black hover:bg-slate-800 text-white rounded-2xl h-14 px-10 font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10"
                                >Guardar Cambios</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function OrderList({ orders, expandedOrder, setExpandedOrder, handleConfirm, handleCancel, setEditingOrder, isLoading }: any) {
    if (isLoading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <Card className="border-dashed border-2 bg-slate-50/50 rounded-[2rem]">
                <CardContent className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <ShoppingBag size={48} className="opacity-20" />
                    <p className="font-bold">No se encontraron pedidos con estos filtros.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {orders.map((order: any) => (
                <Card key={order.id} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 bg-white rounded-2xl group">
                    <div
                        className="p-5 md:p-6 cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${order.status === 'PENDING' ? 'bg-orange-100/50 text-orange-600 group-hover:bg-orange-100' :
                                    order.status === 'COMPLETED' ? 'bg-green-100/50 text-green-600 group-hover:bg-green-100' : 'bg-red-100/50 text-red-600 group-hover:bg-red-100'
                                    }`}>
                                    {order.status === 'PENDING' ? <Clock size={22} /> :
                                        order.status === 'COMPLETED' ? <CheckCircle size={22} /> : <XCircle size={22} />}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PEDIDO {order.status === 'PENDING' ? 'PENDIENTE' : order.status === 'COMPLETED' ? 'COMPLETADO' : 'CANCELADO'}</p>
                                    <p className="font-bold text-slate-900 text-lg">{order.id.substring(0, 12).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 tracking-wide">Cliente</p>
                                    <p className="font-semibold text-slate-800 text-sm">{order.user?.name || 'Venta Directa'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 tracking-wide">Fecha</p>
                                    <p className="font-semibold text-slate-800 text-sm">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xs font-medium text-slate-500 tracking-wide">Total</p>
                                <p className="text-xl font-bold text-slate-900">${order.total.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                                {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {expandedOrder === order.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-slate-50 bg-slate-50/20 overflow-hidden"
                            >
                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <Receipt size={14} className="text-black" />
                                                Detalles de Productos
                                            </h3>
                                            <div className="space-y-3">
                                                {order.items.map((item: any) => (
                                                    <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                                                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {item.product?.imageUrl ? (
                                                                <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                                                            ) : "🧢"}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-black text-slate-900 uppercase text-[10px] tracking-tight">{item.product?.commercialName || item.product?.name}</p>
                                                            <p className="text-xs text-slate-400 font-bold">Cantidad: {item.quantity} x ${item.price.toFixed(2)}</p>
                                                        </div>
                                                        <p className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Estado y Acciones</h3>

                                            <div className="p-6 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado de Pago</p>
                                                    <Badge className={`${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                        } border-none font-bold capitalize`}>
                                                        {order.status === 'PENDING' ? 'Pendiente' :
                                                            order.status === 'COMPLETED' ? 'Aprobado' : 'Cancelado'}
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Método</p>
                                                    <p className="font-bold text-slate-900 text-xs">{order.paymentMethod}</p>
                                                </div>
                                            </div>

                                            {order.status === 'PENDING' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingOrder(order)
                                                        }}
                                                        variant="outline"
                                                        className="h-16 rounded-2xl border-2 border-slate-100 text-slate-900 hover:bg-slate-50 font-black uppercase text-xs tracking-widest gap-2"
                                                    >
                                                        <Edit2 size={20} /> Editar Pedido
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleConfirm(order.id)}
                                                        className="h-16 rounded-2xl bg-black hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest gap-2"
                                                    >
                                                        <CheckCircle size={20} /> Confirmar Venta
                                                    </Button>
                                                </div>
                                            )}

                                            {order.status === 'PENDING' && (
                                                <Button
                                                    onClick={() => handleCancel(order.id)}
                                                    variant="ghost"
                                                    className="w-full h-12 text-slate-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest"
                                                >
                                                    Cancelar este pedido por completo
                                                </Button>
                                            )}

                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                                                    <span className="font-black uppercase tracking-widest text-slate-900 block mb-1">Información de Sistema:</span>
                                                    Pedido realizado por {order.user?.email || 'Vendedor Directo'}.
                                                    ID: {order.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            ))}
        </div>
    )
}
