'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowUpRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage, useActiveStore, t } from '@/lib/k14-store'
import { money } from '@/lib/format'
import { galleryFor } from '@/lib/product-gallery'
import { placeholderImage } from '@/lib/placeholder-image'
import type { Product, Store } from '@/lib/types'

const GREEN = '#0e3d2a'

/* Local brand logos per store slug — mirrors the /stores mapping. */
const STORE_LOGOS: Record<string, string> = {
  'k14-bakery': '/k14-logo.png',
  'kebabchi': '/kebabchi-logo.jpg',
  'kabacchi': '/kebabchi-logo.jpg',
}
const STORE_LOGO_BG: Record<string, string> = {
  'kebabchi': '#1a1a1a',
  'kabacchi': '#1a1a1a',
}

type Result = Product & { store: Store }

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { lang } = useLanguage()
  const setStore = useActiveStore((s) => s.setStore)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load active stores + their available products once, then filter locally
  // so results appear instantly as the customer types (no per-keystroke fetch).
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .then(async ({ data: stores }: { data: Store[] | null }) => {
        if (!stores || stores.length === 0) { setLoading(false); return }
        const byId = new Map(stores.map((s) => [s.id, s]))
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .in('store_id', stores.map((s) => s.id))
        const withStore = (prods ?? [])
          .map((p: Product) => (p.store_id && byId.has(p.store_id) ? { ...p, store: byId.get(p.store_id)! } : null))
          .filter((r): r is Result => r !== null)
        setProducts(withStore)
        setLoading(false)
      })
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .slice(0, 40)
  }, [query, products])

  function openProduct(r: Result) {
    setStore(r.store.id, r.store.slug)
    router.push(`/stores/${r.store.slug}/menu?product=${r.id}`)
  }

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#FAF6F0] pb-16 text-gray-900">
      {/* Header — mirrors /stores so entering search feels in-place, not a page jump */}
      <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-[#FAF6F0]/90 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/new-logo.jpeg" alt="BMT" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d4af37]/50" />
          <div>
            <p className="font-serif-display text-base font-bold leading-tight text-[#0e3d2a]">
              Book<span className="text-[#d4af37]">My</span>Tabarruk
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0e3d2a]/60">
              {t('Search Products', 'उत्पाद खोजें', lang)}
            </p>
          </div>
        </div>

        {/* Search bar — same position/shape as the /stores bar, now a live input */}
        <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-[#0e3d2a] focus-within:ring-2 focus-within:ring-[#0e3d2a]/10 transition-all">
          <Search className="size-4 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search for products…', 'उत्पाद खोजें…', lang)}
            className="h-5 w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
          <button
            onClick={() => (query ? setQuery('') : router.push('/stores'))}
            aria-label={query ? 'Clear' : 'Back'}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="px-5 pt-5">
        {loading ? (
          <div className="flex justify-center py-20 text-[#0e3d2a]"><Loader2 className="size-6 animate-spin" /></div>
        ) : !query.trim() ? (
          <p className="pt-16 text-center text-sm text-gray-400">
            {t('Type to search across all stores.', 'सभी स्टोर में खोजने के लिए टाइप करें।', lang)}
          </p>
        ) : results.length === 0 ? (
          <p className="pt-16 text-center text-sm text-gray-400">
            {t(`No products found for “${query}”.`, `“${query}” के लिए कोई उत्पाद नहीं मिला।`, lang)}
          </p>
        ) : (
          <div className="space-y-3">
            {results.map((r) => {
              const img = galleryFor(r.id)?.[0] || r.photo_url || placeholderImage(r.name)
              const accent = r.store.theme_color || GREEN
              const logo = r.store.logo_url || STORE_LOGOS[r.store.slug]
              return (
                <button
                  key={r.id}
                  onClick={() => openProduct(r)}
                  className="group flex w-full items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm transition-all active:scale-[0.99] hover:shadow-md"
                >
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={r.name} className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold capitalize text-gray-900">{r.name}</p>
                    <p className="mt-0.5 font-bold text-[#b8952a]">{money(r.price)}</p>
                    <span className="mt-1 inline-flex items-center gap-1.5">
                      <span
                        className="flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-[5px]"
                        style={{ background: logo ? STORE_LOGO_BG[r.store.slug] || GREEN : `${accent}18` }}
                      >
                        {logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} alt={r.store.name} className="h-full w-full object-contain p-px" />
                        )}
                      </span>
                      <span className="truncate text-[11px] font-semibold text-gray-500">{r.store.name}</span>
                    </span>
                  </div>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#b8952a] transition-colors group-hover:bg-[#d4af37] group-hover:text-white">
                    <ArrowUpRight className="size-4" />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
