import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#002855] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#C99700] font-bold text-xl">Aggie</span>
              <span className="font-bold text-xl">Dash</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Local restaurants. Student drivers. Community first.
            </p>
            <p className="text-white/50 text-xs mt-2">
              Serving Downtown Davis & UC Davis Campus · 95616
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-[#C99700]">For Customers</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/" className="hover:text-white transition-colors">Browse Restaurants</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Order History</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-[#C99700]">Partners</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/restaurant" className="hover:text-white transition-colors">Restaurant Portal</Link></li>
              <li><Link href="/driver" className="hover:text-white transition-colors">Drive for Us</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-white/50 text-xs">
          © {new Date().getFullYear()} Aggie Dash · Downtown Davis Association ·{' '}
          <span className="text-[#C99700]">Powered by the Davis community</span>
        </div>
      </div>
    </footer>
  )
}
