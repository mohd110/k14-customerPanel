'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Search, ShoppingBag, CalendarDays, ChevronDown, Check, Plus, X, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product, Store } from '@/lib/types'
import { useCart, useHydrated, cartCount, useMenuDate, useLanguage, t } from '@/lib/k14-store'
import { money } from '@/lib/format'
import { placeholderImage } from '@/lib/placeholder-image'
import { galleryFor, GALLERY_CAPTIONS } from '@/lib/product-gallery'
import ProductImageSlider from '@/components/ProductImageSlider'
import { upcomingDatesThrough, endOfAugustIso, formatIso, hijriFromIso, minMenuIso, type DateOption } from '@/lib/dates'
import BottomNav from '@/components/BottomNav'

function ItemCard({
  item,
  onAdd,
  available = true,
}: {
  item: Product
  onAdd: (item: Product, qty: number) => void
  available?: boolean
}) {
  const [qtyText, setQtyText] = useState('')
  const qty = Math.max(0, parseInt(qtyText, 10) || 0)
  const { lang } = useLanguage()
  const handleAdd = () => {
    if (qty < 1) { toast.error(t('Enter a quantity first', 'पहले मात्रा दर्ज करें', lang)); return }
    onAdd(item, qty)
  }
  const gallery = galleryFor(item.id)
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-[#17120c] ${available ? '' : 'opacity-80'}`}>
      {gallery ? (
        <ProductImageSlider images={gallery} captions={GALLERY_CAPTIONS} alt={item.name} available={available} />
      ) : (
        <div className="relative aspect-square w-full overflow-hidden bg-white">
          <img src={item.photo_url || placeholderImage(item.name)} alt={item.name} className={`h-full w-full object-contain transition-all ${available ? '' : 'grayscale'}`} />
          {!available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-md border border-white/30 bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white">{t('Out of stock', 'स्टॉक ख़त्म', lang)}</span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif-display text-lg font-bold text-white">{item.name}</h3>
          <span className="shrink-0 font-bold text-[#d4af37]">{money(item.price)}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-white/50">{item.description}</p>
        {available && (
          <p className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] ${(item.stock ?? 0) <= 10 ? 'bg-[#e23744]/15 text-[#f08089]' : 'bg-[#d4af37]/12 text-[#d4af37]'}`}>
            {(item.stock ?? 0) <= 10
              ? t(`Only ${item.stock} left for this date`, `इस तारीख़ के लिए केवल ${item.stock} बचे`, lang)
              : t(`${item.stock} left for this date`, `इस तारीख़ के लिए ${item.stock} बचे`, lang)}
          </p>
        )}
        {available ? (
          <div className="mt-4 flex items-stretch gap-2">
            <div className="flex shrink-0 flex-col items-center">
              <label className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#d4af37]/70">{t('QTY', 'मात्रा', lang)}</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label={`Quantity for ${item.name}`} value={qtyText} placeholder="--" onChange={(e) => setQtyText(e.target.value.replace(/[^0-9]/g, ''))} onBlur={() => setQtyText(qty > 0 ? String(qty) : '')} className="h-11 w-16 rounded-lg border border-white/15 bg-black/30 text-center text-base font-bold text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <button onClick={handleAdd} className="mt-[18px] flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-xs font-bold text-[#1a1206] transition-transform active:scale-[0.98]"><Plus className="size-4" /> {t('Add to Tabarruk', 'तबर्रुक में जोड़ें', lang)}</button>
          </div>
        ) : (
          <button disabled className="mt-4 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/15 text-xs font-bold text-white/40">{t('Out of stock on this date', 'इस तारीख़ पर स्टॉक ख़त्म', lang)}</button>
        )}
      </div>
    </div>
  )
}

function DateSheet({ options, selected, onSelect, onClose }: { options: DateOption[]; selected: string | null; onSelect: (iso: string) => void; onClose: () => void }) {
  const { lang } = useLanguage()
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="phone-screen w-full rounded-t-3xl border-t border-[#d4af37]/20 bg-[#17120c] p-6 pb-8 animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div><h3 className="font-serif-display text-lg font-bold text-white">{t('Select a date', 'तारीख़ चुनें', lang)}</h3><p className="mt-0.5 text-xs text-white/50">{t("Choose a delivery date to see that day's menu.", 'उस दिन का मेन्यू देखने के लिए डिलीवरी तारीख़ चुनें।', lang)}</p></div>
          <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white"><X className="size-5" /></button>
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto">
          {options.map((d) => {
            const active = d.iso === selected
            return (
              <button key={d.iso} onClick={() => onSelect(d.iso)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${active ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-black/30">
                    <span className="text-[9px] font-bold tracking-wider text-[#d4af37]">{d.month.toUpperCase()}</span>
                    <span className="text-base font-bold leading-none text-white">{d.day}</span>
                  </div>
                  <div><p className="text-sm font-semibold text-white">{d.weekday}</p><p className="text-xs text-white/45">{d.full}</p>{hijriFromIso(d.iso) && <p className="text-[11px] font-semibold text-[#e23744]">{hijriFromIso(d.iso)}</p>}</div>
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

export default function StoreMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [availableIds, setAvailableIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [dateOpen, setDateOpen] = useState(false)
  const router = useRouter()

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
    return <div className="phone-screen min-h-[100dvh] flex items-center justify-center bg-[#0e0b08]"><Loader2 className="size-7 animate-spin text-emerald-400" /></div>
  }

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#0e0b08] pb-24 text-white">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0e0b08]/95 px-5 py-3.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/stores" className="text-white/60 hover:text-white"><ArrowLeft className="size-5" /></Link>
          <div>
            <p className="text-xs font-bold text-emerald-400">{store.name}</p>
            <p className="text-[10px] text-white/40">{store.short_desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <button aria-label="Search"><Search className="size-5" /></button>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag className="size-5" />
            {count > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[9px] font-bold text-[#1a1206]">{count}</span>}
          </Link>
        </div>
      </header>

      <section className="px-5 pt-6">
        <h1 className="font-serif-display text-3xl font-bold leading-tight text-white">{store.name}</h1>
        <p className="mt-1 text-sm text-white/50">{store.description}</p>
      </section>

      <main className="mt-6 px-5">
        {!selectedDate ? (
          <button onClick={() => setDateOpen(true)} className="flex w-full flex-col items-center gap-4 rounded-2xl border border-dashed border-[#d4af37]/40 bg-[#d4af37]/[0.06] px-6 py-12 text-center">
            <CalendarDays className="size-10 text-[#d4af37]" />
            <div><p className="font-serif-display text-lg font-bold text-white">{t('Please select a date', 'कृपया एक तारीख़ चुनें', lang)}</p><p className="mt-1 text-xs text-white/50">{t("Pick a date to see what's available.", 'उपलब्ध वस्तुएँ देखने के लिए तारीख़ चुनें।', lang)}</p></div>
            <span className="mt-1 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] px-4 py-2 text-xs font-bold text-[#1a1206]"><CalendarDays className="size-4" /> {t('Select date', 'तारीख़ चुनें', lang)}</span>
          </button>
        ) : loading ? (
          <div className="flex justify-center py-20 text-[#d4af37]"><Loader2 className="size-7 animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center"><p className="text-sm text-white/60">{t(`No items available for ${formatIso(selectedDate)}.`, `${formatIso(selectedDate)} के लिए कोई वस्तु उपलब्ध नहीं।`, lang)}</p><button onClick={() => setDateOpen(true)} className="mt-3 text-xs font-bold text-[#d4af37] underline underline-offset-4">{t('Try another date', 'दूसरी तारीख़ आज़माएँ', lang)}</button></div>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="font-serif-display text-xl font-bold text-white">{t('Menu', 'मेन्यू', lang)}</h2><p className="text-xs text-white/45">{t(`for ${formatIso(selectedDate)}`, `${formatIso(selectedDate)} के लिए`, lang)}</p></div>
              <span className="rounded-md border border-[#d4af37]/30 px-2 py-0.5 text-[9px] font-bold tracking-[0.15em] text-[#d4af37]">{products.filter((p) => isAvailable(p)).length} {t('AVAILABLE', 'उपलब्ध', lang)}</span>
            </div>
            <div className="space-y-5">{products.map((item) => <ItemCard key={item.id} item={item} onAdd={confirmAdd} available={isAvailable(item)} />)}</div>
          </section>
        )}
      </main>

      <footer className="mt-10 border-t border-white/10 px-6 py-8 text-center">
        <p className="text-xs text-white/30 font-medium">Book My Tabarruk</p>
        <p className="mt-2 text-[10px] text-white/20">{store.name} &middot; {store.short_desc}</p>
      </footer>

      <BottomNav />

      {dateOpen && <DateSheet options={dateOptions} selected={selectedDate} onSelect={(iso) => { setSelectedDate(iso); setDateOpen(false) }} onClose={() => setDateOpen(false)} />}
    </div>
  )
}