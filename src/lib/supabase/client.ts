import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

function isValidUrl(u: string | null | undefined): u is string {
  return typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))
}

export function createClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!isValidUrl(url) || typeof key !== 'string') {
    const makeResult = (single = false) => ({
      data: single ? null : [],
      error: new Error('Supabase is not configured')
    })
    const makeQuery = () => {
      let single = false
      const q = {
        select() { return q },
        insert() { return q },
        update() { return q },
        delete() { return q },
        order() { return q },
        eq() { return q },
        single() { single = true; return q },
        then(resolve: (value: unknown) => void) { resolve(makeResult(single)) },
        catch() { return q },
      }
      return q
    }
    const stub = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        setSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured') }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured') }),
        signOut: async () => ({ error: null }),
        refreshSession: async () => ({ data: { session: null }, error: null }),
        resetPasswordForEmail: async () => ({ error: new Error('Supabase is not configured') }),
        updateUser: async () => ({ data: null, error: new Error('Supabase is not configured') }),
        resend: async () => ({ data: null, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        admin: {
          deleteUser: async () => ({ data: null, error: null }),
        },
      },
      rpc() { return makeQuery() },
      from() { return makeQuery() },
      channel() {
        const ch = {
          on() { return ch },
          subscribe() { return { id: 'stub' } },
        }
        return ch
      },
      removeChannel() { /* noop */ },
    }
    cached = stub as unknown as SupabaseClient
    return cached
  }
  cached = createBrowserClient(url, key)
  return cached
}
