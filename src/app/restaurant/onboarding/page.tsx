export const dynamic = 'force-dynamic'

import RestaurantOnboardingForm from '@/components/restaurant/OnboardingForm'

export default function RestaurantOnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Join Aggie Dash</h1>
        <p className="text-gray-600 mt-2">
          Reach thousands of Davis students and residents. We charge a flat <strong>$150/month</strong> —
          no per-order fees, ever.
        </p>
      </div>
      <RestaurantOnboardingForm />
    </div>
  )
}
