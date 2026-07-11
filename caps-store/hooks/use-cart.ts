import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { updateCart } from '@/lib/actions'

export interface CartItem {
    id: string
    name: string
    commercialName?: string | null
    price: number
    imageUrl?: string | null
    quantity: number
}

interface CartStore {
    items: CartItem[]
    isDrawerOpen: boolean
    addItem: (product: any) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    setItems: (items: CartItem[]) => void
    getTotal: () => number
    getItemCount: () => number
    openDrawer: () => void
    closeDrawer: () => void
    syncPrices: (serverPrices: { id: string, price: number }[]) => void
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedSyncCart(items: any[]) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        updateCart(items)
    }, 800)
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isDrawerOpen: false,
            openDrawer: () => set({ isDrawerOpen: true }),
            closeDrawer: () => set({ isDrawerOpen: false }),
            syncPrices: (serverPrices) => {
                const currentItems = get().items
                let hasChanged = false

                const newItems = currentItems.map(item => {
                    const serverInfo = serverPrices.find(p => p.id === item.id)
                    if (serverInfo && serverInfo.price !== item.price) {
                        hasChanged = true
                        return { ...item, price: serverInfo.price }
                    }
                    return item
                })

                if (hasChanged) {
                    set({ items: newItems })
                    debouncedSyncCart(newItems)
                }
            },
            addItem: (product) => {
                const currentItems = get().items
                const existingItem = currentItems.find((item) => item.id === product.id)
                let newItems

                if (existingItem) {
                    newItems = currentItems.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                } else {
                    newItems = [...currentItems, { ...product, quantity: 1 }]
                }
                set({ items: newItems })
                debouncedSyncCart(newItems)
            },
            removeItem: (id) => {
                const newItems = get().items.filter((item) => item.id !== id)
                set({ items: newItems })
                debouncedSyncCart(newItems)
            },
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id)
                    return
                }
                const newItems = get().items.map((item) =>
                    item.id === id ? { ...item, quantity } : item
                )
                set({ items: newItems })
                debouncedSyncCart(newItems)
            },
            clearCart: () => {
                set({ items: [] })
                updateCart([])
            },
            setItems: (items) => set({ items }),
            getTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
            },
            getItemCount: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0)
            },
        }),
        {
            name: 'cart-storage',
        }
    )
)
