'use client'

import { CartItem, MenuItem } from '@/types'

const CART_KEY = 'davis_delivers_cart'
const RESTAURANT_KEY = 'davis_delivers_cart_restaurant'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function getCartRestaurantId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(RESTAURANT_KEY)
}

export function addToCart(item: MenuItem, restaurantId: string): { conflict: boolean } {
  const existingRestaurantId = getCartRestaurantId()
  if (existingRestaurantId && existingRestaurantId !== restaurantId) {
    return { conflict: true }
  }

  const cart = getCart()
  const existing = cart.find(c => c.menu_item.id === item.id)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ menu_item: item, quantity: 1 })
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  localStorage.setItem(RESTAURANT_KEY, restaurantId)
  return { conflict: false }
}

export function updateCartQuantity(itemId: string, quantity: number): void {
  const cart = getCart()
  const idx = cart.findIndex(c => c.menu_item.id === itemId)
  if (idx === -1) return
  if (quantity <= 0) {
    cart.splice(idx, 1)
  } else {
    cart[idx].quantity = quantity
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  if (cart.length === 0) {
    localStorage.removeItem(RESTAURANT_KEY)
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
  localStorage.removeItem(RESTAURANT_KEY)
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.menu_item.price * item.quantity, 0)
}
