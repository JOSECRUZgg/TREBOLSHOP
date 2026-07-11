'use client'

import { useCart } from "@/hooks/use-cart"
import { Button } from "./ui/button"
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { syncCartPrices } from "@/lib/actions"

export function CartDrawer({ session }: { session: any }) {
    const { items, updateQuantity, removeItem, getTotal, getItemCount, isDrawerOpen, closeDrawer, syncPrices } = useCart()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    const handleSync = useCallback(async () => {
        if (items.length === 0) return
        try {
            const serverPrices = await syncCartPrices(items.map(i => i.id))
            syncPrices(serverPrices)
        } catch (error) {
            console.error("Error syncing prices:", error)
        }
    }, [items, syncPrices])

    useEffect(() => {
        setMounted(true)
        if (isDrawerOpen) {
            handleSync()
        }
    }, [isDrawerOpen, handleSync])

    if (!mounted) return null

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 z-[110] h-full w-full max-w-md bg-[#fafafa] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 bg-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-xl">
                                    <ShoppingBag className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Tu Carrito</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {getItemCount()} {getItemCount() === 1 ? 'artículo' : 'artículos'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                                    <div className="w-24 h-24 rounded-[2rem] bg-white shadow-sm flex items-center justify-center mb-6">
                                        <ShoppingBag className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Tu carrito está vacío</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                                        Parece que aún no has añadido ninguna gorra a tu colección.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            closeDrawer()
                                            router.push('/')
                                        }}
                                        className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] transition-all"
                                    >
                                        Explorar Tienda
                                    </Button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={item.id}
                                        className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex gap-4 group hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="h-24 w-24 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-3xl overflow-hidden relative">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                "🧢"
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-[11px] leading-tight mb-1 group-hover:text-orange-600 transition-colors">
                                                        {item.commercialName || item.name}
                                                    </h3>
                                                    <p className="text-sm font-black text-slate-900">${item.price.toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-slate-200 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="h-7 w-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-500 hover:text-slate-900"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-[10px] font-black text-slate-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="h-7 w-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-500 hover:text-slate-900"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Total: <span className="text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-8 bg-white border-t border-slate-100 space-y-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-slate-900 font-black">${getTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">Total</span>
                                        <span className="text-2xl font-black text-slate-900 tracking-tighter">${getTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        onClick={() => {
                                            if (!session) {
                                                closeDrawer()
                                                router.push('/login?callbackUrl=/checkout')
                                                return
                                            }
                                            closeDrawer()
                                            router.push('/checkout')
                                        }}
                                        className="w-full h-16 rounded-[1.25rem] bg-black hover:bg-orange-600 text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-xl group transition-all duration-500"
                                    >
                                        <span className="flex items-center gap-2">
                                            Finalizar Pedido <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Button>
                                    <p className="text-[9px] font-black text-slate-300 text-center uppercase tracking-[0.2em] leading-relaxed">
                                        Garantía de calidad CAPS STORE • Envíos seguros a todo el país
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
