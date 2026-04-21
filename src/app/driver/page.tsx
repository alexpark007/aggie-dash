export const dynamic = 'force-dynamic'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { DollarSign, Calendar, MapPin, GraduationCap } from 'lucide-react'

export default function DriverLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-[#002855] text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-[#C99700] font-semibold mb-2">UC Davis Students</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Earn on Your Schedule</h1>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join Aggie Dash as a student driver. Hourly pay, flexible shifts, and you&apos;re helping your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/driver/apply">
                <Button size="lg" variant="secondary">Apply to Drive</Button>
              </Link>
              <Link href="/driver/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002855]">Driver Login</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why drive with Aggie Dash?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: DollarSign,
                title: 'Hourly Pay, Not Per-Delivery',
                desc: 'You get paid by the hour during your shift — no chasing tips or worrying about slow nights.'
              },
              {
                icon: Calendar,
                title: 'Scheduled Shifts',
                desc: 'Sign up for shifts that fit your class schedule. No surprise 5am pings.'
              },
              {
                icon: MapPin,
                title: 'Stay on Campus',
                desc: 'All deliveries are within Downtown Davis and UC Davis campus. Know every street.'
              },
              {
                icon: GraduationCap,
                title: 'UCD Students Only',
                desc: 'We only hire UC Davis students — keeping the earnings in our community.'
              }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-6">
                <div className="w-10 h-10 rounded-full bg-[#002855]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#002855]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/driver/apply">
              <Button size="lg">Apply Now — Takes 2 Minutes</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
