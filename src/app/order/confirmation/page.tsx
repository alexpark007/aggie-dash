'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const paymentIntentStatus = searchParams.get('redirect_status')
    const dataParam = searchParams.get('data')

    if (paymentIntentStatus !== 'succeeded' || !dataParam) {
      router.push('/cart')
      return
    }

    const orderData = JSON.parse(decodeURIComponent(dataParam))

    fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.orderId) setOrderId(data.orderId)
        else setError(data.error ?? 'Failed to confirm order')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-[#002855] mb-4" />
        <p className="text-gray-600">Confirming your order…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
    )
  }

  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-gray-600 mb-2">Your food is being prepared by the restaurant.</p>
      <p className="text-sm text-gray-500 mb-8">Order ID: <span className="font-mono">{orderId?.slice(0, 8)}</span></p>
      <div className="flex flex-col gap-3">
        {orderId && (
          <Link href={`/order/${orderId}`}>
            <Button className="w-full">Track Your Order</Button>
          </Link>
        )}
        <Link href="/account/orders">
          <Button variant="outline" className="w-full">Order History</Button>
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#002855]" />
          </div>
        }>
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
