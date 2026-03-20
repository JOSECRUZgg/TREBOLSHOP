'use client'

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteProduct } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function ProductActions({ productId }: { productId: string }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
            return
        }

        setIsDeleting(true)
        try {
            await deleteProduct(productId)
            router.refresh()
        } catch (error: any) {
            alert("Error al eliminar el producto: " + error.message)
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-amber-600">
                <Link href={`/admin/products/${productId}/edit`}>
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 text-slate-400 hover:text-red-600"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
