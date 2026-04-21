'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

interface Props {
  settings: { driver_hourly_rate: number; delivery_fee: number } | null
}

export default function AdminSettingsClient({ settings }: Props) {
  const [hourlyRate, setHourlyRate] = useState(settings?.driver_hourly_rate?.toString() ?? '18.00')
  const [deliveryFee, setDeliveryFee] = useState(settings?.delivery_fee?.toString() ?? '3.99')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    await supabase.from('platform_settings').upsert({
      id: 1,
      driver_hourly_rate: parseFloat(hourlyRate),
      delivery_fee: parseFloat(deliveryFee),
      updated_at: new Date().toISOString(),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-bold text-gray-900">Driver Pay</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Default Hourly Rate ($)"
            type="number"
            step="0.25"
            min="10"
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
            helpText="This is used as the default when scheduling new shifts. You can override per shift."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-gray-900">Delivery Settings</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Delivery Fee ($)"
            type="number"
            step="0.01"
            min="0"
            value={deliveryFee}
            onChange={e => setDeliveryFee(e.target.value)}
            helpText="Flat fee charged to customers per order"
          />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>Note:</strong> Restaurant subscription is billed at <strong>$150/month flat</strong> via Stripe.
            No per-order percentage is charged to restaurants.
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>Save Settings</Button>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Saved!
          </div>
        )}
      </div>
    </div>
  )
}
