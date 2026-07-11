'use client'

import { useState } from 'react'
import { updateStock } from '@/lib/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { Save, Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function StockRow({ product }: { product: any }) {
    const [quantity, setQuantity] = useState(product.quantity)
    const [loading, setLoading] = useState(false)
    const [changed, setChanged] = useState(false)
    const [saved, setSaved] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setLoading(true)
        try {
            await updateStock(product.id, parseInt(quantity))
            setChanged(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
            router.refresh()
        } catch (e) {
            alert("Error al actualizar el inventario")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(e.target.value)
        setChanged(true)
        setSaved(false)
    }

    return (
        <TableRow>
            <TableCell>{product.code}</TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>${product.price.toFixed(2)}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={quantity}
                        onChange={handleChange}
                        className={`w-24 ${product.quantity <= 5 ? "border-red-500 bg-red-50 text-red-900" : ""}`}
                    />
                </div>
            </TableCell>
            <TableCell>
                {changed && (
                    <Button size="sm" onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                )}
                {saved && <span className="text-green-600 text-sm font-medium">Guardado</span>}
            </TableCell>
        </TableRow>
    )
}
