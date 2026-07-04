'use client'

import { Suspense, useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Search, ShoppingBag, CalendarDays, Plus, X, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product, Store } from '@/lib/types'
import { useCart, useHydrated, cartCount, useMenuDate, useLanguage, t } from '@/lib/k14-store'
import { money } from '@/lib/format'
import { placeholderImage } from '@/lib/placeholder-image'
import { galleryFor, GALLERY_CAPTIONS } from '@/lib/product-gallery'
import ProductImageSlider from '@/components/ProductImageSlider'
import { upcomingDatesThrough, endOfAugustIso, formatIso, minMenuIso } from '@/lib/dates'
import BottomNav from '@/components/BottomNav'
import BrandFooter from '@/components/BrandFooter'
import DateSheet from '@/components/DateSheet'

function ItemCard({
  item,
  onAdd,
  available = true,
  accent,
}: {
  item: Product
  onAdd: (item: Product, qty: number) => void
  available?: boolean
  accent: string
}) {
  const [open, setOpen] = useState(false)
  const { lang } = useLanguage()
  const gallery = galleryFor(item.id)
  const heroImg = gallery?.[0] || item.photo_url || placeholderImage(item.name)
  return (
    <>
      <div className={`flex gap-4 ${available ? '' : 'opacity-70'}`}>
        {/* Left: details */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-serif-display text-lg font-bold capitalize leading-snug text-gray-900">{item.name}</h3>
          <span className="mt-1 font-bold" style={{ color: accent }}>{money(item.price)}</span>
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500">{item.description}</p>
          {!available && (
            <span className="mt-2 inline-flex w-fit items-center rounded-md border border-gray-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">{t('Out of stock on this date', 'इस तारीख़ पर स्टॉक ख़त्म', lang)}</span>
          )}
        </div>

        {/* Right: static image + Add button that opens the popup */}
        <div className="relative w-32 shrink-0 self-start">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="relative aspect-square w-full overflow-hidden bg-white">
              <img src={heroImg} alt={item.name} className={`h-full w-full object-contain transition-all ${available ? '' : 'grayscale'}`} />
              {!available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded-md border border-white/30 bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">{t('Out of stock', 'स्टॉक ख़त्म', lang)}</span>
                </div>
              )}
            </div>
          </div>
          {available && (
            <button onClick={() => setOpen(true)} aria-label={`Add ${item.name}`} style={{ borderColor: `${accent}66`, color: accent }} className="absolute -bottom-3 left-1/2 flex h-9 min-w-[86px] -translate-x-1/2 items-center justify-center gap-1 rounded-lg border bg-white text-xs font-extrabold uppercase tracking-wide shadow-lg shadow-gray-300/70 transition-transform active:scale-[0.97]">
              <Plus className="size-3.5" /> {t('Add', 'जोड़ें', lang)}
            </button>
          )}
        </div>
      </div>

      {open && available && (
        <ItemSheet item={item} gallery={gallery} accent={accent} onConfirm={(qty) => { onAdd(item, qty); setOpen(false) }} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

function ItemSheet({ item, gallery, accent, onConfirm, onClose }: { item: Product; gallery: string[] | null; accent: string; onConfirm: (qty: number) => void; onClose: () => void }) {
  const [qtyText, setQtyText] = useState('')
  const qty = Math.max(0, parseInt(qtyText, 10) || 0)
  const { lang } = useLanguage()
  const confirm = () => {
    if (qty < 1) { toast.error(t('Enter a quantity first', 'पहले मात्रा दर्ज करें', lang)); return }
    onConfirm(qty)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="phone-screen w-full rounded-t-3xl border-t border-gray-100 bg-white p-5 pb-8 animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif-display text-lg font-bold capitalize text-gray-900">{item.name}</h3>
            <span className="font-bold" style={{ color: accent }}>{money(item.price)}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700"><X className="size-5" /></button>
        </div>

        {/* Both packaging images */}
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          {gallery ? (
            <ProductImageSlider images={gallery} captions={GALLERY_CAPTIONS} alt={item.name} />
          ) : (
            <div className="relative aspect-square w-full overflow-hidden bg-white">
              <img src={item.photo_url || placeholderImage(item.name)} alt={item.name} className="h-full w-full object-contain" />
            </div>
          )}
        </div>

        {item.description && <p className="mt-3 text-xs leading-relaxed text-gray-500">{item.description}</p>}

        {/* Quantity selector — same plain number-field format */}
        <div className="mt-4 flex items-center gap-3">
          <label className="text-[10px] font-bold tracking-[0.15em]" style={{ color: accent }}>{t('QTY', 'मात्रा', lang)}</label>
          <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label={`Quantity for ${item.name}`} autoFocus value={qtyText} placeholder="--" onChange={(e) => setQtyText(e.target.value.replace(/[^0-9]/g, ''))} onBlur={() => setQtyText(qty > 0 ? String(qty) : '')} className="h-11 w-16 rounded-lg border border-gray-200 bg-gray-50 text-center text-base font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
        </div>

        <button onClick={confirm} style={{ backgroundColor: accent }} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98]">
          <Plus className="size-4" /> {t('Add to Tabarruk', 'तबर्रुक में जोड़ें', lang)}
        </button>
      </div>
    </div>
  )
}

export default function StoreMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="phone-screen min-h-[100dvh] bg-[#FAF6F0]" />}>
      <StoreMenuInner params={params} />
    </Suspense>
  )
}

function StoreMenuInner({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [availableIds, setAvailableIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [dateOpen, setDateOpen] = useState(false)
  const [flashId, setFlashId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusProductId = searchParams.get('product')

  const items = useCart((s) => s.items)
  const add = useCart((s) => s.add)
  const clear = useCart((s) => s.clear)
  const hydrated = useHydrated()
  const count = hydrated ? cartCount(items) : 0
  const { lang } = useLanguage()

  const selectedDate = useMenuDate((s) => s.date)
  const setSelectedDate = useMenuDate((s) => s.setDate)
  const dateOptions = upcomingDatesThrough(endOfAugustIso())

  useEffect(() => {
    if (selectedDate && selectedDate < minMenuIso()) setSelectedDate(null)
  }, [selectedDate, setSelectedDate])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('stores').select('*').eq('slug', slug).single().then(({ data }: { data: Store | null }) => {
      if (!data) { router.push('/stores'); return }
      setStore(data)
    })
  }, [slug, router])

  useEffect(() => {
    if (!store || !selectedDate) { setLoading(false); return }
    setLoading(true)
    const supabase = createClient()
    Promise.all([
      supabase.from('products').select('*').eq('is_available', true).eq('store_id', store.id).order('created_at', { ascending: true }),
      supabase.from('product_availability').select('product_id').eq('available_date', selectedDate),
    ]).then(([prodRes, availRes]: [{ data: Product[] | null; error: unknown }, { data: { product_id: string }[] | null; error: unknown }]) => {
      if (prodRes.error) toast.error(t('Could not load menu', 'मेन्यू लोड नहीं हो सका', lang))
      else setProducts(prodRes.data ?? [])
      setAvailableIds(new Set((availRes.data ?? []).map((r) => r.product_id)))
      setLoading(false)
    })
  }, [store, selectedDate])

  // Deep-link from global search: scroll to the product and flash it once loaded.
  useEffect(() => {
    if (!focusProductId || loading || products.length === 0) return
    if (!products.some((p) => p.id === focusProductId)) return
    const el = document.getElementById(`product-${focusProductId}`)
    if (!el) return
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setFlashId(focusProductId)
      setTimeout(() => setFlashId(null), 2000)
    }, 250)
    return () => clearTimeout(timer)
  }, [focusProductId, loading, products])

  const isAvailable = (item: Product) => availableIds.has(item.id) && (item.stock ?? 0) > 0
  const confirmAdd = (item: Product, qty: number) => {
    // One cart per store: if the cart already holds another store's items,
    // ask to start a fresh cart for this store before adding.
    const cartStore = items.find((ci) => ci.item.store_id)?.item.store_id
    if (items.length > 0 && cartStore && cartStore !== item.store_id) {
      const ok = window.confirm(
        t(
          'Your cart has items from another store. Start a new cart for this store? Your current cart will be cleared.',
          'आपके कार्ट में किसी अन्य दुकान की वस्तुएँ हैं। इस दुकान के लिए नया कार्ट शुरू करें? आपका मौजूदा कार्ट खाली हो जाएगा।',
          lang
        )
      )
      if (!ok) return
      clear()
    }
    add(item, qty)
    toast.success(t(`${qty} × ${item.name} added`, `${qty} × ${item.name} जोड़ा गया`, lang))
  }

  if (!store) {
    return <div className="phone-screen min-h-[100dvh] flex items-center justify-center bg-[#FAF6F0]"><Loader2 className="size-7 animate-spin text-[#0e3d2a]" /></div>
  }

  // Store's onboarding brand colour drives the menu accents; fall back to gold.
  const accent = store.theme_color && store.theme_color !== '#000000' ? store.theme_color : '#d4af37'

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#FAF6F0] pb-24 text-gray-900">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-gray-200/70 bg-[#FAF6F0]/90 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/stores" className="text-gray-500 hover:text-gray-800"><ArrowLeft className="size-5" /></Link>
          <div>
            <p className="text-xs font-bold" style={{ color: accent }}>{store.name}</p>
            <p className="text-[10px] text-gray-500 capitalize">{store.short_desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button onClick={() => router.push('/search')} aria-label="Search"><Search className="size-5" /></button>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag className="size-5" />
            {count > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white" style={{ backgroundColor: accent }}>{count}</span>}
          </Link>
        </div>
      </header>

      <section className="px-5 pt-6">
        <h1 className="font-serif-display text-3xl font-bold leading-tight text-gray-900">{store.name}</h1>
        <p className="mt-1 text-sm capitalize text-gray-500">{store.description}</p>
      </section>

      <main className="mt-6 px-5">
        {!selectedDate ? (
          <button onClick={() => setDateOpen(true)} style={{ borderColor: `${accent}66`, backgroundColor: `${accent}10` }} className="flex w-full flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-12 text-center">
            <CalendarDays className="size-10" style={{ color: accent }} />
            <div><p className="font-serif-display text-lg font-bold text-gray-900">{t('Please select a date', 'कृपया एक तारीख़ चुनें', lang)}</p><p className="mt-1 text-xs text-gray-500">{t("Pick a date to see what's available.", 'उपलब्ध वस्तुएँ देखने के लिए तारीख़ चुनें।', lang)}</p></div>
            <span className="mt-1 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: accent }}><CalendarDays className="size-4" /> {t('Select date', 'तारीख़ चुनें', lang)}</span>
          </button>
        ) : loading ? (
          <div className="flex justify-center py-20" style={{ color: accent }}><Loader2 className="size-7 animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center"><p className="text-sm text-gray-500">{t(`No items available for ${formatIso(selectedDate)}.`, `${formatIso(selectedDate)} के लिए कोई वस्तु उपलब्ध नहीं।`, lang)}</p><button onClick={() => setDateOpen(true)} className="mt-3 text-xs font-bold underline underline-offset-4" style={{ color: accent }}>{t('Try another date', 'दूसरी तारीख़ आज़माएँ', lang)}</button></div>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="font-serif-display text-xl font-bold text-gray-900">{t('Menu', 'मेन्यू', lang)}</h2><p className="text-xs text-gray-500">{t(`for ${formatIso(selectedDate)}`, `${formatIso(selectedDate)} के लिए`, lang)}</p></div>
              <span className="rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-[0.15em]" style={{ borderColor: `${accent}4d`, color: accent }}>{products.filter((p) => isAvailable(p)).length} {t('AVAILABLE', 'उपलब्ध', lang)}</span>
            </div>
            <div className="divide-y divide-gray-200">{products.map((item) => <div key={item.id} id={`product-${item.id}`} style={flashId === item.id ? { backgroundColor: `${accent}1a`, boxShadow: `inset 0 0 0 1px ${accent}66` } : undefined} className="scroll-mt-24 rounded-2xl px-2 py-6 transition-colors duration-700"><ItemCard item={item} onAdd={confirmAdd} available={isAvailable(item)} accent={accent} /></div>)}</div>
          </section>
        )}
      </main>

      <footer className="mt-10 border-t border-gray-200 px-6 py-8 text-center">
        <p className="text-xs text-gray-400 font-medium">Book My Tabarruk</p>
        <p className="mt-2 text-[10px] text-gray-400 capitalize">{store.name} &middot; {store.short_desc}</p>
      </footer>

      {/* FSSAI licence disclaimer — Swiggy-style understated line at the menu's end. */}
      <section className="px-6 pb-4 pt-2">
        <p className="font-serif-display text-lg font-bold leading-tight text-gray-300">
          {t('License No.', 'लाइसेंस नं.', lang)}
        </p>
        <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-gray-300">
          22726751000157
        </p>
      </section>

      <BrandFooter className="pb-24" />

      <BottomNav />

      {dateOpen && <DateSheet options={dateOptions} selected={selectedDate} onSelect={(iso) => { setSelectedDate(iso); setDateOpen(false) }} onClose={() => setDateOpen(false)} accent={accent} />}
    </div>
  )
}