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
    const makeResult = (single = false) => ({
      data: single ? null : [],
      error: new Error('Supabase is not configured')
    })
    const makeQuery = () => {
      let single = false
      const q: any = {
        select() { return q },
        insert() { return q },
        update() { return q },
        delete() { return q },
        order() { return q },
        eq() { return q },
        single() { single = true; return q },
        then(resolve: any) { resolve(makeResult(single)) },
        catch() { return q },
      }
      return q
    }
    cached = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null })
      },
      from() { return makeQuery() },
      channel() {
        const ch: any = {
          on() { return ch },
          subscribe() { return { id: 'stub' } },
        }
        return ch
      },
      removeChannel() { /* noop */ },
    } as any
    return cached
  }
  cached = createBrowserClient(url, key)
  return cached
}
