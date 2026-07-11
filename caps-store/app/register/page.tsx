'use client'

import { useState } from 'react'
import { registerAction } from '@/lib/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Simple client validation confirm password
        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirm = formData.get('confirm') as string

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
        if (!passwordRegex.test(password)) {
            setError("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.")
            setLoading(false)
            return
        }

        if (password !== confirm) {
            setError("Las contraseñas no coinciden")
            setLoading(false)
            return
        }

        try {
            const result = await registerAction(formData)
            if (result.success) {
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Registrarse</CardTitle>
                    <CardDescription className="text-center">
                        Crea una cuenta para comenzar a comprar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="name">Nombre</label>
                            <Input id="name" name="name" type="text" placeholder="Juan Pérez" required />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="email">Correo Electrónico</label>
                            <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" required />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="password">Contraseña</label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="confirm">Confirmar Contraseña</label>
                            <Input id="confirm" name="confirm" type="password" required />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-slate-500">
                        ¿Ya tienes una cuenta? <Link href="/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
