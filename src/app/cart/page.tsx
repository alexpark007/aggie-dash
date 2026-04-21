'use client'
export const dynamic = 'force-dynamic'


import { useCart } from '@/hooks/useCart'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react'

const DELIVERY_FEE = 3.99

export default function CartPage() {
  const { cart, total, count, update, clear } = useCart()

  if (count === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious items from a restaurant!</p>
          <Link href="/">
            <Button>Browse Restaurants</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={count} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {cart.map((cartItem, idx) => (
            <div
              key={cartItem.menu_item.id}
              className={`flex items-center gap-4 px-4 py-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{cartItem.menu_item.name}</p>
                <p className="text-sm text-gray-500">{formatCurrency(cartItem.menu_item.price)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update(cartItem.menu_item.id, cartItem.quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#002855] hover:text-[#002855] transition-colors font-bold"
                >
                  −
                </button>
                <span className="w-5 text-center font-medium">{cartItem.quantity}</span>
                <button
                  onClick={() => update(cartItem.menu_item.id, cartItem.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-[#001a3a] transition-colors font-bold"
                >
                  +
                </button>
              </div>
              <p className="font-semibold text-gray-900 w-16 text-right">
                {formatCurrency(cartItem.menu_item.price * cartItem.quantity)}
              </p>
            </div>
          ))}

          <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery fee</span>
              <span>{formatCurrency(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tip</span>
              <span>added at checkout</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total (before tip)</span>
              <span>{formatCurrency(total + DELIVERY_FEE)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={clear} className="flex items-center gap-1 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Clear cart
          </Button>
          <Link href="/checkout" className="flex-1">
            <Button className="w-full" size="lg">
              Checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
