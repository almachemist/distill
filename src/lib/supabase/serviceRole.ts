import { createClient as createSbClient } from '@supabase/supabase-js'

// Server-only Supabase client using the service role key.
// Never import this into client-side code.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role environment variables')
  }
  return createSbClient(url, key)
}

