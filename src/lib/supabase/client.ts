import { createBrowserClient } from '@supabase/ssr'

let cached: any | null = null

export function createClient(): any {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
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
