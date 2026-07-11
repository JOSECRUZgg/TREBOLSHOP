'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from 'lucide-react'
import { createWorker } from "@/lib/worker-actions"

export default function NewWorkerPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const formData = new FormData(e.currentTarget)
            await createWorker(formData)
            router.push('/admin/workers')
        } catch (err: any) {
            setError(err.message || 'Error al crear trabajador')
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href="/admin/workers">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Trabajadores
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold text-slate-800">Agregar Trabajador</h1>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dni">DNI</Label>
                            <Input id="dni" name="dni" placeholder="12345678A" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input id="firstName" name="firstName" placeholder="Juan" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input id="lastName" name="lastName" placeholder="Pérez" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" name="phone" placeholder="555-0192" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" name="address" placeholder="Calle Falsa 123" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="socialSecurity">Seguro Social</Label>
                        <Input id="socialSecurity" name="socialSecurity" placeholder="SS-12345" />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/workers">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                            {loading ? 'Guardando...' : 'Crear Trabajador'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
