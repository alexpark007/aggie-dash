'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { MapPin, Package, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Delivery {
  id: string
  order_id: string
  picked_up_at: string | null
  delivered_at: string | null
  order: {
    id: string
    status: string
    delivery_address: string
    total: number
    special_instructions: string | null
    restaurant: { name: string; address: string } | null
    items: Array<{ quantity: number; menu_item: { name: string } | null }>
  } | null
}

interface Props {
  deliveries: Delivery[]
  driverId: string
  shiftId: string
}

export default function DriverDeliveriesClient({ deliveries: initialDeliveries, driverId, shiftId }: Props) {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handlePickedUp = async (delivery: Delivery) => {
    setLoading(delivery.id)
    const now = new Date().toISOString()
    await supabase.from('deliveries').update({ picked_up_at: now }).eq('id', delivery.id)
    await supabase.from('orders').update({ status: 'out_for_delivery' }).eq('id', delivery.order_id)
    setDeliveries(prev => prev.map(d => d.id === delivery.id ? { ...d, picked_up_at: now } : d))
    setLoading(null)
    router.refresh()
  }

  const handleDelivered = async (delivery: Delivery) => {
    setLoading(delivery.id)
    const now = new Date().toISOString()
    await supabase.from('deliveries').update({ delivered_at: now }).eq('id', delivery.id)
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', delivery.order_id)
    setDeliveries(prev => prev.map(d => d.id === delivery.id ? { ...d, delivered_at: now } : d))
    setLoading(null)
    router.refresh()
  }

  const active = deliveries.filter(d => !d.delivered_at)
  const completed = deliveries.filter(d => d.delivered_at)

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No deliveries assigned yet.</p>
        <p className="text-sm mt-1">New orders will appear here during your shift.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Active ({active.length})</h2>
          <div className="space-y-4">
            {active.map(delivery => (
              <div key={delivery.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-[#002855]/5 px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">Order #{delivery.order_id.slice(0, 8)}</p>
                  <p className="text-sm text-[#C99700] font-medium">{delivery.order?.restaurant?.name}</p>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Items</p>
                    <p className="text-sm text-gray-700">
                      {delivery.order?.items?.map(i => `${i.quantity}× ${i.menu_item?.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pickup from</p>
                      <p className="text-sm text-gray-700">{delivery.order?.restaurant?.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deliver to</p>
                      <p className="text-sm text-gray-700">{delivery.order?.delivery_address}</p>
                    </div>
                  </div>

                  {delivery.order?.special_instructions && (
                    <div className="bg-amber-50 rounded-lg px-3 py-2 text-sm text-amber-700">
                      <strong>Note:</strong> {delivery.order.special_instructions}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {!delivery.picked_up_at ? (
                      <Button
                        onClick={() => handlePickedUp(delivery)}
                        loading={loading === delivery.id}
                        className="flex-1"
                        variant="outline"
                      >
                        Picked Up
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDelivered(delivery)}
                        loading={loading === delivery.id}
                        className="flex-1"
                        variant="secondary"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Completed ({completed.length})</h2>
          <div className="space-y-2">
            {completed.map(delivery => (
              <div key={delivery.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between opacity-70">
                <div>
                  <p className="text-sm font-medium text-gray-700">Order #{delivery.order_id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{delivery.order?.restaurant?.name}</p>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Delivered
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
