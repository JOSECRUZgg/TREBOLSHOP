import { createWorker } from "@/lib/worker-actions"
import { WorkerForm } from "../components/worker-form"

export default function NewWorkerPage() {
    return (
        <WorkerForm
            title="Agregar Trabajador"
            onSubmit={createWorker}
        />
    )
}
