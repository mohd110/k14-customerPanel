'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowUpRight, Wheat, UtensilsCrossed, Package, Lock, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage, useActiveStore, t } from '@/lib/k14-store'
import type { Store } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import BrandFooter from '@/components/BrandFooter'

const GREEN = '#0e3d2a'

/* Local brand logos per store slug (until each store has its own logo_url in
   the DB). The kebabchi logo will be dropped in here once provided. */
const STORE_LOGOS: Record<string, string> = {
  'k14-bakery': '/k14-logo.png',
  'kebabchi': '/kebabchi-logo.jpg',
  'kabacchi': '/kebabchi-logo.jpg', // pre-rename slug fallback
}

/* Background behind a store's logo (some logos ship with their own bg colour). */
const STORE_LOGO_BG: Record<string, string> = {
  'kebabchi': '#1a1a1a',
  'kabacchi': '#1a1a1a',
}

/* ── store icon map — fallback icons per slug ── */
function StoreIcon({ slug, color, className = 'size-8' }: { slug: string; color: string; className?: string }) {
  const style = { color }
  if (
    slug.includes('kebab') || slug.includes('kabab') || slug.includes('kabac') ||
    slug.includes('biryani') || slug.includes('restaurant')
  ) {
    return <UtensilsCrossed className={className} style={style} />
  }
  if (slug.includes('crockery') || slug.includes('kitchen')) {
    return <Package className={className} style={style} />
  }
  return <Wheat className={className} style={style} />
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { lang } = useLanguage()
  const setStore = useActiveStore((s) => s.setStore)

  useEffect(() => { setMounted(true) }, [])

  // Prefetch the search page so opening it feels in-place, not like a nav.
  useEffect(() => { router.prefetch('/search') }, [router])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('stores')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }: { data: Store[] | null }) => {
        if (data) setStores(data)
        setLoading(false)
      })
  }, [])

  function handleStoreSelect(store: Store) {
    if (!store.is_active) return
    setStore(store.id, store.slug)
    router.push(`/stores/${store.slug}/menu`)
  }

  if (loading) {
    return (
      <div className="phone-screen min-h-[100dvh] flex items-center justify-center bg-[#FAF6F0]">
        <Loader2 className="size-7 animate-spin text-[#0e3d2a]" />
      </div>
    )
  }

  const activeStores = stores.filter((s) => s.is_active)
  const comingSoon = stores.filter((s) => !s.is_active)

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#FAF6F0] pb-28 text-gray-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-[#FAF6F0]/90 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/new-logo.jpeg" alt="BMT" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d4af37]/50" />
          <div>
            <p className="font-serif-display text-base font-bold leading-tight text-[#0e3d2a]">
              Book<span className="text-[#d4af37]">My</span>Tabarruk
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0e3d2a]/60">
              {t('Choose a Store', 'स्टोर चुनें', lang)}
            </p>
          </div>
        </div>

        {/* Search bar — tapping opens /search where this same bar becomes a live input */}
        <button
          onClick={() => router.push('/search')}
          className="mt-3 flex w-full items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-[#0e3d2a]/30 active:scale-[0.99]"
        >
          <Search className="size-4 shrink-0 text-gray-400" />
          <span className="text-sm text-gray-400">{t('Search for products…', 'उत्पाद खोजें…', lang)}</span>
        </button>
      </header>

      <div className="px-5 pt-7 space-y-8">

        {/* ── Active stores ── */}
        {activeStores.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[11px] font-extrabold tracking-[0.24em] text-[#0e3d2a]">
                {t('OPEN NOW', 'अभी उपलब्ध', lang)}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
            </div>

            <div className="flex flex-wrap gap-4">
              {activeStores.map((store, i) => {
                const accent = store.theme_color || GREEN
                const logo = store.logo_url || STORE_LOGOS[store.slug]
                return (
                  <button
                    key={store.id}
                    id={`store-${store.slug}`}
                    onClick={() => handleStoreSelect(store)}
                    className="group relative flex aspect-square w-[calc(50%-0.5rem)] flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 text-center shadow-lg shadow-gray-200/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateY(0)' : 'translateY(18px)',
                      transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s, box-shadow 0.2s`,
                    }}
                  >
                    {/* soft accent wash at the top */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-16"
                      style={{ background: `linear-gradient(180deg, ${accent}12 0%, transparent 100%)` }}
                    />
                    {/* corner CTA */}
                    <span className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#b8952a] transition-colors group-hover:bg-[#d4af37] group-hover:text-white">
                      <ArrowUpRight className="size-4" />
                    </span>

                    {/* Store logo / icon */}
                    <div
                      className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                      style={
                        logo
                          ? { background: STORE_LOGO_BG[store.slug] || GREEN, borderColor: `${accent}30` }
                          : { background: `${accent}14`, borderColor: `${accent}33` }
                      }
                    >
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt={store.name} className="h-full w-full object-contain p-1.5" />
                      ) : (
                        <StoreIcon slug={store.slug} color={accent} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="relative min-w-0">
                      <h2 className="text-[15px] font-extrabold leading-tight text-gray-900">
                        {store.name}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-gray-500 capitalize">
                        {store.short_desc}
                      </p>
                    </div>

                    {/* OPEN badge */}
                    <span
                      className="relative inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[8.5px] font-bold tracking-[0.14em]"
                      style={{ background: `${accent}16`, color: accent }}
                    >
                      <span className="inline-block size-1.5 animate-pulse rounded-full bg-current" />
                      {t('OPEN', 'खुला', lang)}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Coming soon stores ── */}
        {comingSoon.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[11px] font-bold tracking-[0.24em] text-gray-400">
                {t('COMING SOON', 'जल्द आ रहा है', lang)}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent" />
            </div>

            <div className="flex flex-wrap gap-4">
              {comingSoon.map((store, i) => (
                <div
                  key={store.id}
                  className="relative flex aspect-square w-[calc(50%-0.5rem)] flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50/80 p-4 text-center"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(18px)',
                    transition: `opacity 0.5s ease ${(activeStores.length + i) * 0.08 + 0.1}s, transform 0.5s ease ${(activeStores.length + i) * 0.08 + 0.1}s`,
                  }}
                >
                  <span className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-gray-200/70 text-gray-400">
                    <Lock className="size-3.5" />
                  </span>

                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                    <StoreIcon slug={store.slug} color="#9ca3af" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[15px] font-extrabold leading-tight text-gray-400">{store.name}</h2>
                    <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-gray-400/80 capitalize">{store.short_desc}</p>
                  </div>

                  <span className="inline-flex items-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/[0.08] px-2.5 py-0.5 text-[8.5px] font-bold tracking-[0.14em] text-[#b8952a]">
                    {t('SOON', 'जल्द', lang)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Bottom tagline ── */}
        <div
          className="pt-2"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 0.6s' }}
        >
          <div className="niyaz-bar">
            {t('NIYAZ', 'नियाज़', lang)}
            <span className="opacity-40">·</span>
            {t('BARKAT', 'बरकत', lang)}
            <span className="opacity-40">·</span>
            {t('IBAADAT', 'इबादत', lang)}
          </div>
          <p className="mt-2 text-center text-[9px] font-semibold tracking-[0.28em] text-[#0e3d2a]/40">
            BOOKMYTABARRUK
          </p>
        </div>

        <BrandFooter className="pb-24" />
      </div>
      <BottomNav />
    </div>
  )
}
