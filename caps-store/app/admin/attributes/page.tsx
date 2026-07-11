import {
    getQualities, addQuality, editQuality, removeQuality,
    getStyles, addStyle, editStyle, removeStyle,
    getMaterials, addMaterial, editMaterial, removeMaterial,
    getCategories, addCategory, editCategory, removeCategory,
    seedDefaults
} from '@/lib/attribute-actions'
import { AttributeList } from './attribute-list'
import { Button } from '@/components/ui/button'
import { Database } from 'lucide-react'

export default async function AttributesPage() {
    const qualities = await getQualities()
    const styles = await getStyles()
    const materials = await getMaterials()
    const categories = await getCategories()

    const hasData = qualities.length > 0 || styles.length > 0 || materials.length > 0 || categories.length > 0

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Atributos</h1>
                    <p className="text-slate-500 text-sm mt-1">Personaliza las opciones y categorías disponibles para tus productos.</p>
                </div>
                {!hasData && (
                    <form action={async () => {
                        "use server"
                        await seedDefaults()
                    }}>
                        <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm font-medium transition-all h-10 px-6">
                            <Database className="mr-2 h-4 w-4" /> Cargar Datos Default
                        </Button>
                    </form>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AttributeList
                    title="Calidades"
                    items={qualities}
                    onAdd={addQuality}
                    onEdit={editQuality}
                    onDelete={removeQuality}
                />

                <AttributeList
                    title="Estilos"
                    items={styles}
                    onAdd={addStyle}
                    onEdit={editStyle}
                    onDelete={removeStyle}
                />

                <AttributeList
                    title="Materiales"
                    items={materials}
                    onAdd={addMaterial}
                    onEdit={editMaterial}
                    onDelete={removeMaterial}
                />

                <AttributeList
                    title="Colecciones"
                    items={categories}
                    onAdd={addCategory}
                    onEdit={editCategory}
                    onDelete={removeCategory}
                />
            </div>
        </div>
    )
}
