'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, isWithinDavisCA } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { AlertTriangle, MapPin } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const DELIVERY_FEE = 3.99
const TIP_OPTIONS = [0, 1, 2, 3, 5]

function PaymentForm({ clientSecret, orderData }: { clientSecret: string; orderData: Record<string, unknown> }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmation?data=${encodeURIComponent(JSON.stringify(orderData))}`,
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed')
      setLoading(false)
    } else {
      clear()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {loading ? 'Processing…' : `Pay ${formatCurrency((orderData.total as number) ?? 0)}`}
      </Button>
    </form>
  )
}

export default function CheckoutForm() {
  const { cart, total, count, restaurantId } = useCart()
  const [address, setAddress] = useState('')
  const [addressValid, setAddressValid] = useState<boolean | null>(null)
  const [instructions, setInstructions] = useState('')
  const [tip, setTip] = useState(2)
  const [customTip, setCustomTip] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'details' | 'payment'>('details')
  const router = useRouter()

  const tipAmount = customTip ? parseFloat(customTip) || 0 : tip
  const finalTotal = total + DELIVERY_FEE + tipAmount

  useEffect(() => {
    if (count === 0) router.push('/cart')
  }, [count, router])

  const handleAddressBlur = () => {
    if (address.trim()) {
      setAddressValid(isWithinDavisCA(address))
    }
  }

  const handleContinueToPayment = async () => {
    if (!address.trim() || !addressValid) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }

    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          items: cart,
          deliveryAddress: address,
          specialInstructions: instructions,
          tip: tipAmount,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create payment intent')
      setClientSecret(data.clientSecret)
      setOrderData(data.orderData)
      setStep('payment')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (count === 0) return null

  return (
    <div className="space-y-6">
      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Order Summary</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {cart.map(item => (
            <div key={item.menu_item.id} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-700">{item.quantity}x {item.menu_item.name}</span>
              <span className="font-medium">{formatCurrency(item.menu_item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span><span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span><span>{formatCurrency(DELIVERY_FEE)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tip</span><span>{formatCurrency(tipAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200">
            <span>Total</span><span>{formatCurrency(finalTotal)}</span>
          </div>
        </div>
      </div>

      {step === 'details' && (
        <div className="space-y-4">
          <div>
            <Input
              label="Delivery Address"
              placeholder="123 G St, Davis, CA 95616"
              value={address}
              onChange={e => { setAddress(e.target.value); setAddressValid(null) }}
              onBlur={handleAddressBlur}
              error={addressValid === false ? 'We only deliver within Davis, CA 95616' : undefined}
            />
            {addressValid === false && (
              <div className="mt-2 flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Davis Delivers only covers Downtown Davis and UC Davis campus (zip code 95616). Please enter a valid Davis address.</span>
              </div>
            )}
            {addressValid === true && (
              <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-lg text-sm">
                <MapPin className="w-4 h-4" />
                Address is within our delivery zone!
              </div>
            )}
          </div>

          <Input
            label="Special Instructions (optional)"
            placeholder="Leave at door, ring bell, etc."
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
          />

          {/* Tip selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Add a tip for your driver</label>
            <div className="flex gap-2 flex-wrap">
              {TIP_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => { setTip(t); setCustomTip('') }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    tipAmount === t && !customTip
                      ? 'bg-[#002855] text-white border-[#002855]'
                      : 'border-gray-300 text-gray-600 hover:border-[#002855]'
                  }`}
                >
                  {t === 0 ? 'No tip' : `$${t}`}
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom"
                value={customTip}
                onChange={e => setCustomTip(e.target.value)}
                className="px-3 py-1.5 rounded-full text-sm border border-gray-300 w-24 focus:outline-none focus:ring-2 focus:ring-[#002855]"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleContinueToPayment}
            loading={loading}
            disabled={!address.trim() || addressValid === false}
            className="w-full"
            size="lg"
          >
            Continue to Payment
          </Button>
        </div>
      )}

      {step === 'payment' && clientSecret && orderData && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance: { theme: 'stripe' } }}
        >
          <PaymentForm clientSecret={clientSecret} orderData={orderData} />
        </Elements>
      )}
    </div>
  )
}
