'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import type { Product } from '@/lib/types'

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
    { name: 'bmt-cart-v1' }
  )
)

export interface MenuDateState {
  date: string | null
  setDate: (d: string | null) => void
}

export const useMenuDate = create<MenuDateState>()(
  persist(
    (set) => ({
      date: null,
      setDate: (date) => set({ date }),
    }),
    { name: 'bmt-menu-date' }
  )
)

export interface LanguageState {
  lang: 'en' | 'hi'
  setLang: (l: 'en' | 'hi') => void
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'bmt-lang' }
  )
)

export interface ActiveStoreState {
  storeId: string | null
  storeSlug: string | null
  setStore: (id: string, slug: string) => void
  clearStore: () => void
}

export const useActiveStore = create<ActiveStoreState>()(
  persist(
    (set) => ({
      storeId: null,
      storeSlug: null,
      setStore: (storeId, storeSlug) => set({ storeId, storeSlug }),
      clearStore: () => set({ storeId: null, storeSlug: null }),
    }),
    { name: 'bmt-active-store' }
  )
)

export const t = (en: string, hi: string, lang: 'en' | 'hi') => lang === 'hi' ? hi : en

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}

export const cartCount = (items: K14CartItem[]) =>
  items.reduce((n, i) => n + i.qty, 0)
export const cartTotal = (items: K14CartItem[]) =>
  items.reduce((s, i) => s + i.item.price * i.qty, 0)