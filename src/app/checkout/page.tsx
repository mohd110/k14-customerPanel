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
  QrCode,
  Upload,
  X,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useCart, useHydrated, cartTotal, useMenuDate } from '@/lib/k14-store'
import { money } from '@/lib/format'
import { formatIso, hijriFromIso } from '@/lib/dates'
import PaymentQR from '@/components/PaymentQR'

type Fulfillment = 'pickup' | 'delivery'

const STORE_ADDRESS = 'Hussainabad Food Court'
const SERVICE_FEE = 20 // rupees
const DELIVERY_FEE = 40 // rupees

// Advance payment collected up front before the order is confirmed.
const ADVANCE_RATE = 0.4 // 40%
// 👇 Replace with the kitchen's real UPI ID and display name.
const UPI_VPA = process.env.NEXT_PUBLIC_UPI_VPA || 'k14kitchen@upi'
const UPI_PAYEE = process.env.NEXT_PUBLIC_UPI_PAYEE || 'K14 Tabbruk Kitchen'

export default function CheckoutPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const { items, clear } = useCart()
  const subtotal = hydrated ? cartTotal(items) : 0
  // Delivery date the customer chose on the menu page — carried over here.
  const menuDate = useMenuDate((s) => s.date)

  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [altPhone, setAltPhone] = useState('')
  const [phoneOnFile, setPhoneOnFile] = useState(false)
  const [orderCode, setOrderCode] = useState('')
  const [address, setAddress] = useState({ name: '', line: '', area: '' })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string>('')
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
      // Prefill name from the account if available.
      setName(((data.user.user_metadata?.full_name as string) || '').trim())
      // Prefill phone if the account already has one; otherwise it's required below.
      const existingPhone = (data.user.phone || (data.user.user_metadata?.phone as string) || '').trim()
      setPhone(existingPhone)
      setPhoneOnFile(!!existingPhone)
      setChecking(false)
    })
  }, [router])

  // Auto-fetch the delivery date chosen on the menu page. Only prefill while
  // the field is still empty so we never clobber a manual change here.
  useEffect(() => {
    if (menuDate) setDate((prev) => prev || menuDate)
  }, [menuDate])

  function onPickProof(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Screenshot is too large (max 8 MB)')
      return
    }
    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  function clearProof() {
    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofFile(null)
    setProofPreview('')
  }

  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE : 0
  const total = subtotal + SERVICE_FEE + deliveryFee
  const advance = Math.round(total * ADVANCE_RATE)
  const balance = total - advance
  // UPI deep link — scanning opens the customer's banking app with payee + amount pre-filled.
  const upiUri =
    `upi://pay?pa=${encodeURIComponent(UPI_VPA)}` +
    `&pn=${encodeURIComponent(UPI_PAYEE)}` +
    `&am=${advance.toFixed(2)}&cu=INR` +
    `&tn=${encodeURIComponent('K14 order advance (40%)')}`

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
    if (!name.trim()) {
      toast.error('Please enter your name')
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
    if (!proofFile) {
      toast.error('Please pay the 40% advance and upload a payment screenshot')
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    // Upload the payment screenshot first; abort the order if it fails.
    const ext = (proofFile.name.split('.').pop() || 'jpg').toLowerCase()
    const proofPath = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('payment-proofs')
      .upload(proofPath, proofFile, { cacheControl: '3600', upsert: false })
    if (uploadErr) {
      setSubmitting(false)
      toast.error(`Could not upload screenshot: ${uploadErr.message}`)
      return
    }
    const payment_proof_url = supabase.storage.from('payment-proofs').getPublicUrl(proofPath).data
      .publicUrl

    // Ensure a profile row exists — orders.customer_id has an FK to profiles.id.
    const { error: profileErr } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        role: 'customer',
        full_name: name.trim() || (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Guest',
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

    const altPhoneVal = altPhone.trim() || undefined
    const delivery_address =
      fulfillment === 'delivery'
        ? { fulfillment, date, time, phone: phone.trim(), alt_phone: altPhoneVal, name: address.name || name.trim(), address: address.line, area: address.area }
        : { fulfillment, date, time, phone: phone.trim(), alt_phone: altPhoneVal, name: name.trim(), store: STORE_ADDRESS }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        status: 'pending',
        delivery_address,
        total,
        advance_amount: advance,
        payment_status: 'awaiting_verification',
        payment_proof_url,
        note: note.trim() || null,
      })
      .select('id, order_code')
      .single()

    if (orderErr || !order) {
      setSubmitting(false)
      toast.error(orderErr?.message ?? 'Could not place order')
      return
    }
    setOrderCode(order.order_code ?? '')

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
        {orderCode && (
          <p className="mt-3 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-[#d4af37]">
            {orderCode}
          </p>
        )}
        <p className="mt-2 text-sm text-white/60">
          Your tabarruk order is booked for {date} at {time} ·{' '}
          {fulfillment === 'pickup' ? 'Store Pickup' : 'Home Delivery'}.
        </p>
        <p className="mt-3 text-xs text-white/40">
          We&apos;ve received your {money(advance)} advance screenshot. The kitchen will verify it
          and accept your order shortly.
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
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-[#d4af37]/50 [color-scheme:dark]"
            />
            {date && (
              <p className="mb-4 mt-1.5 flex items-baseline gap-1.5 px-1 text-xs">
                <span className="text-white/50">{formatIso(date)}</span>
                {hijriFromIso(date) && (
                  <span className="font-semibold text-[#e23744]">{hijriFromIso(date)}</span>
                )}
              </p>
            )}
            {!date && <div className="mb-4" />}
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-white/60">
              <Clock className="size-4" /> Preferred time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-[#d4af37]/50 [color-scheme:dark]"
            />
            <p className="mt-1.5 px-1 text-[11px] text-white/40">
              Enter any time that suits you for pickup or delivery.
            </p>
          </div>
        </section>

        {/* Order note (optional) */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-[#d4af37]">
            ORDER NOTE
            <span className="text-[9px] text-white/30">OPTIONAL</span>
          </h2>
          <div className="rounded-2xl border border-white/10 bg-[#17120c] p-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Any special instructions for the kitchen — e.g. less sugar, packaging, landmark, majlis timing…"
              className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50"
            />
          </div>
        </section>

        {/* Contact details */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-[#d4af37]">
            CONTACT DETAILS
            <span className="text-[9px] text-[#b6555b]">REQUIRED</span>
          </h2>
          <div className="rounded-2xl border border-white/10 bg-[#17120c] p-4">
            <label className="mb-1.5 block text-xs font-semibold text-white/60">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              className="mb-4 h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50"
            />
            <label className="mb-1.5 block text-xs font-semibold text-white/60">Phone</label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              autoComplete="tel"
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50"
            />
            <label className="mb-1.5 mt-4 block text-xs font-semibold text-white/60">
              Alternate phone <span className="text-white/30">(optional)</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={altPhone}
              onChange={(e) => setAltPhone(e.target.value)}
              placeholder="Another number we can reach you on"
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
              <span className="text-sm font-bold">Home Delivery</span>
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

        {/* 40% advance payment */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-[#d4af37]">
            <QrCode className="size-3.5" /> ADVANCE PAYMENT (40%)
            <span className="text-[9px] text-[#b6555b]">REQUIRED</span>
          </h2>
          <div className="rounded-2xl border border-white/10 bg-[#17120c] p-4">
            <p className="text-sm text-white/60">
              Pay <span className="font-bold text-[#d4af37]">{money(advance)}</span> now to confirm
              your order. The remaining{' '}
              <span className="font-semibold text-white/80">{money(balance)}</span> is collected on{' '}
              {fulfillment === 'pickup' ? 'pickup' : 'delivery'}.
            </p>

            <div className="mt-4 flex flex-col items-center gap-3">
              <PaymentQR value={upiUri} size={196} />
              <p className="text-center text-[11px] text-white/40">
                Scan with any UPI app (GPay · PhonePe · Paytm) to pay {money(advance)} to{' '}
                <span className="text-white/60">{UPI_VPA}</span>
              </p>
            </div>

            <label className="mt-5 mb-1.5 block text-xs font-semibold text-white/60">
              Payment screenshot
            </label>
            {proofPreview ? (
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proofPreview} alt="Payment screenshot" className="max-h-64 w-full object-contain" />
                <button
                  type="button"
                  onClick={clearProof}
                  aria-label="Remove screenshot"
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white/80 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-black/40 text-white/50 hover:border-[#d4af37]/50">
                <Upload className="size-5" />
                <span className="text-xs font-semibold">Tap to upload screenshot</span>
                <span className="text-[10px] text-white/30">PNG or JPG · max 8 MB</span>
                <input type="file" accept="image/*" onChange={onPickProof} className="hidden" />
              </label>
            )}
            <p className="mt-2 text-[11px] text-white/40">
              Upload a screenshot of your {money(advance)} payment. The kitchen verifies it before
              accepting your order.
            </p>
          </div>
        </section>

        {fulfillment === 'delivery' && (
          <p className="px-1 text-center text-[11px] text-white/40">
            Note: Home delivery charges will be added afterwards.
          </p>
        )}
      </div>

      {/* Place order */}
      <div className="phone-screen fixed inset-x-0 bottom-0 z-30 mx-auto border-t border-white/10 bg-[#120d08]/95 px-5 py-4 pb-safe backdrop-blur">
        <button
          onClick={placeOrder}
          disabled={items.length === 0 || submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            `Place Order · ${money(advance)} advance`
          )}
        </button>
      </div>
    </div>
  )
}
