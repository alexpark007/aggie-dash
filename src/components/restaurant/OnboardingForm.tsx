'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { CheckCircle } from 'lucide-react'

const CUISINES = ['Pizza', 'Mediterranean', 'Asian Fusion', 'Mexican', 'Burgers', 'Sushi', 'Salads', 'Coffee', 'Sandwiches', 'Tacos', 'Thai', 'Indian', 'Other']
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

type DayKey = typeof DAYS[number]

interface HoursState {
  [day: string]: { open: string; close: string; closed: boolean }
}

export default function RestaurantOnboardingForm() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'account' | 'details' | 'hours' | 'done'>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Details
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [cuisine, setCuisine] = useState(CUISINES[0])

  // Hours
  const [hours, setHours] = useState<HoursState>(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { open: '11:00', close: '21:00', closed: false }
    }), {} as HoursState)
  )

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'restaurant' } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setStep('details')
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Please sign in first'); setLoading(false); return }

    const hoursPayload = DAYS.reduce((acc, day) => {
      const h = hours[day]
      if (h.closed) return { ...acc, [day]: { closed: true } }
      return { ...acc, [day]: { open: h.open, close: h.close } }
    }, {})

    const { error } = await supabase.from('restaurants').insert({
      user_id: user.id,
      name,
      address,
      cuisine,
      hours: hoursPayload,
      is_active: false,
    })

    if (error) { setError(error.message); setLoading(false); return }
    setStep('done')
    setLoading(false)
  }

  if (step === 'done') {
    return (
      <Card>
        <CardBody className="text-center py-10">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-1">We'll review your application and activate your account within 1–2 business days.</p>
          <p className="text-gray-500 text-sm">Once approved, you'll be able to log in, build your menu, and start receiving orders.</p>
        </CardBody>
      </Card>
    )
  }

  if (step === 'account') {
    return (
      <Card>
        <CardBody className="space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Step 1: Create your account</h2>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <Input label="Business Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="info@yourrestaurant.com" />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" helpText="At least 6 characters" />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Continue</Button>
          </form>
        </CardBody>
      </Card>
    )
  }

  if (step === 'details') {
    return (
      <Card>
        <CardBody className="space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Step 2: Restaurant Details</h2>
          <Input label="Restaurant Name" value={name} onChange={e => setName(e.target.value)} required placeholder="Woodstock's Pizza Davis" />
          <Input label="Address" value={address} onChange={e => setAddress(e.target.value)} required placeholder="219 G St, Davis, CA 95616" />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Cuisine Type</label>
            <select
              value={cuisine}
              onChange={e => setCuisine(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002855]"
            >
              {CUISINES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button onClick={() => setStep('hours')} disabled={!name || !address} className="w-full">
            Continue
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Step 3: Hours of Operation</h2>
        <div className="space-y-3">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3">
              <span className="capitalize text-sm font-medium text-gray-700 w-24">{day}</span>
              <input
                type="checkbox"
                checked={!hours[day].closed}
                onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !e.target.checked } }))}
                className="accent-[#002855]"
              />
              {!hours[day].closed && (
                <>
                  <input
                    type="time"
                    value={hours[day].open}
                    onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                  <span className="text-gray-500 text-sm">–</span>
                  <input
                    type="time"
                    value={hours[day].close}
                    onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </>
              )}
              {hours[day].closed && <span className="text-gray-400 text-sm">Closed</span>}
            </div>
          ))}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button onClick={handleSubmit} loading={loading} className="w-full">
          Submit Application
        </Button>
      </CardBody>
    </Card>
  )
}
