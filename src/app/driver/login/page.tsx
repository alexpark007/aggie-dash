'use client'
export const dynamic = 'force-dynamic'


import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'

export default function DriverLoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Driver Login</h2>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your Aggie Dash driver account</p>
        </div>
        <Suspense>
          <AuthForm mode="login" role="driver" redirectTo="/driver/dashboard" />
        </Suspense>
        <p className="text-center text-sm text-gray-500">
          New driver?{' '}
          <a href="/driver/apply" className="text-[#002855] font-semibold hover:underline">Apply here</a>
        </p>
      </div>
    </div>
  )
}
