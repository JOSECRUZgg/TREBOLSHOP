'use client'

import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Search, ShoppingBag, User, LogOut } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { CartDrawer } from "./cart-drawer"
import { getCart, logoutAction } from "@/lib/actions"

interface HeaderProps {
    session: any
}

export function Header({ session }: HeaderProps) {
    const searchParams = useSearchParams()
    const queryParams = searchParams?.get("query") || ""
    const { openDrawer } = useCart()
    const [getItemCount, setItemCount] = useState(0)
    const cartItemCount = useCart((state) => state.getItemCount())
    const setItems = useCart((state) => state.setItems)
    const clearCart = useCart((state) => state.clearCart)
    const prevUserIdRef = useRef<string | null>(null)

    // Sync cart when session changes
    useEffect(() => {
        const userId = session?.user?.id || null

        if (userId !== prevUserIdRef.current) {
            if (userId) {
                // Login: Fetch from DB
                getCart().then((dbItems) => {
                    setItems(dbItems || [])
                })
            } else if (prevUserIdRef.current) {
                // Logout: Clear items
                clearCart()
            }
            prevUserIdRef.current = userId
        }
    }, [session?.user?.id, setItems, clearCart])

    // Hydration fix
    useEffect(() => {
        setItemCount(cartItemCount)
    }, [cartItemCount])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-xl transition-all duration-300">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <Link href="/" className="text-2xl font-black tracking-tighter bg-gradient-to-r from-black via-slate-700 to-black bg-clip-text text-transparent group-hover:from-green-600 group-hover:to-emerald-500 transition-all duration-500">
                        TREBOL SHOP
                    </Link>
                </div>

                {/* Centered Navigation */}
                <nav className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm font-semibold text-slate-500 uppercase tracking-widest text-[10px]">
                    <Link href="/" className="hover:text-black transition-all hover:-translate-y-0.5">Todo</Link>
                    <Link href="/?quality=Básica" className="hover:text-black transition-all hover:-translate-y-0.5">Básicas</Link>
                    <Link href="/?quality=Estándar" className="hover:text-black transition-all hover:-translate-y-0.5">Estándar</Link>
                    <Link href="/?quality=Premium" className="hover:text-black transition-all hover:-translate-y-0.5">Premium</Link>
                    <Link href="/about" className="hover:text-black transition-all hover:-translate-y-0.5">Sobre Nosotros</Link>
                </nav>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <form action="/" method="GET" className="relative hidden lg:block group">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-black transition-colors" />
                        <Input
                            type="search"
                            name="query"
                            defaultValue={queryParams}
                            placeholder="Buscar productos..."
                            className="w-40 pl-9 rounded-full bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-black/5 transition-all focus:w-60 h-9 text-xs font-bold"
                        />
                    </form>

                    {/* User Menu */}
                    {session ? (
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" asChild className="rounded-full px-4 hover:bg-slate-100 transition-all">
                                <Link href={session.user.role === 'ADMIN' ? '/admin' : '/profile'} className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline font-black text-[10px] uppercase tracking-wider">{session.user.name.split(' ')[0]}</span>
                                </Link>
                            </Button>
                            <form action={logoutAction}>
                                <Button variant="ghost" size="icon" type="submit" className="rounded-full text-slate-400 hover:text-red-500 transition-colors">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <Button variant="default" asChild className="rounded-full bg-black text-white hover:bg-slate-800 px-6 h-9 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10">
                            <Link href="/login">Iniciar Sesión</Link>
                        </Button>
                    )}

                    {/* Cart Toggle */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={openDrawer}
                        className="relative rounded-full hover:bg-slate-100 transition-all active:scale-90"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        {getItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-in zoom-in duration-300">
                                {getItemCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </header>
    )
}
