export const dynamic = 'force-dynamic'

import DriverApplicationForm from '@/components/driver/ApplicationForm'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function DriverApplyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Application</h1>
          <p className="text-gray-600 mt-2">UCD students only. We&apos;ll review your application and get back to you within 24 hours.</p>
        </div>
        <DriverApplicationForm />
      </main>
      <Footer />
    </div>
  )
}
