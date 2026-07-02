'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, ShoppingBag, History, User } from 'lucide-react'
import { useCart, useHydrated, cartCount, useLanguage, t } from '@/lib/k14-store'

export default function BottomNav() {
  const pathname = usePathname()
  const items = useCart((s) => s.items)
  const hydrated = useHydrated()
  const count = hydrated ? cartCount(items) : 0
  const { lang } = useLanguage()

  const tabs = [
    { href: '/stores', icon: Store, label: t('Stores', 'दुकानें', lang), id: 'nav-stores' },
    { href: '/cart', icon: ShoppingBag, label: t('Cart', 'कार्ट', lang), id: 'nav-cart' },
    { href: '/orders', icon: History, label: t('Orders', 'ऑर्डर', lang), id: 'nav-orders' },
    { href: '/profile', icon: User, label: t('Profile', 'प्रोफ़ाइल', lang), id: 'nav-profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0a1208] border-t border-emerald-900/40 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex pb-safe">
        {tabs.map(({ href, icon: Icon, label, id }) => {
          const active = pathname === href || (href !== '/stores' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              id={id}
              href={href}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors"
            >
              <div className={`relative w-10 h-6 flex items-center justify-center rounded-full transition-colors ${active ? 'bg-[#d4af37]/15' : ''}`}>
                <Icon
                  className={`size-5 transition-colors ${active ? 'text-[#d4af37]' : 'text-neutral-400'}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {/* Cart badge */}
                {href === '/cart' && count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[9px] font-bold text-[#1a1206]">
                    {count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-[#d4af37]' : 'text-neutral-500'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}