'use client'

import { createPendingOrder } from "@/lib/actions"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowLeft, CheckCircle2, MessageSquare, Loader2, Receipt, Share2, Copy, Check } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function CheckoutPage() {
    const { items, getTotal, clearCart } = useCart()
    const [isLoading, setIsLoading] = useState(false)
    const [showTicket, setShowTicket] = useState(false)
    const [orderId] = useState(`CAPS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`)
    const [isCopied, setIsCopied] = useState(false)
    const [purchasedItems, setPurchasedItems] = useState<any[]>([])
    const [purchasedTotal, setPurchasedTotal] = useState(0)

    const ticketRef = useRef<HTMLDivElement>(null)

    const handleConfirmOrder = async () => {
        if (items.length === 0) return
        setIsLoading(true)
        try {
            const total = getTotal()
            const itemsCopy = [...items]

            await createPendingOrder({
                total: total,
                items: itemsCopy,
                paymentMethod: 'WhatsApp'
            })

            setPurchasedItems(itemsCopy)
            setPurchasedTotal(total)
            setShowTicket(true)
            clearCart()
        } catch (error) {
            console.error("Error creating order:", error)
            alert("Ocurrió un error al procesar tu pedido. Por favor intenta de nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    const generateWhatsAppLink = () => {
        const phoneNumber = "524481106992"
        const itemsToUse = showTicket ? purchasedItems : items
        const totalToUse = showTicket ? purchasedTotal : getTotal()

        const itemsText = itemsToUse.map(item => `• ${item.commercialName || item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('%0A')
        const message = `Hola! Quiero realizar el siguiente pedido:%0A%0A*Orden:* ${orderId}%0A*Productos:*%0A${itemsText}%0A%0A*Total:* $${totalToUse.toFixed(2)}%0A%0AGracias!`
        return `https://wa.me/${phoneNumber}?text=${message}`
    }

    const copyToClipboard = () => {
        const itemsToUse = showTicket ? purchasedItems : items
        const totalToUse = showTicket ? purchasedTotal : getTotal()

        const itemsText = itemsToUse.map(item => `• ${item.commercialName || item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')
        const textToCopy = `ORDEN: ${orderId}\nPRODUCTOS:\n${itemsText}\nTOTAL: $${totalToUse.toFixed(2)}`
        navigator.clipboard.writeText(textToCopy)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    if (items.length === 0 && !showTicket) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center mx-auto text-4xl text-black">
                        🛒
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Tu carrito está vacío</h1>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">
                        No puedes realizar un pedido sin productos. ¡Vuelve a la tienda y elige tus gorras favoritas!
                    </p>
                    <Link href="/">
                        <Button className="h-14 px-8 rounded-2xl bg-black text-white font-black uppercase text-xs tracking-widest hover:scale-105 transition-all">
                            Ir a la Tienda
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafa] py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {!showTicket ? (
                        <motion.div
                            key="checkout-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-12"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <Link href="/" className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-slate-900">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Checkout</h1>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pago vía WhatsApp Venta Directa</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Resumen de Productos */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                            <span className="p-2 bg-orange-50 rounded-xl">
                                                <ShoppingBag className="h-5 w-5 text-orange-600" />
                                            </span>
                                            Resumen del Pedido
                                        </h2>

                                        <div className="space-y-6">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex gap-6 items-center">
                                                    <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            "🧢"
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-tight">{item.commercialName || item.name}</h3>
                                                        <p className="text-xs font-bold text-slate-400 mt-1">Cantidad: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                            <span className="p-2 bg-green-50 rounded-xl">
                                                <MessageSquare className="h-5 w-5 text-green-600" />
                                            </span>
                                            Método de Pago
                                        </h2>
                                        <div className="p-6 rounded-[2rem] border-2 border-black bg-slate-50 relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <CheckCircle2 className="h-6 w-6 text-green-600 mb-4" />
                                                <p className="font-black uppercase text-xs tracking-widest text-slate-900">Venta Directa WhatsApp</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2">Te generamos un ticket y finalizamos por WhatsApp</p>
                                            </div>
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                                <MessageSquare className="h-12 w-12" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Total y Acción */}
                                <div className="lg:col-span-5">
                                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-50 sticky top-8">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Total a Pagar</h2>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Subtotal</span>
                                                <span className="text-slate-900 font-black">${getTotal().toFixed(2)}</span>
                                            </div>
                                            <div className="pt-4 border-t-2 border-slate-50 flex justify-between items-center">
                                                <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Total</span>
                                                <span className="text-4xl font-black text-slate-900 tracking-tighter">${getTotal().toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleConfirmOrder}
                                            disabled={isLoading}
                                            className="w-full h-18 rounded-2xl bg-black hover:bg-[#25D366] text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center gap-2">
                                                    Generando Ticket <Loader2 className="h-4 w-4 animate-spin" />
                                                </span>
                                            ) : 'Confirmar Pedido'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ticket-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">¡Pedido Listo!</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Muestra este ticket en WhatsApp</p>
                            </div>

                            {/* TICKET MAMALON */}
                            <div className="relative">
                                {/* Decoraciones del ticket */}
                                <div className="absolute -left-3 top-20 w-6 h-6 bg-[#fafafa] rounded-full z-10 shadow-inner" />
                                <div className="absolute -right-3 top-20 w-6 h-6 bg-[#fafafa] rounded-full z-10 shadow-inner" />

                                <div
                                    ref={ticketRef}
                                    className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative"
                                >
                                    {/* Logo / Header del Ticket */}
                                    <div className="bg-black p-8 text-center text-white">
                                        <p className="text-4xl mb-2 font-black italic tracking-tighter">CAPS STORE</p>
                                        <div className="h-px w-12 bg-orange-500 mx-auto mb-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Ticket de Venta</p>
                                    </div>

                                    {/* Contenido del Ticket */}
                                    <div className="p-8 space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orden ID</p>
                                                <p className="font-black text-slate-900 text-lg">{orderId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                                                <p className="font-bold text-slate-900 text-xs">{new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-dashed border-slate-200 pt-6">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Receipt className="h-3 w-3" /> Detalle de Compra
                                            </p>
                                            <div className="space-y-3">
                                                {purchasedItems.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center text-xs">
                                                        <span className="text-slate-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                                                            {item.commercialName || item.name} <span className="text-slate-300">x{item.quantity}</span>
                                                        </span>
                                                        <span className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-6 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total a Pagar</span>
                                                <span className="text-3xl font-black text-slate-900 tracking-tighter">${purchasedTotal.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Escanea o comparte para finalizar</p>
                                        </div>
                                    </div>

                                    {/* Footer del Ticket (Dientes) */}
                                    <div className="flex justify-center gap-2 mb-2">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="w-4 h-2 bg-slate-100 rounded-full mt-[-4px]" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="mt-8 space-y-4">
                                <a
                                    href={generateWhatsAppLink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full h-16 bg-[#25D366] hover:bg-[#1eb956] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all hover:scale-[1.02]"
                                >
                                    <Share2 className="h-5 w-5" /> Enviar por WhatsApp
                                </a>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center justify-center gap-2 h-14 bg-white border-2 border-slate-100 hover:border-black text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        {isCopied ? 'Copiado' : 'Copiar Texto'}
                                    </button>
                                    <Link
                                        href="/"
                                        className="flex items-center justify-center gap-2 h-14 bg-white border-2 border-slate-100 hover:border-black text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Volver
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
