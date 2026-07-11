'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Sparkles, Shield, Package, User, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/use-cart'
import { useState } from 'react'

interface ProductDetailModalProps {
    product: any
    isOpen: boolean
    onClose: () => void
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
    const addItem = useCart((state) => state.addItem)
    const [isAdded, setIsAdded] = useState(false)

    const handleAdd = () => {
        addItem(product)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const qualityName = product.qualityRef?.name || product.quality || 'Estándar'
    const styleName = product.styleRef?.name || product.subcategory || 'Snapback'
    const materialName = product.materialRef?.name || product.material || 'Algodón'
    const categoryName = product.categoryRef?.name || product.style || 'Urbana'

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 hover:bg-black hover:text-white transition-all shadow-lg"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Image Section */}
                        <div className="w-full md:w-1/2 bg-[#f3f4f6] relative aspect-square md:aspect-auto">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-9xl">
                                    🧢
                                </div>
                            )}
                            <div className="absolute top-8 left-8">
                                <Badge className="bg-black/80 text-white border-none py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                    {qualityName}
                                </Badge>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col h-full overflow-y-auto max-h-[80vh] md:max-h-none">
                            <div className="flex-1">
                                <div className="space-y-2 mb-6">
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">
                                        {product.brand || 'CAPS STORE'}
                                    </p>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                                        {product.commercialName || product.name}
                                    </h2>
                                    <div className="flex items-center gap-4 pt-2">
                                        <span className="text-3xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                                        <Badge variant="outline" className="border-slate-200 text-slate-500 rounded-full font-bold">
                                            Stock: {product.quantity}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                                <Shield className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Material</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800">{materialName}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                                <Package className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Estilo</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800">{styleName}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                                <User className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Público</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800">{product.audience || 'Unisex'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                                <Star className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Colección</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800">{categoryName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleAdd}
                                disabled={product.quantity === 0}
                                className={`w-full py-8 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-xl ${isAdded
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-orange-600 hover:bg-orange-500 text-white hover:shadow-orange-500/20'
                                    }`}
                            >
                                {isAdded ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" /> AGREGADO AL CARRITO
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4" /> AGREGAR AL CARRITO
                                    </span>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
