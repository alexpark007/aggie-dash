'use client'

import { useState } from 'react'
import { MapPin, Plus, ShoppingCart } from 'lucide-react'
import { Restaurant, MenuItem } from '@/types'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Link from 'next/link'

interface Props {
  restaurant: Restaurant
  menuItems: MenuItem[]
}

function groupByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)
}

export default function MenuPage({ restaurant, menuItems }: Props) {
  const { cart, count, add, update, total } = useCart()
  const [conflictItem, setConflictItem] = useState<MenuItem | null>(null)
  const [addedItemId, setAddedItemId] = useState<string | null>(null)

  const grouped = groupByCategory(menuItems)
  const categories = Object.keys(grouped)

  const handleAdd = (item: MenuItem) => {
    const result = add(item, restaurant.id)
    if (result.conflict) {
      setConflictItem(item)
    } else {
      setAddedItemId(item.id)
      setTimeout(() => setAddedItemId(null), 1200)
    }
  }

  const handleClearAndAdd = () => {
    if (!conflictItem) return
    const { clearCart } = require('@/lib/cart')
    clearCart()
    add(conflictItem, restaurant.id)
    setConflictItem(null)
  }

  const getItemQty = (itemId: string) =>
    cart.find(c => c.menu_item.id === itemId)?.quantity ?? 0

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24">
      {/* Restaurant header */}
      <div className="bg-[#002855] text-white -mx-4 px-4 py-10 mb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">{restaurant.name}</h1>
          <p className="text-[#C99700] font-medium mb-2">{restaurant.cuisine}</p>
          <div className="flex items-center gap-1 text-white/70 text-sm">
            <MapPin className="w-4 h-4" />
            {restaurant.address}
          </div>
          <p className="text-white/60 text-sm mt-1">$3.99 delivery · Davis 95616 only</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Category sidebar */}
        <aside className="hidden md:block w-48 shrink-0">
          <div className="sticky top-24 space-y-1">
            {categories.map(cat => (
              <a
                key={cat}
                href={`#${cat}`}
                className="block px-3 py-2 text-sm rounded-lg hover:bg-[#002855]/5 hover:text-[#002855] font-medium text-gray-600 transition-colors"
              >
                {cat}
              </a>
            ))}
          </div>
        </aside>

        {/* Menu items */}
        <div className="flex-1 space-y-10">
          {categories.map(cat => (
            <section key={cat} id={cat}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{cat}</h2>
              <div className="space-y-3">
                {grouped[cat].map(item => {
                  const qty = getItemQty(item.id)
                  return (
                    <div key={item.id} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-[#C99700] transition-colors">
                      {item.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                        )}
                        <p className="text-[#002855] font-bold mt-2">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center shrink-0">
                        {qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => update(item.id, qty - 1)}
                              className="w-8 h-8 rounded-full border-2 border-[#002855] text-[#002855] font-bold hover:bg-[#002855] hover:text-white transition-colors flex items-center justify-center"
                            >
                              −
                            </button>
                            <span className="w-5 text-center font-semibold">{qty}</span>
                            <button
                              onClick={() => handleAdd(item)}
                              className="w-8 h-8 rounded-full bg-[#002855] text-white font-bold hover:bg-[#001a3a] transition-colors flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAdd(item)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              addedItemId === item.id
                                ? 'bg-green-500 text-white scale-110'
                                : 'bg-[#002855] text-white hover:bg-[#C99700]'
                            }`}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Sticky cart bar */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-30">
          <div className="max-w-xl mx-auto">
            <Link href="/cart">
              <Button className="w-full" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                View Cart · {count} item{count !== 1 ? 's' : ''} · {formatCurrency(total)}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Conflict modal */}
      <Modal
        isOpen={!!conflictItem}
        onClose={() => setConflictItem(null)}
        title="Start a new cart?"
      >
        <p className="text-gray-600 mb-6">
          Your cart contains items from a different restaurant. Would you like to clear it and start a new order?
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setConflictItem(null)} className="flex-1">
            Keep current cart
          </Button>
          <Button onClick={handleClearAndAdd} className="flex-1">
            Start new cart
          </Button>
        </div>
      </Modal>
    </div>
  )
}
