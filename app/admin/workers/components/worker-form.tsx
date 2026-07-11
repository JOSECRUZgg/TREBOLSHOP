'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface WorkerFormProps {
    initialData?: any
    onSubmit: (formData: FormData) => Promise<any>
    title: string
}

export function WorkerForm({ initialData, onSubmit, title }: WorkerFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            await onSubmit(formData)
            router.push('/admin/workers')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al guardar')
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
                <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dni">DNI</Label>
                            <Input id="dni" name="dni" defaultValue={initialData?.dni} placeholder="12345678A" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="socialSecurity">Número de Seguridad Social</Label>
                            <Input id="socialSecurity" name="socialSecurity" defaultValue={initialData?.socialSecurity} placeholder="NSS..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input id="firstName" name="firstName" defaultValue={initialData?.firstName} placeholder="Juan" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" name="lastName" defaultValue={initialData?.lastName} placeholder="Pérez" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" name="phone" defaultValue={initialData?.phone} placeholder="555-123-4567" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                defaultValue={initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : ''}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Localidad / Dirección</Label>
                        <Input id="address" name="address" defaultValue={initialData?.address} placeholder="Calle Principal 123, Ciudad" />
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/workers">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                            {loading ? 'Guardando...' : initialData ? 'Actualizar Trabajador' : 'Crear Trabajador'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
