'use client'
export const dynamic = 'force-dynamic'


import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'

export default function RestaurantLoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Restaurant Portal</h2>
          <p className="text-gray-500 mt-1 text-sm">Sign in to manage your restaurant on Aggie Dash</p>
        </div>
        <Suspense>
          <AuthForm mode="login" role="restaurant" redirectTo="/restaurant/dashboard" />
        </Suspense>
        <p className="text-center text-sm text-gray-500">
          New restaurant?{' '}
          <a href="/restaurant/onboarding" className="text-[#002855] font-semibold hover:underline">
            Apply to join
          </a>
        </p>
      </div>
    </div>
  )
}
