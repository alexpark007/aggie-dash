'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  cartCount?: number
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-[#002855] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#C99700] font-bold text-2xl">Davis</span>
            <span className="font-bold text-2xl">Delivers</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-[#C99700] transition-colors text-sm font-medium">
              Order Food
            </Link>
            <Link href="/restaurant" className="hover:text-[#C99700] transition-colors text-sm font-medium">
              Restaurants
            </Link>
            <Link href="/driver" className="hover:text-[#C99700] transition-colors text-sm font-medium">
              Drive for Us
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/account" className="flex items-center gap-1 hover:text-[#C99700] transition-colors text-sm">
                  <User className="w-4 h-4" />
                  Account
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-1 hover:text-[#C99700] transition-colors text-sm">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="bg-[#C99700] hover:bg-[#a87d00] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                Sign In
              </Link>
            )}
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 hover:text-[#C99700] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C99700] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C99700] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#001a3a] border-t border-white/10 px-4 py-3 flex flex-col gap-3">
          <Link href="/" className="hover:text-[#C99700] py-1" onClick={() => setMenuOpen(false)}>Order Food</Link>
          <Link href="/restaurant" className="hover:text-[#C99700] py-1" onClick={() => setMenuOpen(false)}>Restaurants</Link>
          <Link href="/driver" className="hover:text-[#C99700] py-1" onClick={() => setMenuOpen(false)}>Drive for Us</Link>
          {user ? (
            <>
              <Link href="/account" className="hover:text-[#C99700] py-1" onClick={() => setMenuOpen(false)}>Account</Link>
              <button onClick={handleSignOut} className="text-left hover:text-[#C99700] py-1">Sign Out</button>
            </>
          ) : (
            <Link href="/auth/login" className="bg-[#C99700] text-white px-4 py-2 rounded-lg text-sm font-semibold w-fit" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
