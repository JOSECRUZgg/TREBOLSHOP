import { getWorkerById, updateWorker } from "@/lib/worker-actions"
import { WorkerForm } from "../components/worker-form"
import { notFound } from "next/navigation"

export default async function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const worker = await getWorkerById(id)

    if (!worker) {
        notFound()
    }

    const updateAction = async (formData: FormData) => {
        'use server'
        return await updateWorker(id, formData)
    }

    return (
        <WorkerForm
            title="Editar Trabajador"
            initialData={worker}
            onSubmit={updateAction}
        />
    )
}
