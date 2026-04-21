'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

const NEXT_STATUS: Record<string, string | null> = {
  placed: 'preparing',
  preparing: 'ready_for_pickup',
  ready_for_pickup: null, // driver picks up from here
}

const NEXT_LABEL: Record<string, string> = {
  placed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready_for_pickup: 'Awaiting Driver',
}

interface Props {
  order: { id: string; status: string }
}

export default function OrderStatusUpdater({ order }: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const nextStatus = NEXT_STATUS[order.status]

  const handleUpdate = async () => {
    if (!nextStatus) return
    setLoading(true)
    await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', order.id)
    router.refresh()
    setLoading(false)
  }

  if (!nextStatus || order.status === 'ready_for_pickup') {
    return (
      <span className="text-xs text-gray-400">
        {order.status === 'ready_for_pickup' ? 'Waiting for driver' : ''}
      </span>
    )
  }

  return (
    <Button size="sm" onClick={handleUpdate} loading={loading} variant="secondary">
      {NEXT_LABEL[order.status]}
    </Button>
  )
}
