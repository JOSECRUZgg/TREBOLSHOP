'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from 'lucide-react'
import { getWorkerById, updateWorker } from "@/lib/worker-actions"

export default function EditWorkerPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [worker, setWorker] = useState<any>(null)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        getWorkerById(id).then(w => {
            setWorker(w)
            setFetching(false)
        })
    }, [id])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const formData = new FormData(e.currentTarget)
            await updateWorker(id, formData)
            router.push('/admin/workers')
        } catch (err: any) {
            setError(err.message || 'Error al actualizar trabajador')
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-8 text-center">Cargando...</div>
    if (!worker) return <div className="p-8 text-center">Trabajador no encontrado</div>

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href="/admin/workers">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Trabajadores
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold text-slate-800">Editar Trabajador</h1>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dni">DNI</Label>
                            <Input id="dni" name="dni" defaultValue={worker.dni} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input id="firstName" name="firstName" defaultValue={worker.firstName} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input id="lastName" name="lastName" defaultValue={worker.lastName} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" name="phone" defaultValue={worker.phone || ''} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" name="address" defaultValue={worker.address || ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="socialSecurity">Seguro Social</Label>
                        <Input id="socialSecurity" name="socialSecurity" defaultValue={worker.socialSecurity || ''} />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/workers">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                            {loading ? 'Guardando...' : 'Actualizar Trabajador'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
