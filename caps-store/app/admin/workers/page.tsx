import { getWorkers, deleteWorker } from "@/lib/worker-actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Pencil } from "lucide-react"
import { revalidatePath } from "next/cache"

export default async function AdminWorkersPage() {
    const workers = await getWorkers()

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Equipo y Trabajadores</h1>
                    <p className="text-slate-500 text-sm mt-1">Administra el personal, perfiles y permisos.</p>
                </div>
                <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm font-medium transition-all h-10 px-6">
                    <Link href="/admin/workers/new">
                        <Plus className="mr-2 h-4 w-4" /> Agregar Trabajador
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>DNI</TableHead>
                            <TableHead>Nombre Completo</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Localidad</TableHead>
                            <TableHead>NSS</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    No hay trabajadores registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            workers.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell className="font-medium">{worker.dni}</TableCell>
                                    <TableCell>{worker.firstName} {worker.lastName}</TableCell>
                                    <TableCell>{worker.phone || '-'}</TableCell>
                                    <TableCell>{worker.address || '-'}</TableCell>
                                    <TableCell>{worker.socialSecurity || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/workers/${worker.id}`}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Link>
                                            </Button>

                                            <form action={async () => {
                                                'use server'
                                                await deleteWorker(worker.id)
                                            }}>
                                                <Button variant="ghost" size="icon" type="submit">
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
