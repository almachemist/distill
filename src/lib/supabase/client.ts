import { createBrowserClient } from '@supabase/ssr'

let cached: any | null = null

function isValidUrl(u: string | null | undefined): u is string {
  return typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))
}

export function createClient(): any {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!isValidUrl(url) || typeof key !== 'string') {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null })
      },
      from() {
        throw new Error('Supabase is not configured')
      }
    } as any
  }
  cached = createBrowserClient(url, key)
  return cached
}
