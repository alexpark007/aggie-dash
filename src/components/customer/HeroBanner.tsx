import Link from 'next/link'
import { MapPin, Clock, DollarSign } from 'lucide-react'

export default function HeroBanner() {
  return (
    <div className="bg-[#002855] text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Downtown Davis,{' '}
            <span className="text-[#C99700]">delivered.</span>
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Local restaurants. Student drivers. Community first.
            <br />
            Supporting Davis businesses since day one.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <DollarSign className="w-4 h-4 text-[#C99700]" />
              $3.99 flat delivery fee
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <MapPin className="w-4 h-4 text-[#C99700]" />
              Davis 95616 only
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
              <Clock className="w-4 h-4 text-[#C99700]" />
              Real-time tracking
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="#restaurants"
              className="bg-[#C99700] hover:bg-[#a87d00] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Order Now
            </Link>
            <Link
              href="/driver"
              className="border border-white/40 hover:border-white text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Become a Driver
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
