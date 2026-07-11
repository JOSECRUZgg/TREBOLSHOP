'use client'

import { useState, useEffect } from 'react'
import { getProducts, createSale, getEmployeeByDni } from '@/lib/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, ShoppingCart, User, CreditCard, Banknote } from "lucide-react"

// Types
type Product = Awaited<ReturnType<typeof getProducts>>['products'][0]
type CartItem = Product & { quantity: number }

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [employeeId, setEmployeeId] = useState('') // This is the DNI input
    const [loading, setLoading] = useState(false)

    // Load products on mount
    useEffect(() => {
        getProducts({}).then(res => setProducts(res.products))
    }, [])

    // Filter products for search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const addToCart = (product: Product) => {
        // Check stock
        const currentInCart = cart.find(i => i.id === product.id)?.quantity || 0
        if (currentInCart + 1 > product.quantity) {
            alert("Not enough stock!")
            return
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const getTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    const handleCheckout = async (method: 'Cash' | 'Card') => {
        if (!employeeId) {
            alert("Please enter Employee DNI")
            return
        }
        if (cart.length === 0) return

        setLoading(true)
        try {
            const emp = await getEmployeeByDni(employeeId)
            if (!emp) {
                alert("Employee not found with this DNI")
                return
            }

            await createSale({
                employeeId: emp.id,
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
                paymentMethod: method
            })

            alert(`Sale Processed Successfully!\nEmployee: ${emp.firstName}\nTotal: $${getTotal().toFixed(2)}`)
            setCart([])

            // Refresh products to show updated stock
            getProducts({}).then(res => setProducts(res.products))
        } catch (e: any) {
            alert("Error processing sale: " + e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
            {/* Left: Product Catalog */}
            <div className="flex-1 flex flex-col p-6 gap-4">
                <header className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl font-bold text-slate-800">Point of Sale</h1>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Scan Barcode / Search Name"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-80 bg-white border-slate-300 shadow-sm"
                            autoFocus
                        />
                    </div>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20 pr-2">
                    {filteredProducts.map(product => (
                        <div key={product.id}
                            onClick={() => addToCart(product)}
                            className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all flex flex-col justify-between
                        ${product.quantity === 0 ? 'opacity-50 grayscale pointer-events-none' : 'hover:border-amber-500 hover:shadow-md'}
                     `}>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="text-xs bg-slate-50">{product.code}</Badge>
                                    <span className="font-bold text-amber-600">${product.price}</span>
                                </div>
                                <h3 className="font-medium line-clamp-2 leading-tight text-slate-800">{product.commercialName || product.name}</h3>
                                <p className="text-xs text-slate-500 mt-1">{product.categoryRef?.name || ''} - {product.styleRef?.name || product.subcategory}</p>
                            </div>
                            <div className={`mt-3 text-xs font-medium ${product.quantity < 5 ? 'text-red-500' : 'text-slate-400'}`}>
                                {product.quantity === 0 ? 'Out of Stock' : `Stock: ${product.quantity}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-96 bg-white border-l shadow-2xl flex flex-col z-10 transition-transform">
                <div className="p-6 border-b bg-slate-50">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Employee DNI (e.g. 12345678A)"
                            value={employeeId}
                            onChange={e => setEmployeeId(e.target.value)}
                            className={`h-8 text-sm ${!employeeId ? 'border-red-200' : ''}`}
                        />
                    </div>
                    <div className="flex justify-between items-end">
                        <h2 className="text-xl font-bold text-slate-800">Current Order</h2>
                        <Badge variant="secondary">{cart.length} items</Badge>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <ShoppingCart className="h-12 w-12 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg group animate-in slide-in-from-right-5 duration-200">
                                <div className="h-10 w-10 bg-white rounded flex items-center justify-center border text-lg shadow-sm">🧢</div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-sm">{item.commercialName || item.name}</div>
                                    <div className="text-xs text-slate-500">${item.price} x {item.quantity}</div>
                                </div>
                                <div className="font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</div>
                                <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t bg-slate-50 space-y-4">
                    <div className="flex justify-between text-2xl font-bold text-slate-900">
                        <span>Total</span>
                        <span>${getTotal().toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            size="lg"
                            className="bg-emerald-600 hover:bg-emerald-700 h-14 text-lg shadow-emerald-200 shadow-md"
                            onClick={() => handleCheckout('Cash')}
                            disabled={loading || cart.length === 0}
                        >
                            <Banknote className="mr-2 h-5 w-5" />
                            Cash
                        </Button>
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 h-14 text-lg shadow-blue-200 shadow-md"
                            onClick={() => handleCheckout('Card')}
                            disabled={loading || cart.length === 0}
                        >
                            <CreditCard className="mr-2 h-5 w-5" />
                            Card
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
