'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowUpRight, Wheat, UtensilsCrossed, Package, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage, useActiveStore, t } from '@/lib/k14-store'
import type { Store } from '@/lib/types'
import BottomNav from '@/components/BottomNav'

const GOLD = '#d4af37'

/* Local brand logos per store slug (until each store has its own logo_url in
   the DB). The kebabchi logo will be dropped in here once provided. */
const STORE_LOGOS: Record<string, string> = {
  'k14-bakery': '/k14-logo.png',
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
      <div className="phone-screen min-h-[100dvh] flex items-center justify-center bmt-hero-bg">
        <Loader2 className="size-7 animate-spin text-[#d4af37]" />
      </div>
    )
  }

  const activeStores = stores.filter((s) => s.is_active)
  const comingSoon = stores.filter((s) => !s.is_active)

  return (
    <div className="phone-screen min-h-[100dvh] bmt-hero-bg pb-28 text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-[#d4af37]/15 bg-[#0a2018]/85 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/new-logo.jpeg" alt="BMT" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d4af37]/50" />
          <div>
            <p className="font-serif-display text-base font-bold leading-tight text-white">
              Book<span className="text-[#d4af37]">My</span>Tabarruk
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4af37]/80">
              {t('Choose a Store', 'स्टोर चुनें', lang)}
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 pt-7 space-y-8">

        {/* ── Active stores ── */}
        {activeStores.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[11px] font-extrabold tracking-[0.24em] text-[#d4af37]">
                {t('OPEN NOW', 'अभी उपलब्ध', lang)}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[#d4af37]/45 to-transparent" />
            </div>

            <div className="flex flex-wrap gap-4">
              {activeStores.map((store, i) => {
                const accent = store.theme_color || GOLD
                const logo = store.logo_url || STORE_LOGOS[store.slug]
                return (
                  <button
                    key={store.id}
                    id={`store-${store.slug}`}
                    onClick={() => handleStoreSelect(store)}
                    className="group relative flex aspect-square w-[calc(50%-0.5rem)] flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border p-4 text-center transition-all duration-200 hover:border-[#d4af37]/60 active:scale-[0.97]"
                    style={{
                      background: 'linear-gradient(160deg, rgba(24,56,37,0.75) 0%, rgba(8,28,20,0.65) 100%)',
                      borderColor: 'rgba(212,175,55,0.22)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateY(0)' : 'translateY(18px)',
                      transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s, border-color 0.2s`,
                    }}
                  >
                    {/* accent glow */}
                    <div
                      className="pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full blur-2xl"
                      style={{ background: `${accent}40` }}
                    />
                    {/* corner CTA */}
                    <span className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37] transition-colors group-hover:bg-[#d4af37] group-hover:text-[#0a2018]">
                      <ArrowUpRight className="size-4" />
                    </span>

                    {/* Store logo / icon */}
                    <div
                      className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                      style={
                        logo
                          ? { background: '#0e0b08', borderColor: `${accent}45` }
                          : { background: `${accent}22`, borderColor: `${accent}45` }
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
                      <h2 className="font-serif-display text-[15px] font-bold leading-tight text-white transition-colors group-hover:text-[#f5d77a]">
                        {store.name}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-white/45">
                        {store.short_desc}
                      </p>
                    </div>

                    {/* OPEN badge */}
                    <span
                      className="relative inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[8.5px] font-bold tracking-[0.14em]"
                      style={{ background: `${accent}2b`, color: accent }}
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
              <span className="text-[11px] font-bold tracking-[0.24em] text-white/35">
                {t('COMING SOON', 'जल्द आ रहा है', lang)}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
            </div>

            <div className="flex flex-wrap gap-4">
              {comingSoon.map((store, i) => (
                <div
                  key={store.id}
                  className="relative flex aspect-square w-[calc(50%-0.5rem)] flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 text-center"
                  style={{
                    opacity: mounted ? 0.72 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(18px)',
                    transition: `opacity 0.5s ease ${(activeStores.length + i) * 0.08 + 0.1}s, transform 0.5s ease ${(activeStores.length + i) * 0.08 + 0.1}s`,
                  }}
                >
                  <span className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
                    <Lock className="size-3.5" />
                  </span>

                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] grayscale">
                    <StoreIcon slug={store.slug} color="#7f8a82" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-serif-display text-[15px] font-bold leading-tight text-white/45">{store.name}</h2>
                    <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-white/25">{store.short_desc}</p>
                  </div>

                  <span className="inline-flex items-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/[0.06] px-2.5 py-0.5 text-[8.5px] font-bold tracking-[0.14em] text-[#d4af37]/60">
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
          <p className="mt-2 text-center text-[9px] font-semibold tracking-[0.28em] text-[#d4af37]/40">
            BOOKMYTABARRUK
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
