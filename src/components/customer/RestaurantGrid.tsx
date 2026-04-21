import Link from 'next/link'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import { Restaurant } from '@/types'

function isOpenNow(hours: Restaurant['hours']): boolean {
  const now = new Date()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = days[now.getDay()] as keyof typeof hours
  const dayHours = hours[dayName]
  if (!dayHours || dayHours.closed) return false
  const [openH, openM] = dayHours.open.split(':').map(Number)
  const [closeH, closeM] = dayHours.close.split(':').map(Number)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  return currentMinutes >= openH * 60 + openM && currentMinutes <= closeH * 60 + closeM
}

function getCuisineEmoji(cuisine: string): string {
  const map: Record<string, string> = {
    'Pizza': '🍕',
    'Mediterranean': '🫔',
    'Asian Fusion': '🍜',
    'Mexican': '🌮',
    'Burgers': '🍔',
    'Sushi': '🍱',
    'Salads': '🥗',
    'Coffee': '☕',
  }
  return map[cuisine] ?? '🍽️'
}

interface Props {
  restaurants: Restaurant[]
}

export default function RestaurantGrid({ restaurants }: Props) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-5xl mb-4">🍽️</p>
        <p className="text-lg font-medium">No restaurants available right now.</p>
        <p className="text-sm mt-1">Check back soon — we&apos;re onboarding local spots!</p>
      </div>
    )
  }

  return (
    <div id="restaurants" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((r) => {
        const open = isOpenNow(r.hours)
        return (
          <Link
            key={r.id}
            href={`/restaurant/${r.id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#C99700] transition-all"
          >
            {/* Logo / placeholder */}
            <div className="bg-[#002855]/5 h-36 flex items-center justify-center">
              {r.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.logo_url} alt={r.name} className="h-28 w-full object-cover" />
              ) : (
                <span className="text-6xl">{getCuisineEmoji(r.cuisine)}</span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-[#002855] transition-colors">
                  {r.name}
                </h3>
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {open ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-sm text-[#C99700] font-medium mt-0.5">{r.cuisine}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{r.address}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>$3.99 delivery</span>
                </div>
                <span className="text-[#002855] text-sm font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                  View menu <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
