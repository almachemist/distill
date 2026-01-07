'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (!access_token || !refresh_token) {
      setError('Missing session tokens')
      return
    }
    const supabase = createClient()
    ;(async () => {
      const { error } = await (supabase as any).auth.setSession({ access_token, refresh_token })
      if (error) {
        setError(error.message)
        return
      }
      router.replace('/dashboard')
    })()
  }, [params, router])

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Completing sign-in...</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  )
}

export default function TestLoginCallback() {
  return (
    <Suspense fallback={<div className="p-6">Completing sign-in...</div>}>
      <CallbackInner />
    </Suspense>
  )
}
