export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RestaurantGrid from '@/components/customer/RestaurantGrid'
import HeroBanner from '@/components/customer/HeroBanner'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Downtown Davis Restaurants</h2>
          <p className="text-gray-500 mb-8">Fresh, local food delivered to your door by UC Davis students.</p>
          <RestaurantGrid restaurants={restaurants ?? []} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
