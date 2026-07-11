'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { addProduct, updateProduct } from "@/lib/actions"

interface AttributeOption {
    id: string
    name: string
}

interface ProductFormProps {
    initialData?: any
    mode: 'create' | 'update'
    productId?: string
    title: string
    options: {
        qualities: AttributeOption[]
        styles: AttributeOption[]
        materials: AttributeOption[]
        categories: AttributeOption[]
    }
}

export function ProductForm({ initialData, mode, productId, title, options }: ProductFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            if (mode === 'update' && productId) {
                await updateProduct(productId, formData)
            } else {
                await addProduct(formData)
            }
            router.push('/admin/products')
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href="/admin/products">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Productos
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Código de Producto (Único)</Label>
                            <Input id="code" name="code" defaultValue={initialData?.code} placeholder="CP-001" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Producto</Label>
                            <Input id="name" name="name" defaultValue={initialData?.name} placeholder="Gorra Snapback Clásica" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio ($)</Label>
                            <Input id="price" name="price" type="number" step="0.01" defaultValue={initialData?.price} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input id="quantity" name="quantity" type="number" defaultValue={initialData?.quantity} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="qualityId">Calidad</Label>
                            <Select name="qualityId" defaultValue={initialData?.qualityId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar calidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.qualities.map((q) => (
                                        <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="styleId">Estilo (Subcategoría)</Label>
                            <Select name="styleId" defaultValue={initialData?.styleId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estilo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.styles.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="materialId">Material</Label>
                            <Select name="materialId" defaultValue={initialData?.materialId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar material" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.materials.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Tipo de Colección</Label>
                            <Select name="categoryId" defaultValue={initialData?.categoryId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar colección" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Marca</Label>
                            <Input id="brand" name="brand" defaultValue={initialData?.brand} placeholder="Genérica" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Imagen del Producto {initialData && "(Opcional si no se va a cambiar)"}</Label>
                        <Input id="image" name="image" type="file" accept="image/*" />
                        {initialData?.imageUrl && (
                            <p className="text-[10px] text-slate-500 font-medium italic">Imagen actual: {initialData.imageUrl}</p>
                        )}
                        <p className="text-[10px] text-slate-500 font-medium italic">Recomendado: Imagen cuadrada, formato PNG o JPG.</p>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/products">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                            {loading ? 'Guardando...' : initialData ? 'Actualizar Producto' : 'Crear Producto'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
