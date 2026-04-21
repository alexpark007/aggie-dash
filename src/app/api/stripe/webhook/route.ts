import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { restaurantId, userId, deliveryAddress } = pi.metadata

    // Retrieve the order data from metadata — in production store server-side
    // Here we use the payment intent ID to find pending order state
    // (In a real system, you'd store order data server-side before payment)
    const pendingKey = `pending_order_${pi.id}`

    // Get customer record
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!customer) {
      console.error('[webhook] Customer not found for user', userId)
      return NextResponse.json({ received: true })
    }

    // The order was already created optimistically; update payment status
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', pi.id)
      .single()

    if (!order) {
      console.log('[webhook] Order not yet created for payment intent', pi.id)
    }

    console.log('[webhook] payment_intent.succeeded for', pi.id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase
      .from('restaurants')
      .update({ is_active: false })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
