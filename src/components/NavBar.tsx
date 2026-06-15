'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart'
import { ChevronLeft, Search, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface Props {
  role: 'customer' | 'restaurant'
  title?: string
  showBack?: boolean
}

export default function NavBar({ role, title, showBack }: Props) {
  const router = useRouter()
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(role === 'restaurant' ? '/restaurant/login' : '/login')
    router.refresh()
  }

  if (role === 'restaurant') {
    return (
      <nav className="bg-neutral-900 sticky top-0 z-40 border-b border-neutral-800">
        <div className="phone-screen px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <button onClick={() => router.back()} className="p-1 -ml-1">
                <ChevronLeft className="size-5 text-neutral-100" />
              </button>
            )}
            <span className="font-bold text-white">{title ?? 'Dashboard'}</span>
          </div>
          <button onClick={handleLogout} className="text-xs font-semibold text-[#e23744]">
            Sign out
          </button>
        </div>
      </nav>
    )
  }

  // Customer nav — matches stitch design
  return (
    <nav className="bg-neutral-900 sticky top-0 z-40 border-b border-white/10 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="phone-screen px-4 h-14 flex items-center gap-3">
        {/* Back or logo */}
        {showBack ? (
          <button onClick={() => router.back()} className="p-1 -ml-1 flex-shrink-0">
            <ChevronLeft className="size-6 text-neutral-100" />
          </button>
        ) : null}

        {/* Center text block */}
        <div className="flex-1 min-w-0">
          <h1 className={`font-extrabold text-base leading-tight truncate ${title ? 'text-white' : 'k14-gold-gradient w-fit'}`}>
            {title ?? 'K14'}
          </h1>
          {!showBack && (
            <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              25–35 mins &bull; 0.6 km
            </p>
          )}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
            <Search className="size-5 text-neutral-300" />
          </button>
          <Link href="/cart" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors relative">
            <ShoppingCart className="size-5 text-neutral-300" />
            {itemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#e23744] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}