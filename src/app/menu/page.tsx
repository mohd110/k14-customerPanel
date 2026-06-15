'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Search,
  ShoppingBag,
  LayoutGrid,
  UtensilsCrossed,
  Heart,
  User,
  Plus,
  Minus,
  X,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { useCart, useHydrated, cartCount } from '@/lib/k14-store'
import { money } from '@/lib/format'
import { placeholderImage } from '@/lib/placeholder-image'

function ItemCard({ item, onAdd }: { item: Product; onAdd: (item: Product) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#17120c]">
      <div className="relative h-44 w-full overflow-hidden bg-black/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photo_url || placeholderImage(item.name)}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif-display text-lg font-bold text-white">{item.name}</h3>
          <span className="shrink-0 font-bold text-[#d4af37]">{money(item.price)}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-white/50">{item.description}</p>

        <button
          onClick={() => onAdd(item)}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-xs font-bold text-[#1a1206] transition-transform active:scale-[0.98]"
        >
          <Plus className="size-4" /> Add to Tabarruk
        </button>
      </div>
    </div>
  )
}

function QtyModal({
  item,
  onClose,
  onConfirm,
}: {
  item: Product
  onClose: () => void
  onConfirm: (item: Product, qty: number) => void
}) {
  const [qty, setQty] = useState(1)
  const dec = () => setQty((q) => Math.max(1, q - 1))
  const inc = () => setQty((q) => Math.min(999, q + 1))

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="phone-screen w-full rounded-t-3xl border-t border-[#d4af37]/20 bg-[#17120c] p-6 pb-8 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.photo_url || placeholderImage(item.name)}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-serif-display text-lg font-bold text-white">{item.name}</h3>
            <span className="text-sm font-bold text-[#d4af37]">{money(item.price)} each</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-[#d4af37]/80">
          QUANTITY
        </label>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/15 px-2 py-2">
            <button onClick={dec} aria-label="Decrease" className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/80 hover:bg-white/10">
              <Minus className="size-4" />
            </button>
            <input
              type="number"
              min={1}
              max={999}
              value={qty}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                setQty(Number.isNaN(n) ? 1 : Math.min(999, Math.max(1, n)))
              }}
              className="w-14 bg-transparent text-center text-lg font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={inc} aria-label="Increase" className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/80 hover:bg-white/10">
              <Plus className="size-4" />
            </button>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.15em] text-white/40">TOTAL</p>
            <p className="text-xl font-bold text-[#d4af37]">{money(item.price * qty)}</p>
          </div>
        </div>

        <button
          onClick={() => onConfirm(item, qty)}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] transition-transform active:scale-[0.98]"
        >
          <ShoppingBag className="size-4" /> Add to Cart
        </button>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [modalItem, setModalItem] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const items = useCart((s) => s.items)
  const add = useCart((s) => s.add)
  const hydrated = useHydrated()
  const count = hydrated ? cartCount(items) : 0

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: true })
      .then(({ data, error }: { data: Product[] | null; error: unknown }) => {
        if (error) toast.error('Could not load menu')
        else setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  const confirmAdd = (item: Product, qty: number) => {
    add(item, qty)
    setModalItem(null)
    toast.success(`${qty} × ${item.name} added`)
  }

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#0e0b08] pb-24 text-white">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0e0b08]/95 px-5 py-3.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-5 text-white/70" />
          <span className="font-serif-display text-2xl font-bold k14-gold-gradient leading-none">k14</span>
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <button aria-label="Search"><Search className="size-5" /></button>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[9px] font-bold text-[#1a1206]">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-5 pt-6">
        <h1 className="font-serif-display text-3xl font-bold leading-tight text-white">
          The Majlis Kitchen
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Serving the community with dignity and devotion.
        </p>
      </section>

      {/* ── Menu list ── */}
      <main className="mt-6 px-5">
        {loading ? (
          <div className="flex justify-center py-20 text-[#d4af37]">
            <Loader2 className="size-7 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <p className="py-20 text-center text-sm text-white/50">
            No items available yet.
          </p>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-bold text-white">Tabarruk Menu</h2>
              <span className="rounded-md border border-[#d4af37]/30 px-2 py-0.5 text-[9px] font-bold tracking-[0.15em] text-[#d4af37]">
                {products.length} ITEMS
              </span>
            </div>
            <div className="space-y-5">
              {products.map((item) => (
                <ItemCard key={item.id} item={item} onAdd={setModalItem} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-10 border-t border-white/10 px-6 py-8 text-center">
        <h3 className="font-serif-display text-2xl font-bold k14-gold-gradient">k14</h3>
        <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2 text-[11px] text-white/40">
          <Link href="/" className="hover:text-white">Stories &amp; Info</Link>
          <Link href="/" className="hover:text-white">Help &amp; About</Link>
          <Link href="/" className="hover:text-white">Customer</Link>
          <Link href="/" className="hover:text-white">Support</Link>
        </div>
      </footer>

      {/* ── Bottom nav ── */}
      <nav className="phone-screen fixed inset-x-0 bottom-0 z-30 mx-auto flex items-center justify-around border-t border-white/10 bg-[#120d08]/95 px-2 py-3 pb-safe backdrop-blur">
        {[
          { icon: UtensilsCrossed, label: 'Menu', href: '/menu', active: true },
          { icon: ShoppingBag, label: 'Cart', href: '/cart', active: false },
          { icon: Heart, label: 'Saved', href: '/menu', active: false },
          { icon: User, label: 'Profile', href: '/login', active: false },
        ].map(({ icon: Icon, label, href, active }) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              active ? 'text-[#d4af37]' : 'text-white/45'
            }`}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Qty popup ── */}
      {modalItem && (
        <QtyModal item={modalItem} onClose={() => setModalItem(null)} onConfirm={confirmAdd} />
      )}
    </div>
  )
}
