import { createClient as createSbClient } from '@supabase/supabase-js'

function isValidUrl(u: string | null | undefined): u is string {
  return typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))
}

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!isValidUrl(url) || typeof key !== 'string' || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }
  return createSbClient(url, key)
}
