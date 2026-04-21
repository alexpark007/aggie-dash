import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  if (restaurant.stripe_subscription_id) return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })

  const { paymentMethodId } = await req.json()

  // Create Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: restaurant.name,
    payment_method: paymentMethodId,
    invoice_settings: { default_payment_method: paymentMethodId },
  })

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: process.env.STRIPE_RESTAURANT_PRICE_ID! }],
    payment_settings: {
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  })

  // Save subscription ID and activate restaurant
  await supabase
    .from('restaurants')
    .update({ stripe_subscription_id: subscription.id, is_active: true })
    .eq('id', restaurant.id)

  return NextResponse.json({ subscriptionId: subscription.id, status: subscription.status })
}
