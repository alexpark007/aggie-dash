import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurantId, items, deliveryAddress, specialInstructions, subtotal, deliveryFee, tip, total, paymentIntentId } = body

  // Get or create customer
  let { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({ user_id: user.id, name: user.email ?? 'Customer', address: deliveryAddress })
      .select('id')
      .single()
    customer = newCustomer
  }

  if (!customer) return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customer.id,
      restaurant_id: restaurantId,
      status: 'placed',
      subtotal,
      delivery_fee: deliveryFee,
      tip,
      total,
      delivery_address: deliveryAddress,
      special_instructions: specialInstructions,
      stripe_payment_intent_id: paymentIntentId,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? 'Failed to create order' }, { status: 500 })
  }

  // Insert order items
  const orderItems = items.map((item: { menu_item_id: string; quantity: number; price: number }) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    price: item.price,
  }))

  await supabase.from('order_items').insert(orderItems)

  return NextResponse.json({ orderId: order.id })
}
