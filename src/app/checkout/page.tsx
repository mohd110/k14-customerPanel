'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronDown,
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
  AlertTriangle,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useCart, useHydrated, cartTotal, useMenuDate, useLanguage, t } from '@/lib/k14-store'
import { money } from '@/lib/format'
import { formatIso, hijriFromIso, upcomingDatesThrough, endOfAugustIso } from '@/lib/dates'
import PaymentQR from '@/components/PaymentQR'
import DateSheet from '@/components/DateSheet'

type Fulfillment = 'pickup' | 'delivery'
type Packing = 'none' | 'bag' | 'box'

const STORE_ADDRESS = 'Hussainabad Food Court'
const TIME_SLOTS = ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM']
const SERVICE_FEE = 20 // rupees
const DELIVERY_FEE = 40 // rupees
const GOLD = '#d4af37'

// Optional packing add-on chosen at checkout.
const BAG_FEE = 10 // rupees — carry bag
const BOX_FEE = 30 // rupees — sturdy gift box
const PACKING_FEE: Record<Packing, number> = { none: 0, bag: BAG_FEE, box: BOX_FEE }
const PACKING_LABEL: Record<Packing, string> = { none: 'No packing', bag: 'Carry bag', box: 'Gift box' }

// Advance payment collected up front before the order is confirmed.
const ADVANCE_RATE = 0.4 // 40%
// 👇 Replace with the kitchen's real UPI ID and display name.
const UPI_VPA = process.env.NEXT_PUBLIC_UPI_VPA || 'k14kitchen@upi'
const UPI_PAYEE = process.env.NEXT_PUBLIC_UPI_PAYEE || 'K14 Tabbruk Kitchen'

export default function CheckoutPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const { lang } = useLanguage()
  const { items, clear } = useCart()
  const subtotal = hydrated ? cartTotal(items) : 0
  // Delivery date the customer chose on the menu page — carried over here.
  const menuDate = useMenuDate((s) => s.date)
  // Same date options as the menu's date selector, so the picker matches.
  const dateOptions = upcomingDatesThrough(endOfAugustIso())

  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup')
  // Packing option removed from checkout; keep 'none' so totals/order stay valid.
  const [packing] = useState<Packing>('none')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [altPhone, setAltPhone] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [address, setAddress] = useState({ name: '', line: '', area: '' })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string>('')
  const [placed, setPlaced] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  // Final "review your order & address" confirmation gate before submitting.
  const [confirmOpen, setConfirmOpen] = useState(false)

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
      // Phone comes from login (it's the account identifier) — carried into the order.
      const existingPhone = (data.user.phone || (data.user.user_metadata?.phone as string) || '').trim()
      setPhone(existingPhone)
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
      toast.error(t('Please select an image file', 'कृपया एक इमेज फ़ाइल चुनें', lang))
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error(t('Screenshot is too large (max 8 MB)', 'स्क्रीनशॉट बहुत बड़ा है (अधिकतम 8 MB)', lang))
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
  const packingFee = PACKING_FEE[packing]
  const total = subtotal + SERVICE_FEE + deliveryFee + packingFee
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
      <div className="phone-screen flex min-h-[100dvh] items-center justify-center bg-[#FAF6F0] text-[#0e3d2a]">
        <Loader2 className="size-7 animate-spin" />
      </div>
    )
  }

  // Validate every required field; returns true only when the order is ready to
  // submit. Used to gate the review sheet so we never open it on bad input.
  function validate(): boolean {
    if (!user) return false
    if (items.length === 0) {
      toast.error(t('Your cart is empty', 'आपका कार्ट खाली है', lang))
      return false
    }
    if (!date || !time) {
      toast.error(t('Please select a date and time', 'कृपया तारीख़ और समय चुनें', lang))
      return false
    }
    if (!name.trim()) {
      toast.error(t('Please enter your name', 'कृपया अपना नाम दर्ज करें', lang))
      return false
    }
    if (!phone.trim()) {
      toast.error(t('Please enter your phone number', 'कृपया अपना फ़ोन नंबर दर्ज करें', lang))
      return false
    }
    if (fulfillment === 'delivery' && (!address.name || !address.line)) {
      toast.error(t('Please complete the delivery address', 'कृपया डिलीवरी पता पूरा करें', lang))
      return false
    }
    if (!proofFile) {
      toast.error(t('Please pay the 40% advance and upload a payment screenshot', 'कृपया 40% अग्रिम भुगतान करें और भुगतान स्क्रीनशॉट अपलोड करें', lang))
      return false
    }
    return true
  }

  // Bottom button → validate first, then open the review sheet. The order is
  // only actually submitted once the customer confirms in the sheet.
  function reviewOrder() {
    if (validate()) setConfirmOpen(true)
  }

  // Any submit failure: stop the spinner, close the sheet so the customer can
  // fix the issue on the form, and surface the reason.
  function fail(msg: string) {
    setSubmitting(false)
    setConfirmOpen(false)
    toast.error(msg)
  }

  async function submitOrder() {
    if (!user || !validate()) return

    setSubmitting(true)
    const supabase = createClient()

    // Upload the payment screenshot first; abort the order if it fails.
    const ext = (proofFile!.name.split('.').pop() || 'jpg').toLowerCase()
    const proofPath = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('payment-proofs')
      .upload(proofPath, proofFile!, { cacheControl: '3600', upsert: false })
    if (uploadErr) {
      fail(`${t('Could not upload screenshot', 'स्क्रीनशॉट अपलोड नहीं हो सका', lang)}: ${uploadErr.message}`)
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
      fail(profileErr.message)
      return
    }

    // The cart is single-store (mixing stores is blocked on the menu), so the
    // order's store_id is simply the store of the cart's items.
    const orderStoreId = items.map((ci) => ci.item.store_id).find(Boolean) ?? null

    const altPhoneVal = altPhone.trim() || undefined
    const packingInfo = { packing, packing_label: PACKING_LABEL[packing], packing_fee: packingFee }
    const delivery_address =
      fulfillment === 'delivery'
        ? { fulfillment, date, time, phone: phone.trim(), alt_phone: altPhoneVal, name: address.name || name.trim(), address: address.line, area: address.area, ...packingInfo }
        : { fulfillment, date, time, phone: phone.trim(), alt_phone: altPhoneVal, name: name.trim(), store: STORE_ADDRESS, ...packingInfo }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        store_id: orderStoreId ?? undefined,
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
      fail(orderErr?.message ?? t('Could not place order', 'ऑर्डर नहीं दिया जा सका', lang))
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
      fail(itemsErr.message)
      return
    }

    clear()
    setSubmitting(false)
    setConfirmOpen(false)
    setPlaced(true)
  }

  if (placed) {
    return (
      <div className="phone-screen flex min-h-[100dvh] flex-col items-center justify-center bg-[#FAF6F0] px-8 text-center text-gray-900">
        <CheckCircle2 className="size-16 text-[#0e3d2a]" />
        <h1 className="mt-5 font-serif-display text-2xl font-bold text-[#0e3d2a]">{t('Khidmah Confirmed', 'ख़िदमत पुष्टि', lang)}</h1>
        {orderCode && (
          <p className="mt-3 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-[#a67c1f]">
            {orderCode}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          {t(
            `Your tabarruk order is booked for ${date} at ${time} · ${fulfillment === 'pickup' ? 'Store Pickup' : 'Home Delivery'}.`,
            `आपका तबर्रुक ऑर्डर ${date} को ${time} बजे बुक हो गया · ${fulfillment === 'pickup' ? 'स्टोर पिकअप' : 'होम डिलीवरी'}।`,
            lang
          )}
        </p>
        <p className="mt-3 text-xs text-gray-400">
          {t(
            `We've received your ${money(advance)} advance screenshot. The kitchen will verify it and accept your order shortly.`,
            `हमें आपका ${money(advance)} अग्रिम स्क्रीनशॉट मिल गया है। रसोई इसे सत्यापित कर शीघ्र ही आपका ऑर्डर स्वीकार करेगी।`,
            lang
          )}
        </p>
        <Link
          href="/menu"
          className="mt-8 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] px-8 py-3 text-sm font-bold text-[#1a1206]"
        >
          {t('Back to Menu', 'मेन्यू पर वापस', lang)}
        </Link>
      </div>
    )
  }

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#FAF6F0] pb-32 text-gray-900">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200/70 bg-[#FAF6F0]/90 px-5 py-3.5 backdrop-blur-md">
        <Link href="/cart" aria-label="Back" className="text-gray-500 hover:text-gray-800">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="font-serif-display text-xl font-bold text-gray-900">{t('Checkout', 'चेकआउट', lang)}</h1>
      </header>

      <div className="space-y-7 px-5 pt-5">
        {/* Order summary */}
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.25em] text-gray-400">{t('ORDER SUMMARY', 'ऑर्डर सारांश', lang)}</h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/50">
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">{t('Your cart is empty.', 'आपका कार्ट खाली है।', lang)}</p>
            ) : (
              items.map(({ item, qty }) => (
                <div key={item.id} className="flex justify-between py-1.5 text-sm">
                  <span className="text-gray-600">
                    {qty} × {item.name}
                  </span>
                  <span className="font-semibold text-gray-900">{money(item.price * qty)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Date & time */}
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.25em] text-gray-400">{t('DATE & TIME', 'तारीख़ और समय', lang)}</h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/50">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Calendar className="size-4" /> {t('Date', 'तारीख़', lang)}
            </label>
            {/* Same date picker as the menu page — opens the shared bottom sheet. */}
            <button
              type="button"
              onClick={() => setDateOpen(true)}
              className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 text-left text-sm outline-none transition-colors hover:border-gray-300 focus:border-gray-400"
            >
              <span className="flex items-baseline gap-1.5">
                <span className={date ? 'font-semibold text-gray-900' : 'text-gray-400'}>
                  {date ? formatIso(date) : t('Select a date', 'तारीख़ चुनें', lang)}
                </span>
                {date && hijriFromIso(date) && (
                  <span className="font-semibold text-[#e23744]">{hijriFromIso(date)}</span>
                )}
              </span>
              <ChevronDown className="size-4 shrink-0 text-gray-400" />
            </button>
            <div className="mb-4" />
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Clock className="size-4" /> {t('Time slot', 'समय स्लॉट', lang)}
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    time === slot
                      ? 'bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-[#1a1206]'
                      : 'border border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Order note (optional) */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gray-400">
            {t('ORDER NOTE', 'ऑर्डर नोट', lang)}
            <span className="text-[9px] text-gray-300">{t('OPTIONAL', 'वैकल्पिक', lang)}</span>
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/50">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t('Any special instructions for the kitchen — e.g. less sugar, packaging, landmark, majlis timing…', 'रसोई के लिए कोई विशेष निर्देश — जैसे कम चीनी, पैकेजिंग, लैंडमार्क, मजलिस समय…', lang)}
              className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
            />
          </div>
        </section>

        {/* Contact details */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gray-400">
            {t('CONTACT DETAILS', 'संपर्क विवरण', lang)}
            <span className="text-[9px] text-[#e23744]">{t('REQUIRED', 'आवश्यक', lang)}</span>
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/50">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">{t('Name', 'नाम', lang)}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('Enter your name', 'अपना नाम दर्ज करें', lang)}
              autoComplete="name"
              className="mb-4 h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
            />
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              {t('Alternate phone', 'वैकल्पिक फ़ोन', lang)} <span className="text-gray-400">{t('(optional)', '(वैकल्पिक)', lang)}</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={altPhone}
              onChange={(e) => setAltPhone(e.target.value)}
              placeholder={t('Another number we can reach you on', 'एक और नंबर जिस पर हम संपर्क कर सकें', lang)}
              autoComplete="tel"
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
            />
          </div>
        </section>

        {/* Fulfillment */}
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.25em] text-gray-400">{t('FULFILLMENT', 'पूर्ति', lang)}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFulfillment('pickup')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                fulfillment === 'pickup'
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Store className={`size-6 ${fulfillment === 'pickup' ? 'text-[#a67c1f]' : 'text-gray-400'}`} />
              <span className="text-sm font-bold">{t('Store Pickup', 'स्टोर पिकअप', lang)}</span>
              <span className="text-[10px] text-gray-400">{t('Free · No address', 'निःशुल्क · कोई पता नहीं', lang)}</span>
            </button>
            <button
              onClick={() => setFulfillment('delivery')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                fulfillment === 'delivery'
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Truck className={`size-6 ${fulfillment === 'delivery' ? 'text-[#a67c1f]' : 'text-gray-400'}`} />
              <span className="text-sm font-bold">{t('Home Delivery', 'होम डिलीवरी', lang)}</span>
              <span className="text-[10px] text-gray-400">{money(DELIVERY_FEE)} · {t('To your door', 'आपके द्वार तक', lang)}</span>
            </button>
          </div>

          {/* Conditional address */}
          {fulfillment === 'pickup' ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-500 shadow-sm shadow-gray-200/50">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#a67c1f]" />
              <div>
                <p className="font-semibold text-gray-800">{t('Pickup location', 'पिकअप स्थान', lang)}</p>
                <p>{STORE_ADDRESS}</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/50">
              <p className="text-xs font-bold tracking-[0.15em] text-[#a67c1f]">{t('DELIVERY ADDRESS', 'डिलीवरी पता', lang)}</p>
              <input
                placeholder={t('Full name', 'पूरा नाम', lang)}
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
              />
              <input
                placeholder={t('Street address', 'गली का पता', lang)}
                value={address.line}
                onChange={(e) => setAddress({ ...address, line: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
              />
              <input
                placeholder={t('Area / landmark (optional)', 'क्षेत्र / लैंडमार्क (वैकल्पिक)', lang)}
                value={address.area}
                onChange={(e) => setAddress({ ...address, area: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
              />
            </div>
          )}
        </section>

        {/* Totals */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-sm shadow-gray-200/50">
          <div className="flex justify-between text-gray-500">
            <span>{t('Subtotal', 'उप-योग', lang)}</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-gray-500">
            <span>{t('Service fee', 'सेवा शुल्क', lang)}</span>
            <span>{money(SERVICE_FEE)}</span>
          </div>
          <div className="mt-2 flex justify-between text-gray-500">
            <span>{fulfillment === 'delivery' ? t('Delivery fee', 'डिलीवरी शुल्क', lang) : t('Pickup', 'पिकअप', lang)}</span>
            <span>{deliveryFee ? money(deliveryFee) : t('Free', 'निःशुल्क', lang)}</span>
          </div>
          {packing !== 'none' && (
            <div className="mt-2 flex justify-between text-gray-500">
              <span>{t('Packing', 'पैकिंग', lang)} ({PACKING_LABEL[packing]})</span>
              <span>{money(packingFee)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
            <span>{t('Total', 'कुल', lang)}</span>
            <span style={{ color: GOLD }}>{money(total)}</span>
          </div>
        </section>

        {/* 40% advance payment */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gray-400">
            <QrCode className="size-3.5 text-[#a67c1f]" /> {t('ADVANCE PAYMENT (40%)', 'अग्रिम भुगतान (40%)', lang)}
            <span className="text-[9px] text-[#e23744]">{t('REQUIRED', 'आवश्यक', lang)}</span>
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/50">
            <p className="text-sm text-gray-500">
              {t(
                `Pay ${money(advance)} now to confirm your order. The remaining ${money(balance)} is collected on ${fulfillment === 'pickup' ? 'pickup' : 'delivery'}.`,
                `अपना ऑर्डर पक्का करने के लिए अभी ${money(advance)} भुगतान करें। शेष ${money(balance)} ${fulfillment === 'pickup' ? 'पिकअप' : 'डिलीवरी'} पर लिया जाएगा।`,
                lang
              )}
            </p>

            <div className="mt-4 flex flex-col items-center gap-3">
              <PaymentQR value={upiUri} size={196} />
              <p className="text-center text-[11px] text-gray-400">
                {t(
                  `Scan with any UPI app (GPay · PhonePe · Paytm) to pay ${money(advance)} to`,
                  `${money(advance)} भुगतान करने के लिए किसी भी UPI ऐप (GPay · PhonePe · Paytm) से स्कैन करें`,
                  lang
                )}{' '}
                <span className="text-gray-600">{UPI_VPA}</span>
              </p>
            </div>

            <label className="mt-5 mb-1.5 block text-xs font-semibold text-gray-500">
              {t('Payment screenshot', 'भुगतान स्क्रीनशॉट', lang)}
            </label>
            {proofPreview ? (
              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proofPreview} alt="Payment screenshot" className="max-h-64 w-full object-contain" />
                <button
                  type="button"
                  onClick={clearProof}
                  aria-label="Remove screenshot"
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-[#d4af37]">
                <Upload className="size-5" />
                <span className="text-xs font-semibold">{t('Tap to upload screenshot', 'स्क्रीनशॉट अपलोड करने के लिए टैप करें', lang)}</span>
                <span className="text-[10px] text-gray-400">{t('PNG or JPG · max 8 MB', 'PNG या JPG · अधिकतम 8 MB', lang)}</span>
                <input type="file" accept="image/*" onChange={onPickProof} className="hidden" />
              </label>
            )}
            <p className="mt-2 text-[11px] text-gray-400">
              {t(
                `Upload a screenshot of your ${money(advance)} payment. The kitchen verifies it before accepting your order.`,
                `अपने ${money(advance)} भुगतान का स्क्रीनशॉट अपलोड करें। रसोई आपका ऑर्डर स्वीकार करने से पहले इसे सत्यापित करती है।`,
                lang
              )}
            </p>
          </div>
        </section>

        {fulfillment === 'delivery' && (
          <p className="px-1 text-center text-[11px] text-gray-400">
            {t('Note: Home delivery charges will be added afterwards.', 'नोट: होम डिलीवरी शुल्क बाद में जोड़ा जाएगा।', lang)}
          </p>
        )}
      </div>

      {/* Place order */}
      <div className="phone-screen fixed inset-x-0 bottom-0 z-30 mx-auto border-t border-gray-200 bg-[#FAF6F0]/95 px-5 py-4 pb-safe backdrop-blur-md">
        <button
          onClick={reviewOrder}
          disabled={items.length === 0 || submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t(`Place Order · ${money(advance)} advance`, `ऑर्डर करें · ${money(advance)} अग्रिम`, lang)
          )}
        </button>
      </div>

      {/* Date picker — identical to the menu's date selector. */}
      {dateOpen && (
        <DateSheet
          options={dateOptions}
          selected={date || null}
          onSelect={(iso) => {
            setDate(iso)
            setDateOpen(false)
          }}
          onClose={() => setDateOpen(false)}
        />
      )}

      {/* Final review — verify order & address before placing. */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !submitting && setConfirmOpen(false)}
        >
          <div
            className="phone-screen w-full rounded-t-3xl border-t border-gray-100 bg-white p-5 pb-8 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-gray-900">{t('Review your order', 'अपना ऑर्डर जाँचें', lang)}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{t('Please verify the details below before placing.', 'कृपया ऑर्डर देने से पहले नीचे दिए विवरण जाँच लें।', lang)}</p>
              </div>
              <button onClick={() => !submitting && setConfirmOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-700">
                <X className="size-5" />
              </button>
            </div>

            {/* Can't-change-later warning */}
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#e23744]/25 bg-[#e23744]/[0.06] px-3.5 py-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#e23744]" />
              <p className="text-xs font-semibold leading-relaxed text-[#b0343f]">
                {t(
                  'Order details cannot be changed after placing. Please make sure your items and address are correct.',
                  'ऑर्डर देने के बाद विवरण नहीं बदले जा सकते। कृपया सुनिश्चित करें कि आपकी वस्तुएँ और पता सही हैं।',
                  lang
                )}
              </p>
            </div>

            <div className="max-h-[45vh] space-y-4 overflow-y-auto">
              {/* Items */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                {items.map(({ item, qty }) => (
                  <div key={item.id} className="flex justify-between py-1 text-sm">
                    <span className="text-gray-600">{qty} × {item.name}</span>
                    <span className="font-semibold text-gray-900">{money(item.price * qty)}</span>
                  </div>
                ))}
              </div>

              {/* When & how */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="size-4 text-[#a67c1f]" />
                  <span className="font-semibold text-gray-900">{date ? formatIso(date) : '—'}</span>
                  <span className="text-gray-400">·</span>
                  <Clock className="size-4 text-[#a67c1f]" />
                  <span className="font-semibold text-gray-900">{time || '—'}</span>
                </div>
                <div className="mt-2.5 flex items-start gap-2 text-gray-600">
                  {fulfillment === 'pickup' ? <Store className="mt-0.5 size-4 shrink-0 text-[#a67c1f]" /> : <MapPin className="mt-0.5 size-4 shrink-0 text-[#a67c1f]" />}
                  {fulfillment === 'pickup' ? (
                    <span>
                      <span className="font-semibold text-gray-900">{t('Store Pickup', 'स्टोर पिकअप', lang)}</span>
                      <span className="block text-xs text-gray-500">{STORE_ADDRESS}</span>
                    </span>
                  ) : (
                    <span>
                      <span className="font-semibold text-gray-900">{t('Home Delivery', 'होम डिलीवरी', lang)}</span>
                      <span className="block text-xs text-gray-500">
                        {address.name} · {address.line}{address.area ? `, ${address.area}` : ''}
                      </span>
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-center gap-2 text-gray-600">
                  <span className="text-xs text-gray-400">{t('Phone', 'फ़ोन', lang)}:</span>
                  <span className="font-semibold text-gray-900">{phone}{altPhone.trim() ? ` · ${altPhone.trim()}` : ''}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3 text-sm">
                <span className="font-bold text-gray-900">{t('Total', 'कुल', lang)}</span>
                <span className="font-bold" style={{ color: GOLD }}>{money(total)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="h-12 flex-1 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {t('Go back & edit', 'वापस जाकर बदलें', lang)}
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : t('Confirm & Place Order', 'पुष्टि करें और ऑर्डर करें', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
