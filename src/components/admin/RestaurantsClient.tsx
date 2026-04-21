'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Restaurant } from '@/types'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface Props { restaurants: Restaurant[] }

export default function AdminRestaurantsClient({ restaurants: initialRestaurants }: Props) {
  const [restaurants, setRestaurants] = useState(initialRestaurants)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const toggleActive = async (restaurant: Restaurant) => {
    setLoading(restaurant.id)
    await supabase.from('restaurants').update({ is_active: !restaurant.is_active }).eq('id', restaurant.id)
    setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, is_active: !r.is_active } : r))
    setLoading(null)
    router.refresh()
  }

  const pending = restaurants.filter(r => !r.is_active)
  const active = restaurants.filter(r => r.is_active)

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 bg-amber-50">
            <h2 className="font-bold text-amber-900">Pending Approval ({pending.length})</h2>
          </div>
          <RestaurantTable restaurants={pending} loading={loading} onToggle={toggleActive} />
        </Card>
      )}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Active Restaurants ({active.length})</h2>
        </div>
        <RestaurantTable restaurants={active} loading={loading} onToggle={toggleActive} />
      </Card>
    </div>
  )
}

function RestaurantTable({
  restaurants,
  loading,
  onToggle,
}: {
  restaurants: Restaurant[]
  loading: string | null
  onToggle: (r: Restaurant) => void
}) {
  if (restaurants.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">None yet.</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-6 py-3 text-gray-500">Restaurant</th>
            <th className="text-left px-6 py-3 text-gray-500">Cuisine</th>
            <th className="text-left px-6 py-3 text-gray-500">Address</th>
            <th className="text-left px-6 py-3 text-gray-500">Status</th>
            <th className="px-6 py-3 text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {restaurants.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-6 py-3 font-medium text-gray-900">{r.name}</td>
              <td className="px-6 py-3 text-gray-600">{r.cuisine}</td>
              <td className="px-6 py-3 text-gray-600 text-xs">{r.address}</td>
              <td className="px-6 py-3">
                <Badge variant={r.is_active ? 'success' : 'warning'}>
                  {r.is_active ? 'Active' : 'Pending'}
                </Badge>
              </td>
              <td className="px-6 py-3 text-center">
                <Button
                  size="sm"
                  variant={r.is_active ? 'danger' : 'primary'}
                  onClick={() => onToggle(r)}
                  loading={loading === r.id}
                >
                  {r.is_active ? 'Deactivate' : 'Approve'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
