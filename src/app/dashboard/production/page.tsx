'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductionRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/production/new')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-copper"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to production...</p>
      </div>
    </div>
  )
}
