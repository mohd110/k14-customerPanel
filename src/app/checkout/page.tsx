'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronLeft,
  Store,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useCart, useHydrated, cartTotal } from '@/lib/k14-store'
import { money } from '@/lib/format'

type Fulfillment = 'pickup' | 'delivery'

const TIME_SLOTS = ['10:00 AM', '12:30 PM', '03:00 PM', '06:30 PM', '08:00 PM']
const STORE_ADDRESS = 'K14 Tabbruk Kitchen · Bab al-Qibla, Karbala'
const SERVICE_FEE = 20 // rupees
const DELIVERY_FEE = 40 // rupees

export default function CheckoutPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const { items, clear } = useCart()
  const subtotal = hydrated ? cartTotal(items) : 0

  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneOnFile, setPhoneOnFile] = useState(false)
  const [address, setAddress] = useState({ name: '', line: '', area: '' })
  const [placed, setPlaced] = useState(false)

  // Auth gate — guests must log in before checkout.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (!data.user) {
        router.replace('/login?redirect=/checkout')
        return
      }
      setUser(data.user)
      // Prefill phone if the account already has one; otherwise it's required below.
      const existingPhone = (data.user.phone || (data.user.user_metadata?.phone as string) || '').trim()
      setPhone(existingPhone)
      setPhoneOnFile(!!existingPhone)
      setChecking(false)
    })
  }, [router])

  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE : 0
  const total = subtotal + SERVICE_FEE + deliveryFee

  if (checking) {
    return (
      <div className="phone-screen flex min-h-[100dvh] items-center justify-center bg-[#0e0b08] text-[#d4af37]">
        <Loader2 className="size-7 animate-spin" />
      </div>
    )
  }

  async function placeOrder() {
    if (!user) return
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    if (!date || !time) {
      toast.error('Please select a date and time')
      return
    }
    if (!phone.trim()) {
      toast.error('Please enter your phone number')
      return
    }
    if (fulfillment === 'delivery' && (!address.name || !address.line)) {
      toast.error('Please complete the delivery address')
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    // Ensure a profile row exists — orders.customer_id has an FK to profiles.id.
    const { error: profileErr } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        role: 'customer',
        full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Guest',
        email: user.email ?? '',
        phone: phone.trim() || null,
      },
      { onConflict: 'id' }
    )
    if (profileErr) {
      setSubmitting(false)
      toast.error(profileErr.message)
      return
    }

    const delivery_address =
      fulfillment === 'delivery'
        ? { fulfillment, date, time, phone: phone.trim(), name: address.name, address: address.line, area: address.area }
        : { fulfillment, date, time, phone: phone.trim(), store: STORE_ADDRESS }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({ customer_id: user.id, status: 'pending', delivery_address, total })
      .select('id')
      .single()

    if (orderErr || !order) {
      setSubmitting(false)
      toast.error(orderErr?.message ?? 'Could not place order')
      return
    }

    const { error: itemsErr } = await supabase.from('order_items').insert(
      items.map(({ item, qty }) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: qty,
        price_at_order: item.price,
      }))
    )

    if (itemsErr) {
      setSubmitting(false)
      toast.error(itemsErr.message)
      return
    }

    clear()
    setSubmitting(false)
    setPlaced(true)
  }

  if (placed) {
    return (
      <div className="phone-screen flex min-h-[100dvh] flex-col items-center justify-center bg-[#0e0b08] px-8 text-center text-white">
        <CheckCircle2 className="size-16 text-[#d4af37]" />
        <h1 className="mt-5 font-serif-display text-2xl font-bold k14-gold-gradient">Khidmah Confirmed</h1>
        <p className="mt-2 text-sm text-white/60">
          Your tabarruk order is booked for {date} at {time} ·{' '}
          {fulfillment === 'pickup' ? 'Store Pickup' : 'Porter Delivery'}.
        </p>
        <Link
          href="/menu"
          className="mt-8 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] px-8 py-3 text-sm font-bold text-[#1a1206]"
        >
          Back to Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#0e0b08] pb-32 text-white">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#0e0b08]/95 px-5 py-3.5 backdrop-blur">
        <Link href="/cart" aria-label="Back" className="text-white/70 hover:text-white">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="font-serif-display text-xl font-bold text-white">Checkout</h1>
      </header>

      <div className="space-y-7 px-5 pt-5">
        {/* Order summary */}
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.25em] text-[#d4af37]">ORDER SUMMARY</h2>
          <div className="rounded-2xl border border-white/10 bg-[#17120c] p-4">
            {items.length === 0 ? (
              <p className="text-sm text-white/50">Your cart is empty.</p>
            ) : (
              items.map(({ item, qty }) => (
                <div key={item.id} className="flex justify-between py-1.5 text-sm">
                  <span className="text-white/70">
                    {qty} × {item.name}
                  </span>
                  <span className="font-semibold text-white/90">{money(item.price * qty)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Date & time */}
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.25em] text-[#d4af37]">DATE &amp; TIME</h2>
          <div className="rounded-2xl border border-white/10 bg-[#17120c] p-4">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-white/60">
              <Calendar className="size-4" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mb-4 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-[#d4af37]/50 [color-scheme:dark]"
            />
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/60">
              <Clock className="size-4" /> Time slot
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    time === t
                      ? 'bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-[#1a1206]'
                      : 'border border-white/15 text-white/60 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Contact phone */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-[#d4af37]">
            CONTACT PHONE
            {!phoneOnFile && <span className="text-[9px] text-[#b6555b]">REQUIRED</span>}
          </h2>
          <div className="rounded-2xl border border-white/10 bg-[#17120c] p-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              autoComplete="tel"
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50"
            />
            {!phoneOnFile && (
              <p className="mt-2 text-[11px] text-white/40">
                No phone on your account — please add one to confirm the order.
              </p>
            )}
          </div>
        </section>

        {/* Fulfillment */}
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.25em] text-[#d4af37]">FULFILLMENT</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFulfillment('pickup')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                fulfillment === 'pickup'
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-white/10 bg-[#17120c]'
              }`}
            >
              <Store className={`size-6 ${fulfillment === 'pickup' ? 'text-[#d4af37]' : 'text-white/60'}`} />
              <span className="text-sm font-bold">Store Pickup</span>
              <span className="text-[10px] text-white/40">Free · No address</span>
            </button>
            <button
              onClick={() => setFulfillment('delivery')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                fulfillment === 'delivery'
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-white/10 bg-[#17120c]'
              }`}
            >
              <Truck className={`size-6 ${fulfillment === 'delivery' ? 'text-[#d4af37]' : 'text-white/60'}`} />
              <span className="text-sm font-bold">Porter Delivery</span>
              <span className="text-[10px] text-white/40">{money(DELIVERY_FEE)} · To your door</span>
            </button>
          </div>

          {/* Conditional address */}
          {fulfillment === 'pickup' ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/10 bg-[#17120c] p-4 text-sm text-white/60">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#d4af37]" />
              <div>
                <p className="font-semibold text-white/80">Pickup location</p>
                <p>{STORE_ADDRESS}</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-[#17120c] p-4">
              <p className="text-xs font-bold tracking-[0.15em] text-[#d4af37]/80">DELIVERY ADDRESS</p>
              <input
                placeholder="Full name"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50"
              />
              <input
                placeholder="Street address"
                value={address.line}
                onChange={(e) => setAddress({ ...address, line: e.target.value })}
                className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50"
              />
              <input
                placeholder="Area / landmark (optional)"
                value={address.area}
                onChange={(e) => setAddress({ ...address, area: e.target.value })}
                className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50"
              />
            </div>
          )}
        </section>

        {/* Totals */}
        <section className="rounded-2xl border border-white/10 bg-[#17120c] p-4 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-white/60">
            <span>Service fee</span>
            <span>{money(SERVICE_FEE)}</span>
          </div>
          <div className="mt-2 flex justify-between text-white/60">
            <span>{fulfillment === 'delivery' ? 'Delivery fee' : 'Pickup'}</span>
            <span>{deliveryFee ? money(deliveryFee) : 'Free'}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base font-bold">
            <span>Total</span>
            <span className="text-[#d4af37]">{money(total)}</span>
          </div>
        </section>
      </div>

      {/* Place order */}
      <div className="phone-screen fixed inset-x-0 bottom-0 z-30 mx-auto border-t border-white/10 bg-[#120d08]/95 px-5 py-4 pb-safe backdrop-blur">
        <button
          onClick={placeOrder}
          disabled={items.length === 0 || submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : `Place Order · ${money(total)}`}
        </button>
      </div>
    </div>
  )
}
