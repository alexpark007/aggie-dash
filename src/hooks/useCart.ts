'use client'

import { useState, useEffect, useCallback } from 'react'
import { CartItem, MenuItem } from '@/types'
import { getCart, addToCart, updateCartQuantity, clearCart, getCartTotal, getCartRestaurantId } from '@/lib/cart'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  useEffect(() => {
    setCart(getCart())
    setRestaurantId(getCartRestaurantId())
  }, [])

  const refresh = useCallback(() => {
    setCart(getCart())
    setRestaurantId(getCartRestaurantId())
  }, [])

  const add = useCallback((item: MenuItem, restId: string) => {
    const result = addToCart(item, restId)
    if (!result.conflict) refresh()
    return result
  }, [refresh])

  const update = useCallback((itemId: string, quantity: number) => {
    updateCartQuantity(itemId, quantity)
    refresh()
  }, [refresh])

  const clear = useCallback(() => {
    clearCart()
    refresh()
  }, [refresh])

  const total = getCartTotal(cart)
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)

  return { cart, restaurantId, total, count, add, update, clear }
}
