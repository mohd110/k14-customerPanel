'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react'
import { useCart, useHydrated, cartTotal } from '@/lib/k14-store'
import { createClient } from '@/lib/supabase/client'
import { money } from '@/lib/format'
import { placeholderImage } from '@/lib/placeholder-image'

const SERVICE_FEE = 20 // rupees

export default function CartPage() {
  const router = useRouter()
  const { items, setQty, remove } = useCart()
  const hydrated = useHydrated()
  const subtotal = hydrated ? cartTotal(items) : 0
  const fee = items.length > 0 ? SERVICE_FEE : 0
  const total = subtotal + fee
  const [proceeding, setProceeding] = useState(false)

  // Guests browse and build a cart freely — we only ask them to log in once
  // they tap "Proceed to Checkout". Logged-in users go straight to checkout.
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
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#0e0b08]/95 px-5 py-3.5 backdrop-blur">
        <Link href="/menu" aria-label="Back" className="text-white/70 hover:text-white">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="font-serif-display text-xl font-bold text-white">Your Tabarruk Cart</h1>
      </header>

      {!hydrated ? null : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-28 text-center">
          <ShoppingBag className="size-10 text-white/20" />
          <p className="mt-4 text-sm text-white/50">Your cart is empty.</p>
          <Link
            href="/menu"
            className="mt-6 rounded-lg bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] px-6 py-3 text-xs font-bold text-[#1a1206]"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 px-5 pt-5">
            {items.map(({ item, qty }) => (
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
                      className="text-white/40 hover:text-[#b6555b]"
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
                    <span className="text-sm font-semibold text-white/80">
                      {money(item.price * qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mx-5 mt-6 rounded-2xl border border-white/10 bg-[#17120c] p-4 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-white/60">
              <span>Service fee</span>
              <span>{money(fee)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base font-bold">
              <span>Total</span>
              <span className="text-[#d4af37]">{money(total)}</span>
            </div>
          </div>

          {/* Proceed */}
          <div className="phone-screen fixed inset-x-0 bottom-0 z-30 mx-auto border-t border-white/10 bg-[#120d08]/95 px-5 py-4 pb-safe backdrop-blur">
            <button
              onClick={proceedToCheckout}
              disabled={proceeding}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {proceeding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>Proceed to Checkout <ArrowRight className="size-4" /></>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
