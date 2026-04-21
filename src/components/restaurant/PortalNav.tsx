'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const links = [
  { href: '/restaurant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/restaurant/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/restaurant/orders', label: 'Orders', icon: ClipboardList },
  { href: '/restaurant/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function RestaurantPortalNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/restaurant/login')
  }

  return (
    <nav className="bg-[#002855] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Link href="/restaurant/dashboard" className="flex items-center gap-1.5">
              <span className="text-[#C99700] font-bold text-lg">Davis</span>
              <span className="font-bold text-lg">Delivers</span>
            </Link>
            <span className="text-white/40 mx-2">|</span>
            <span className="text-white/70 text-sm">Restaurant Portal</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  pathname === href
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Mobile: tabs at bottom (rendered in page) */}
          <div className="md:hidden">
            <button onClick={handleSignOut} className="text-white/70 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#002855] border-t border-white/10 flex z-40">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center py-2 text-xs transition-colors',
              pathname === href ? 'text-[#C99700]' : 'text-white/60 hover:text-white'
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
