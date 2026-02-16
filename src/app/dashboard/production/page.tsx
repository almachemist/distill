'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductionRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/production/new')
  }, [router])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        <p className="mt-4 text-neutral-600">Redirecting to production...</p>
      </div>
    </div>
  )
}
