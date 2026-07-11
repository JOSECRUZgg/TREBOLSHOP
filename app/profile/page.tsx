'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logoutAction, updateUserPreferences, getUserOrders } from '@/lib/actions'
import { getAddresses, addAddress, deleteAddress, setDefaultAddress } from '@/lib/address-actions'
import { getStyles, getMaterials } from '@/lib/attribute-actions'
import { User, MapPin, Package, Settings, LogOut, Plus, Trash2, CheckCircle2, Home, Sparkles, Save, X, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Header } from '@/components/header'
import Link from 'next/link'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [addresses, setAddresses] = useState<any[]>([])
    const [userOrders, setUserOrders] = useState<any[]>([])
    const [styles, setStyles] = useState<any[]>([])
    const [materials, setMaterials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [showStyleForm, setShowStyleForm] = useState(false)

    useEffect(() => {
        loadProfile()
    }, [router])

    const loadProfile = async () => {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (!data || !data.user) {
            router.push('/login')
        } else {
            setUser(data.user)
            loadAddresses()
            loadAttributes()
            const orders = await getUserOrders()
            setUserOrders(orders)
        }
        setLoading(false)
    }

    const loadAttributes = async () => {
        const s = await getStyles()
        const m = await getMaterials()
        setStyles(s)
        setMaterials(m)
    }

    const handleUpdatePreferences = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = {
            favoriteStyle: formData.get('favoriteStyle') as string,
            headSize: formData.get('headSize') as string,
            favoriteMaterial: formData.get('favoriteMaterial') as string
        }

        startTransition(async () => {
            const result = await updateUserPreferences(user.id, data)
            if (result.success) {
                setUser({ ...user, ...data })
                setShowStyleForm(false)
            } else {
                alert(result.error)
            }
        })
    }

    const loadAddresses = async () => {
        const data = await getAddresses()
        setAddresses(data)
    }

    const handleLogout = async () => {
        await logoutAction()
        router.push('/')
    }

    const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            await addAddress(formData)
            await loadAddresses()
            setShowAddressForm(false)
        })
    }

    const handleDeleteAddress = async (id: string) => {
        startTransition(async () => {
            await deleteAddress(id)
            await loadAddresses()
        })
    }

    const handleSetDefault = async (id: string) => {
        startTransition(async () => {
            await setDefaultAddress(id)
            await loadAddresses()
        })
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-black animate-spin"></div>
                    <p className="font-medium text-slate-500">Cargando tu perfil...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Header session={{ user }} />

            <main className="container mx-auto px-4 py-8 md:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* User Header */}
                    <div className="mb-8 flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white">
                            {user.name?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                            <p className="text-slate-500">{user.email}</p>
                            <div className="mt-2 flex gap-2 justify-center md:justify-start">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-none px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                                    {user.role === 'CUSTOMER' ? 'CLIENTE' : user.role === 'ADMIN' ? 'ADMINISTRADOR' : 'EMPLEADO'}
                                </Badge>
                                <Badge variant="outline" className="text-slate-500 border-slate-200 text-[10px] font-black uppercase tracking-wider">
                                    Cuenta Verificada
                                </Badge>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="rounded-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all font-bold">
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar Sesión
                        </Button>
                    </div>

                    <Tabs defaultValue="info" className="space-y-6">
                        <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto h-auto">
                            <TabsTrigger value="info" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white transition-all font-bold uppercase text-[10px] tracking-widest">
                                <User className="h-4 w-4 mr-2" />
                                Mi Info
                            </TabsTrigger>
                            <TabsTrigger value="addresses" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white transition-all font-bold uppercase text-[10px] tracking-widest">
                                <MapPin className="h-4 w-4 mr-2" />
                                Direcciones
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white transition-all font-bold uppercase text-[10px] tracking-widest">
                                <Package className="h-4 w-4 mr-2" />
                                Mis Pedidos
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="info">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-none shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="font-black uppercase text-xl">Detalles de la Cuenta</CardTitle>
                                        <CardDescription className="font-medium">Gestiona tu información personal</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                                            <p className="text-lg font-bold text-slate-800">{user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correo Electrónico</p>
                                            <p className="text-lg font-bold text-slate-800">{user.email}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Settings className="h-20 w-20" />
                                    </div>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                        <div>
                                            <CardTitle className="text-white font-black uppercase text-xl">Perfil de Estilo</CardTitle>
                                            <CardDescription className="text-slate-400 font-medium">Tus preferencias de compra</CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowStyleForm(!showStyleForm)}
                                            className="text-white hover:bg-white/10 rounded-full"
                                        >
                                            {showStyleForm ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {showStyleForm ? (
                                            <form onSubmit={handleUpdatePreferences} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Estilo Favorito</label>
                                                    <select
                                                        name="favoriteStyle"
                                                        defaultValue={user.favoriteStyle || "Snapback"}
                                                        className="w-full bg-white/10 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-1 focus:ring-orange-500 outline-none"
                                                    >
                                                        {styles.length > 0 ? (
                                                            styles.map(s => (
                                                                <option key={s.id} value={s.name} className="bg-slate-900">{s.name}</option>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <option value="Snapback" className="bg-slate-900">Snapback</option>
                                                                <option value="Trucker" className="bg-slate-900">Trucker</option>
                                                                <option value="Dad Hat" className="bg-slate-900">Dad Hat</option>
                                                                <option value="Fitted" className="bg-slate-900">Fitted</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Talla de Cabeza</label>
                                                    <Input
                                                        name="headSize"
                                                        defaultValue={user.headSize || "7 1/4 (L)"}
                                                        placeholder="Ej. 7 1/4 (L)"
                                                        className="bg-white/10 border-none h-10 rounded-xl font-bold placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-orange-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Material Preferido</label>
                                                    <select
                                                        name="favoriteMaterial"
                                                        defaultValue={user.favoriteMaterial || "Algodón"}
                                                        className="w-full bg-white/10 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-1 focus:ring-orange-500 outline-none"
                                                    >
                                                        {materials.length > 0 ? (
                                                            materials.map(m => (
                                                                <option key={m.id} value={m.name} className="bg-slate-900">{m.name}</option>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <option value="Algodón" className="bg-slate-900">Algodón</option>
                                                                <option value="Poliéster" className="bg-slate-900">Poliéster</option>
                                                                <option value="Lana" className="bg-slate-900">Lana</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                                                <Button type="submit" disabled={isPending} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest h-11 rounded-xl">
                                                    {isPending ? 'Guardando...' : <><Save className="h-3 w-3 mr-2" /> Guardar Perfil</>}
                                                </Button>
                                            </form>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estilo Favorito</span>
                                                    <Badge className="bg-orange-500 text-white border-none font-black text-[10px] uppercase">{user.favoriteStyle || "SNAPBACK"}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Talla de Cabeza</span>
                                                    <span className="font-black">{user.headSize || "7 1/4 (L)"}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Material Preferido</span>
                                                    <span className="font-black uppercase">{user.favoriteMaterial || "ALGODÓN / LANA"}</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    {!showStyleForm && (
                                        <CardFooter className="bg-white/5 border-t border-white/10 mt-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowStyleForm(true)}
                                                className="w-full text-white hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                                            >
                                                Editar Preferencias
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="addresses">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Mis Direcciones</h2>
                                    <Button onClick={() => setShowAddressForm(!showAddressForm)} disabled={isPending} className="rounded-full bg-black hover:bg-slate-800 text-white transition-all font-bold px-6">
                                        {showAddressForm ? 'Cancelar' : <><Plus className="h-4 w-4 mr-2" /> Agregar Dirección</>}
                                    </Button>
                                </div>

                                {showAddressForm && (
                                    <Card className="border-none shadow-md rounded-3xl p-6 mb-6">
                                        <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Alias de Dirección (ej. Casa, Oficina)</label>
                                                <Input name="name" required placeholder="Mi Casa" className="font-bold" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Calle y Número</label>
                                                <Input name="street" required placeholder="Av. Principal 123" className="font-bold" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Ciudad</label>
                                                <Input name="city" required placeholder="Ciudad" className="font-bold" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Estado</label>
                                                <Input name="state" required placeholder="Estado" className="font-bold" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Código Postal</label>
                                                <Input name="postalCode" required placeholder="12345" className="font-bold" />
                                            </div>
                                            <div className="flex items-center gap-2 pt-6">
                                                <input type="checkbox" name="isDefault" id="isDefault" className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black" />
                                                <label htmlFor="isDefault" className="text-xs font-bold uppercase tracking-wider text-slate-600">Dirección predeterminada</label>
                                            </div>
                                            <div className="md:col-span-2 flex justify-end gap-2">
                                                <Button type="submit" disabled={isPending} className="rounded-full bg-black text-white hover:bg-slate-800 transition-all font-black px-10 h-12 uppercase tracking-widest text-xs">
                                                    {isPending ? 'Guardando...' : 'Guardar Dirección'}
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>
                                )}

                                <div className="grid md:grid-cols-3 gap-6">
                                    {addresses.length === 0 ? (
                                        <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="font-bold uppercase text-xs tracking-widest">No hay direcciones guardadas.</p>
                                        </div>
                                    ) : (
                                        addresses.map((addr) => (
                                            <Card key={addr.id} className={`border-none shadow-sm rounded-3xl p-6 relative ${addr.isDefault ? 'bg-slate-50 ring-1 ring-black/5' : ''}`}>
                                                {addr.isDefault && (
                                                    <Badge className="absolute top-4 right-4 bg-black text-white px-3 py-0 border-none text-[8px] font-black tracking-widest uppercase">PRINCIPAL</Badge>
                                                )}
                                                <h4 className="font-black text-slate-900 mb-2 truncate flex items-center gap-2 uppercase tracking-tight">
                                                    <Home className="h-4 w-4 text-slate-400" />
                                                    {addr.name}
                                                </h4>
                                                <div className="text-sm font-medium text-slate-500 mb-4 space-y-0.5">
                                                    <p>{addr.street}</p>
                                                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                                                    <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest">{addr.country === 'Mexico' ? 'MÉXICO' : addr.country}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!addr.isDefault && (
                                                        <Button variant="link" size="sm" onClick={() => handleSetDefault(addr.id)} className="p-0 h-auto text-[10px] font-black text-slate-500 hover:text-black uppercase tracking-wider">
                                                            Hacer Principal
                                                        </Button>
                                                    )}
                                                    <Button variant="link" size="sm" onClick={() => handleDeleteAddress(addr.id)} className="p-0 h-auto text-[10px] font-black text-red-400 hover:text-red-500 ml-auto uppercase tracking-wider">
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders">
                            {userOrders.length === 0 ? (
                                <Card className="border-none shadow-sm rounded-3xl p-12 text-center bg-white">
                                    <div className="max-w-xs mx-auto">
                                        <Package className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Sin pedidos aún</h3>
                                        <p className="text-slate-500 font-medium mb-6">No has realizado ningún pedido todavía. ¡Empieza a comprar para ver tu historial!</p>
                                        <Button asChild className="rounded-full bg-black hover:bg-slate-800 text-white transition-all px-10 h-12 uppercase font-black tracking-widest text-xs">
                                            <Link href="/">Ir a la Tienda</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Mi Historial de Pedidos</h2>
                                    {userOrders.map((order) => (
                                        <Card key={order.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                                            <CardHeader className="bg-slate-50/50 flex flex-row justify-between items-center py-4 px-6 border-b border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-900 border border-slate-100">
                                                        <ShoppingBag className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                                                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {new Date(order.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`rounded-full px-4 py-1 border-none font-black text-[10px] uppercase tracking-widest ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {order.status === 'COMPLETED' ? 'Aprobado' : order.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                    <div className="flex-1 space-y-4">
                                                        {order.items.map((item: any) => (
                                                            <div key={item.id} className="flex items-center gap-4">
                                                                <div className="h-14 w-14 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                                                                    {item.product?.imageUrl && (
                                                                        <img
                                                                            src={item.product.imageUrl}
                                                                            alt={item.product.name}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900 leading-tight">{item.product?.name || 'Producto'}</p>
                                                                    <p className="text-xs font-medium text-slate-500">{item.quantity} qnd. × ${Number(item.price).toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="w-full md:w-auto text-left md:text-right pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Abonado</p>
                                                        <p className="text-2xl font-black italic tracking-tighter text-slate-900">${order.total.toFixed(2)}</p>
                                                        <div className="flex items-center md:justify-end gap-1 mt-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{order.paymentMethod}</p>
                                                            {order.status === 'COMPLETED' && <CheckCircle size={10} className="text-green-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}
