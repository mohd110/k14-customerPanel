'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2, Store } from 'lucide-react'
import { useCart, useHydrated, cartTotal, useLanguage, t } from '@/lib/k14-store'
import { createClient } from '@/lib/supabase/client'
import { money } from '@/lib/format'
import { placeholderImage } from '@/lib/placeholder-image'
import BottomNav from '@/components/BottomNav'
import BrandFooter from '@/components/BrandFooter'

const SERVICE_FEE = 20

export default function CartPage() {
  const router = useRouter()
  const { items, setQty, remove } = useCart()
  const hydrated = useHydrated()
  const { lang } = useLanguage()
  const subtotal = hydrated ? cartTotal(items) : 0
  const fee = items.length > 0 ? SERVICE_FEE : 0
  const total = subtotal + fee
  const [proceeding, setProceeding] = useState(false)

  // Group items by store_id for a clear multi-store display
  const grouped = hydrated
    ? items.reduce<Record<string, typeof items>>((acc, ci) => {
        const key = ci.item.store_id ?? '__unknown__'
        if (!acc[key]) acc[key] = []
        acc[key].push(ci)
        return acc
      }, {})
    : {}

  async function proceedToCheckout() {
    setProceeding(true)
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/login?redirect=/checkout')
      return
    }
    router.push('/checkout')
  }

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#0e0b08] pb-32 text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#0e0b08]/95 px-5 py-3.5 backdrop-blur">
        <Link href="/stores" aria-label="Back" className="text-white/70 hover:text-white">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="font-serif-display text-xl font-bold text-white flex-1">{t('Your Tabarruk Cart', 'आपका तबर्रुक कार्ट', lang)}</h1>
        {hydrated && items.length > 0 && (
          <span className="rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-2 py-0.5 text-[10px] font-bold text-[#d4af37]">
            {items.reduce((n, i) => n + i.qty, 0)} {t('items', 'वस्तुएँ', lang)}
          </span>
        )}
      </header>

      {!hydrated ? null : items.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center px-6 py-28 text-center">
          <ShoppingBag className="size-12 text-white/15" />
          <p className="mt-4 text-base font-bold text-white/40">{t('Your cart is empty', 'आपका कार्ट खाली है', lang)}</p>
          <p className="mt-1 text-xs text-white/25">{t('Add items from a store to get started', 'शुरू करने के लिए किसी दुकान से वस्तुएँ जोड़ें', lang)}</p>
          <Link
            href="/stores"
            className="mt-6 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] px-6 py-3 text-sm font-bold text-[#1a1206]"
          >
            {t('Browse Stores', 'दुकानें देखें', lang)}
          </Link>
        </div>
      ) : (
        <>
          {/* ── Items grouped by store ── */}
          <div className="space-y-6 px-5 pt-5">
            {Object.entries(grouped).map(([storeId, storeItems]) => (
              <div key={storeId}>
                {/* Store header */}
                {Object.keys(grouped).length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Store className="size-3.5 text-emerald-400/60" />
                    <span className="text-[10px] font-bold tracking-[0.15em] text-emerald-400/60 uppercase">
                      {storeId === '__unknown__' ? t('Items', 'वस्तुएँ', lang) : `${t('Store', 'दुकान', lang)} · ${storeId.slice(0, 8).toUpperCase()}`}
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}

                <div className="space-y-3">
                  {storeItems.map(({ item, qty }) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-[#17120c] p-3"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.photo_url || placeholderImage(item.name)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif-display text-base font-bold text-white">{item.name}</h3>
                          <button
                            onClick={() => remove(item.id)}
                            aria-label="Remove"
                            className="text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-[#d4af37]">{money(item.price)}</span>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-lg border border-white/15 px-2 py-1">
                            <button onClick={() => setQty(item.id, qty - 1)} aria-label="Decrease">
                              <Minus className="size-4 text-white/70" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{qty}</span>
                            <button onClick={() => setQty(item.id, qty + 1)} aria-label="Increase">
                              <Plus className="size-4 text-white/70" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-white/80">{money(item.price * qty)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Summary ── */}
          <div className="mx-5 mt-6 rounded-2xl border border-white/10 bg-[#17120c] p-4 text-sm">
            <div className="flex justify-between text-white/60">
              <span>{t('Subtotal', 'उप-योग', lang)}</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-white/60">
              <span>{t('Service fee', 'सेवा शुल्क', lang)}</span>
              <span>{money(fee)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base font-bold">
              <span>{t('Total', 'कुल', lang)}</span>
              <span className="text-[#d4af37]">{money(total)}</span>
            </div>
          </div>

          {/* ── Sticky Proceed button ── */}
          <div className="phone-screen fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 mx-auto border-t border-white/10 bg-[#120d08]/95 px-5 py-4 backdrop-blur">
            <button
              id="proceed-checkout-btn"
              onClick={proceedToCheckout}
              disabled={proceeding}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {proceeding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>{t('Proceed to Checkout', 'चेकआउट करें', lang)} <ArrowRight className="size-4" /></>
              )}
            </button>
          </div>
        </>
      )}
      <BrandFooter className="pb-24" />
      <BottomNav />
    </div>
  )
}
