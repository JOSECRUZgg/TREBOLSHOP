'use client'

import { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Plus, X, Check } from "lucide-react"

interface Attribute {
    id: string
    name: string
}

interface AttributeListProps {
    title: string
    items: Attribute[]
    onAdd: (name: string) => Promise<any>
    onEdit: (id: string, name: string) => Promise<any>
    onDelete: (id: string) => Promise<any>
}

export function AttributeList({ title, items, onAdd, onEdit, onDelete }: AttributeListProps) {
    const [isPending, startTransition] = useTransition()
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleAdd = async () => {
        if (!newName.trim()) return
        setError(null)
        startTransition(async () => {
            try {
                await onAdd(newName)
                setNewName('')
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    const handleEdit = async (id: string) => {
        if (!editingName.trim()) return
        setError(null)
        startTransition(async () => {
            try {
                await onEdit(id, editingName)
                setEditingId(null)
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este atributo?')) return
        setError(null)
        startTransition(async () => {
            try {
                await onDelete(id)
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    return (
        <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <div className="flex gap-2">
                <Input
                    placeholder={`Nueva ${title.toLowerCase()}...`}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isPending}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd} disabled={isPending || !newName.trim()} className="bg-slate-900 text-white">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-slate-400 py-4">
                                No hay registros.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {editingId === item.id ? (
                                        <Input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="h-8"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleEdit(item.id)}
                                        />
                                    ) : (
                                        <span className="font-medium text-slate-700">{item.name}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        {editingId === item.id ? (
                                            <>
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(item.id)} disabled={isPending} className="text-green-600">
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} disabled={isPending} className="text-slate-400">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingId(item.id)
                                                        setEditingName(item.name)
                                                    }}
                                                    disabled={isPending}
                                                    className="text-blue-600"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isPending}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
