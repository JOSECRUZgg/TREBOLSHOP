'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Sparkles } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useState } from "react"
import { ProductDetailModal } from "./product-detail-modal"

interface Product {
    id: string
    name: string
    commercialName: string | null
    price: number
    quantity: number
    quality: string | null
    subcategory: string | null
    style?: string | null
    material?: string | null
    brand?: string | null
    description?: string | null
    audience?: string | null
    imageUrl: string | null
    qualityRef?: { name: string } | null
    styleRef?: { name: string } | null
    materialRef?: { name: string } | null
    categoryRef?: { name: string } | null
}

export function ProductCard({ product }: { product: Product }) {
    const addItem = useCart((state) => state.addItem)
    const [isAdded, setIsAdded] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation()
        addItem(product)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const qualityName = product.qualityRef?.name || product.quality
    const subcategoryName = product.styleRef?.name || product.subcategory

    return (
        <>
            <Card
                className="group relative overflow-hidden border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 rounded-[2rem]"
            >
                <div
                    className="relative aspect-square w-full bg-[#f3f4f6] overflow-hidden cursor-pointer"
                    onClick={() => setShowModal(true)}
                >
                    {/* Image or Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-8xl drop-shadow-2xl">🧢</span>
                        )}
                    </div>

                    {/* Glassmorphism Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <Badge variant="outline" className={`backdrop-blur-md border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${qualityName === 'Premium' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 'bg-white/40 text-slate-600'
                            }`}>
                            {qualityName}
                        </Badge>
                    </div>

                    {/* Quick View Signal */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <Badge className="bg-white/90 text-black border-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500">
                            Ver Detalles
                        </Badge>
                    </div>
                </div>

                <CardHeader className="p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">
                                {product.commercialName || product.name}
                            </CardTitle>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {subcategoryName}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={`rounded-full transition-all duration-300 ${isAdded ? 'bg-green-100 text-green-600 scale-110' : 'bg-slate-100 text-slate-900 hover:bg-black hover:text-white'}`}
                            onClick={handleAdd}
                        >
                            {isAdded ? <Sparkles className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <ProductDetailModal
                product={product}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    )
}
