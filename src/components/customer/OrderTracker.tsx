'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

const STATUS_STEPS: OrderStatus[] = ['placed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered']

interface Props {
  order: Order & {
    restaurant: { name: string; address: string; cuisine: string } | null
    items: Array<{
      id: string
      quantity: number
      price: number
      menu_item: { name: string; price: number } | null
    }>
  }
}

export default function OrderTracker({ order: initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setOrder(prev => ({ ...prev, ...(payload.new as any) }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [order.id])

  const currentStepIdx = STATUS_STEPS.indexOf(order.status as OrderStatus)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
        <p className="text-gray-500 text-sm mt-1">Order #{order.id.slice(0, 8)} · {formatDate(order.created_at)}</p>
      </div>

      {/* Status tracker */}
      {!isCancelled ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-[#002855] transition-all duration-1000"
              style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= currentStepIdx
                const active = idx === currentStepIdx
                return (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                      done
                        ? 'bg-[#002855] border-[#002855] text-white'
                        : 'bg-white border-gray-300 text-gray-300'
                    }`}>
                      {active && order.status !== 'delivered' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : done ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-xs text-center max-w-16 leading-tight ${done ? 'text-[#002855] font-semibold' : 'text-gray-400'}`}>
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-gray-900">{ORDER_STATUS_LABELS[order.status]}</p>
            {order.status === 'placed' && <p className="text-sm text-gray-500 mt-1">Waiting for the restaurant to confirm your order.</p>}
            {order.status === 'preparing' && <p className="text-sm text-gray-500 mt-1">The restaurant is preparing your food.</p>}
            {order.status === 'ready_for_pickup' && <p className="text-sm text-gray-500 mt-1">Your order is ready — a driver is on the way!</p>}
            {order.status === 'out_for_delivery' && <p className="text-sm text-gray-500 mt-1">Your driver is on the way to you!</p>}
            {order.status === 'delivered' && <p className="text-sm text-green-600 font-medium mt-1">Enjoy your meal!</p>}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold text-lg">Order Cancelled</p>
          <p className="text-red-600 text-sm mt-1">This order was cancelled. Contact support if you were charged.</p>
        </div>
      )}

      {/* Restaurant */}
      {order.restaurant && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{order.restaurant.name}</h3>
          <p className="text-sm text-gray-500">{order.restaurant.address}</p>
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Your Order</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-700">{item.quantity}× {item.menu_item?.name}</span>
              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{formatCurrency(order.delivery_fee)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Tip</span><span>{formatCurrency(order.tip)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">Delivering to</h3>
        <p className="text-gray-700">{order.delivery_address}</p>
      </div>
    </div>
  )
}
