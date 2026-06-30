'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronRight, Wheat, UtensilsCrossed, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage, useActiveStore, t } from '@/lib/k14-store'
import type { Store } from '@/lib/types'
import BottomNav from '@/components/BottomNav'

/* ── store icon map — fallback icons per slug ── */
function StoreIcon({ slug, active, color }: { slug: string; active: boolean; color: string }) {
  const cls = `size-7 transition-colors ${active ? '' : 'opacity-30'}`
  const style = active ? { color } : {}
  if (slug.includes('kabacchi') || slug.includes('biryani') || slug.includes('restaurant')) {
    return <UtensilsCrossed className={cls} style={style} />
  }
  if (slug.includes('crockery') || slug.includes('kitchen')) {
    return <Package className={cls} style={style} />
  }
  return <Wheat className={cls} style={style} />
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
    <div className="phone-screen min-h-[100dvh] bg-[#FAF6F0] text-gray-900 pb-24">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-gray-200/60 bg-white/95 px-5 py-3.5 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/new-logo.jpeg" alt="BMT" className="w-9 h-9 rounded-full object-cover shadow-sm" />
          <div>
            <p className="text-sm font-bold text-gray-900">
              Book<span className="text-[#b8952a]">My</span>Tabarruk
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              {t('Choose a Store', 'स्टोर चुनें', lang)}
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 pt-6 space-y-6">

        {/* ── Active stores ── */}
        {activeStores.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#b8952a]">
                {t('OPEN NOW', 'अभी उपलब्ध', lang)}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
            </div>
            <div className="space-y-3">
              {activeStores.map((store, i) => (
                <button
                  key={store.id}
                  id={`store-${store.slug}`}
                  onClick={() => handleStoreSelect(store)}
                  className="relative w-full overflow-hidden rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-gray-100/50"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                    background: 'white',
                    border: '1px solid rgba(14,61,42,0.08)',
                  }}
                >
                  {/* Accent glow on left edge */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ background: store.theme_color || '#10b981' }}
                  />

                  <div className="flex items-center gap-4 p-4 pl-5">
                    {/* Store logo / icon */}
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl overflow-hidden"
                      style={{ background: `${store.theme_color || '#10b981'}18`, border: `1px solid ${store.theme_color || '#10b981'}25` }}
                    >
                      {store.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-contain" />
                      ) : (
                        <StoreIcon slug={store.slug} active={true} color={store.theme_color || '#10b981'} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-extrabold text-gray-900">{store.name}</h2>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{store.short_desc}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider"
                          style={{ background: `${store.theme_color || '#10b981'}12`, color: store.theme_color || '#10b981' }}
                        >
                          <span className="inline-block size-1.5 rounded-full bg-current animate-pulse" />
                          {t('OPEN', 'खुला', lang)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="size-5 shrink-0 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Coming soon stores ── */}
        {comingSoon.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400">
                {t('COMING SOON', 'जल्द आ रहा है', lang)}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
            </div>
            <div className="space-y-3">
              {comingSoon.map((store, i) => (
                <div
                  key={store.id}
                  className="relative w-full overflow-hidden rounded-2xl border border-gray-200/60 bg-gray-50/50"
                  style={{
                    opacity: mounted ? 0.7 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${(activeStores.length + i) * 0.1 + 0.1}s, transform 0.5s ease ${(activeStores.length + i) * 0.1 + 0.1}s`,
                  }}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Greyscale icon */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 border border-gray-200">
                      <StoreIcon slug={store.slug} active={false} color="#888" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-extrabold text-gray-400">{store.name}</h2>
                      <p className="text-xs text-gray-400/70 mt-0.5 truncate">{store.short_desc}</p>
                      <span className="mt-2 inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[9px] font-bold tracking-wider text-amber-600/70">
                        {t('COMING SOON', 'जल्द आ रहा है', lang)}
                      </span>
                    </div>
                  </div>
                  {/* Overlay to make it look inactive */}
                  <div className="absolute inset-0 bg-white/40 pointer-events-none rounded-2xl" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Bottom tagline ── */}
        <div
          className="py-4"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 0.6s',
          }}
        >
          <div className="niyaz-bar text-[#b8952a]">
            <style>{`.niyaz-bar { color: #b8952a; } .niyaz-bar::before, .niyaz-bar::after { background: linear-gradient(to right, transparent, #b8952a50, transparent); }`}</style>
            {t('NIYAZ', 'नियाज़', lang)}
            <span className="text-[#b8952a]/30">·</span>
            {t('BARKAT', 'बरकत', lang)}
            <span className="text-[#b8952a]/30">·</span>
            {t('IBAADAT', 'इबादत', lang)}
          </div>
          <p className="mt-2 text-center text-[9px] text-gray-400 tracking-widest font-semibold">
            BOOKMYTABARRUK
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}