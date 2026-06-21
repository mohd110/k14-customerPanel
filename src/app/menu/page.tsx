'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Search,
  ShoppingBag,
  UtensilsCrossed,
  ClipboardList,
  User,
  Plus,
  X,
  Loader2,
  CalendarDays,
  ChevronDown,
  Check,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { useCart, useHydrated, cartCount, useMenuDate } from '@/lib/k14-store'
import { money } from '@/lib/format'
import { placeholderImage } from '@/lib/placeholder-image'
import { upcomingDatesThrough, endOfAugustIso, formatIso, hijriFromIso, minMenuIso, type DateOption } from '@/lib/dates'

function ItemCard({
  item,
  onAdd,
  available = true,
}: {
  item: Product
  onAdd: (item: Product, qty: number) => void
  available?: boolean
}) {
  // Plain quantity field — the customer types the number directly (numpad).
  const [qtyText, setQtyText] = useState('1')
  const qty = Math.max(1, parseInt(qtyText, 10) || 1)
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#17120c] ${
        available ? '' : 'opacity-80'
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photo_url || placeholderImage(item.name)}
          alt={item.name}
          className={`h-full w-full object-contain transition-all ${
            available ? '' : 'grayscale'
          }`}
        />
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-md border border-white/30 bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif-display text-lg font-bold text-white">{item.name}</h3>
          <span className="shrink-0 font-bold text-[#d4af37]">{money(item.price)}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-white/50">{item.description}</p>

        {available && (
          <p
            className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] ${
              (item.stock ?? 0) <= 10
                ? 'bg-[#e23744]/15 text-[#f08089]'
                : 'bg-[#d4af37]/12 text-[#d4af37]'
            }`}
          >
            {(item.stock ?? 0) <= 10
              ? `Only ${item.stock} left for this date`
              : `${item.stock} left for this date`}
          </p>
        )}

        {available ? (
          <div className="mt-4 flex items-stretch gap-2">
            <div className="flex shrink-0 flex-col items-center">
              <label className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#d4af37]/70">
                QTY
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={`Quantity for ${item.name}`}
                value={qtyText}
                onChange={(e) => setQtyText(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={() => setQtyText(String(qty))}
                className="h-11 w-16 rounded-lg border border-white/15 bg-black/30 text-center text-base font-bold text-white outline-none focus:border-[#d4af37]/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <button
              onClick={() => onAdd(item, qty)}
              className="mt-[18px] flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-xs font-bold text-[#1a1206] transition-transform active:scale-[0.98]"
            >
              <Plus className="size-4" /> Add to Tabarruk
            </button>
          </div>
        ) : (
          <button
            disabled
            className="mt-4 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/15 text-xs font-bold text-white/40"
          >
            Out of stock on this date
          </button>
        )}
      </div>
    </div>
  )
}

function DateSheet({
  options,
  selected,
  onSelect,
  onClose,
}: {
  options: DateOption[]
  selected: string | null
  onSelect: (iso: string) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="phone-screen w-full rounded-t-3xl border-t border-[#d4af37]/20 bg-[#17120c] p-6 pb-8 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif-display text-lg font-bold text-white">Select a date</h3>
            <p className="mt-0.5 text-xs text-white/50">Choose a delivery date to see that day&apos;s menu.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto">
          {options.map((d) => {
            const active = d.iso === selected
            return (
              <button
                key={d.iso}
                onClick={() => onSelect(d.iso)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  active
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-black/30">
                    <span className="text-[9px] font-bold tracking-wider text-[#d4af37]">
                      {d.month.toUpperCase()}
                    </span>
                    <span className="text-base font-bold leading-none text-white">{d.day}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{d.weekday}</p>
                    <p className="text-xs text-white/45">{d.full}</p>
                    <p className="text-[11px] font-semibold text-[#e23744]">
                      {hijriFromIso(d.iso)}
                    </p>
                  </div>
                </div>
                {active && <Check className="size-5 text-[#d4af37]" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [availableIds, setAvailableIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)

  const items = useCart((s) => s.items)
  const add = useCart((s) => s.add)
  const hydrated = useHydrated()
  const count = hydrated ? cartCount(items) : 0

  const selectedDate = useMenuDate((s) => s.date)
  const setSelectedDate = useMenuDate((s) => s.setDate)
  const dateOptions = upcomingDatesThrough(endOfAugustIso())

  // Discard a persisted date that is now in the past (e.g. returning days later).
  useEffect(() => {
    if (selectedDate && selectedDate < minMenuIso()) setSelectedDate(null)
  }, [selectedDate, setSelectedDate])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: { user: unknown | null } }) => setLoggedIn(!!data.user))
  }, [])

  // Load the full menu, plus which items are available on the selected date.
  // Items that aren't available that day are still shown — greyed out and
  // marked "Out of stock" — rather than hidden.
  useEffect(() => {
    if (!selectedDate) {
      setProducts([])
      setAvailableIds(new Set())
      return
    }
    setLoading(true)
    const supabase = createClient()
    Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: true }),
      supabase
        .from('product_availability')
        .select('product_id')
        .eq('available_date', selectedDate),
    ]).then(
      ([prodRes, availRes]: [
        { data: Product[] | null; error: unknown },
        { data: { product_id: string }[] | null; error: unknown },
      ]) => {
        if (prodRes.error) toast.error('Could not load menu')
        else setProducts(prodRes.data ?? [])
        setAvailableIds(new Set((availRes.data ?? []).map((r) => r.product_id)))
        setLoading(false)
      }
    )
  }, [selectedDate])

  // Available on the selected date only if it's offered that day AND in stock.
  // Stock is reduced as orders come in, so a sold-out item shows "Out of stock".
  const isAvailable = (item: Product) =>
    availableIds.has(item.id) && (item.stock ?? 0) > 0

  const confirmAdd = (item: Product, qty: number) => {
    add(item, qty)
    toast.success(`${qty} × ${item.name} added`)
  }

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#0e0b08] pb-24 text-white">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0e0b08]/95 px-5 py-3.5 backdrop-blur">
        {/* Date selector — top-left, prominent */}
        <button
          onClick={() => setDateOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-[#d4af37]/45 bg-[#d4af37]/10 px-3 py-2 text-left transition-colors active:bg-[#d4af37]/20"
        >
          <CalendarDays className="size-4 shrink-0 text-[#d4af37]" />
          <div className="leading-tight">
            <span className="block text-[8px] font-bold tracking-[0.15em] text-[#d4af37]/70">
              DELIVERY DATE
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white">
                {selectedDate ? formatIso(selectedDate) : 'Select date'}
              </span>
              {selectedDate && (
                <span className="text-[11px] font-semibold text-[#e23744]">
                  {hijriFromIso(selectedDate)}
                </span>
              )}
            </span>
          </div>
          <ChevronDown className="size-3.5 shrink-0 text-white/50" />
        </button>

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
        {!selectedDate ? (
          /* Gate: no date chosen yet */
          <button
            onClick={() => setDateOpen(true)}
            className="flex w-full flex-col items-center gap-4 rounded-2xl border border-dashed border-[#d4af37]/40 bg-[#d4af37]/[0.06] px-6 py-12 text-center"
          >
            <CalendarDays className="size-10 text-[#d4af37]" />
            <div>
              <p className="font-serif-display text-lg font-bold text-white">
                Please select a date to get the full menu
              </p>
              <p className="mt-1 text-xs text-white/50">
                Our offerings change daily — pick a delivery date to see what&apos;s available.
              </p>
            </div>
            <span className="mt-1 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] px-4 py-2 text-xs font-bold text-[#1a1206]">
              <CalendarDays className="size-4" /> Select date
            </span>
          </button>
        ) : loading ? (
          <div className="flex justify-center py-20 text-[#d4af37]">
            <Loader2 className="size-7 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-white/60">
              No items available for {formatIso(selectedDate)}.
            </p>
            <button
              onClick={() => setDateOpen(true)}
              className="mt-3 text-xs font-bold text-[#d4af37] underline underline-offset-4"
            >
              Try another date
            </button>
          </div>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-white">Tabarruk Menu</h2>
                <p className="text-xs text-white/45">for {formatIso(selectedDate)}</p>
              </div>
              <span className="rounded-md border border-[#d4af37]/30 px-2 py-0.5 text-[9px] font-bold tracking-[0.15em] text-[#d4af37]">
                {products.filter((p) => isAvailable(p)).length} AVAILABLE
              </span>
            </div>
            <div className="space-y-5">
              {products.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onAdd={confirmAdd}
                  available={isAvailable(item)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-10 border-t border-white/10 px-6 py-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/k14-logo.png" alt="K14 Bakers" className="mx-auto w-28 object-contain opacity-90" />
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
          { icon: ClipboardList, label: 'Orders', href: loggedIn ? '/orders' : '/login', active: false },
          { icon: User, label: 'Profile', href: loggedIn ? '/profile' : '/login', active: false },
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

      {/* ── Date picker ── */}
      {dateOpen && (
        <DateSheet
          options={dateOptions}
          selected={selectedDate}
          onSelect={(iso) => {
            setSelectedDate(iso)
            setDateOpen(false)
          }}
          onClose={() => setDateOpen(false)}
        />
      )}
    </div>
  )
}
