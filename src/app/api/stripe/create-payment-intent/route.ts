import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { CartItem } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const DELIVERY_FEE = 3.99

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { restaurantId, items, deliveryAddress, specialInstructions, tip } = body as {
      restaurantId: string
      items: CartItem[]
      deliveryAddress: string
      specialInstructions?: string
      tip: number
    }

    if (!restaurantId || !items?.length || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify restaurant is active
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .eq('is_active', true)
      .single()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found or inactive' }, { status: 404 })
    }

    // Calculate totals server-side (never trust client)
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, price, name')
      .in('id', items.map(i => i.menu_item.id))
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)

    if (!menuItems || menuItems.length !== items.length) {
      return NextResponse.json({ error: 'Some items are unavailable' }, { status: 400 })
    }

    const subtotal = items.reduce((sum, cartItem) => {
      const serverItem = menuItems.find(m => m.id === cartItem.menu_item.id)
      return sum + (serverItem?.price ?? 0) * cartItem.quantity
    }, 0)

    const tipAmount = Math.max(0, parseFloat(tip.toString()) || 0)
    const total = subtotal + DELIVERY_FEE + tipAmount

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe uses cents
      currency: 'usd',
      metadata: {
        restaurantId,
        userId: user.id,
        deliveryAddress,
      },
    })

    const orderData = {
      restaurantId,
      items: items.map(i => ({
        menu_item_id: i.menu_item.id,
        quantity: i.quantity,
        price: menuItems.find(m => m.id === i.menu_item.id)?.price ?? 0,
      })),
      deliveryAddress,
      specialInstructions: specialInstructions ?? null,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      tip: tipAmount,
      total,
      paymentIntentId: paymentIntent.id,
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderData,
    })
  } catch (err) {
    console.error('[create-payment-intent]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
