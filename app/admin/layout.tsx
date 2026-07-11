import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, Archive, Settings, LogOut, Home, Users, ShoppingBag } from "lucide-react"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    // Protect Route - Simple Check
    if (!session || (session as any).user.role !== 'ADMIN') {
        redirect('/login')
    }

    const user = (session as any).user

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white shrink-0 hidden md:block">
                <div className="p-6 border-b border-slate-800">
                    <div className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                        TREBOL SHOP ADMIN
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <LayoutDashboard size={20} />
                        Panel de Control
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <ShoppingBag size={20} />
                        Pedidos
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <Package size={20} />
                        Productos
                    </Link>
                    <Link href="/admin/stock" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <Archive size={20} />
                        Inventario
                    </Link>
                    <Link href="/admin/attributes" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <Settings size={20} />
                        Atributos
                    </Link>
                    <Link href="/admin/workers" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <Users size={20} />
                        Trabajadores
                    </Link>
                    {/* Separator */}
                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors">
                            <Home size={20} />
                            Ver Tienda
                        </Link>
                    </div>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center font-bold">
                            {user.name?.[0] || 'A'}
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                    </div>
                    {/* Logout could be a form/button calling action */}
                    <form action="/api/auth/logout" method="POST">
                        {/* For simplicity using link to home or client component logout */}
                        <Link href="/login" className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 transition-colors text-sm">
                            <LogOut size={16} />
                            Cerrar Sesión
                        </Link>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
