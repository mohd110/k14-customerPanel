'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { href: '/menu', icon: Home, label: 'Home' },
    { href: '/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-neutral-900 border-t border-neutral-800 z-40 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
      <div className="flex pb-safe">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors"
            >
              <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-colors ${active ? 'bg-[#2a1416]' : ''}`}>
                <Icon
                  className={`size-5 transition-colors ${active ? 'text-[#e23744]' : 'text-neutral-400'}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-[#e23744]' : 'text-neutral-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}