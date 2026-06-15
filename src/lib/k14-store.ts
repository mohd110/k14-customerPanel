'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import type { Product } from '@/lib/types'

// ── Cart (client-side; checkout writes to Supabase) ───
export interface K14CartItem {
  item: Product
  qty: number
}

interface CartState {
  items: K14CartItem[]
  add: (item: Product, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) => {
        const existing = get().items.find((i) => i.item.id === item.id)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.item.id === item.id ? { ...i, qty: i.qty + qty } : i
            ),
          })
        } else {
          set({ items: [...get().items, { item, qty }] })
        }
      },
      remove: (id) => set({ items: get().items.filter((i) => i.item.id !== id) }),
      setQty: (id, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.item.id !== id) })
          return
        }
        set({ items: get().items.map((i) => (i.item.id === id ? { ...i, qty } : i)) })
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'k14-cart-v2' }
  )
)

// Guard against persisted-store hydration mismatches.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}

export const cartCount = (items: K14CartItem[]) =>
  items.reduce((n, i) => n + i.qty, 0)
export const cartTotal = (items: K14CartItem[]) =>
  items.reduce((s, i) => s + i.item.price * i.qty, 0)
