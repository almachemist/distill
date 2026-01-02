import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'

const RATE_WINDOW_MS = 60000
const RATE_MAX = 10
const buckets = new Map<string, { count: number; start: number }>()
function allow(req: NextRequest): boolean {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || now - b.start >= RATE_WINDOW_MS) { buckets.set(ip, { count: 1, start: now }); return true }
  b.count += 1
  return b.count <= RATE_MAX
}

function isValidUrl(u: string | null | undefined): u is string {
  return typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))
}

export async function GET(req: NextRequest) {
  if (!allow(req)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  const urlParam = new URL(req.url)
  const email = (urlParam.searchParams.get('email') || '').toLowerCase()
  const allowAny = (process.env.ALLOW_TEST_LOGIN_ANY || 'false').toLowerCase() === 'true'
  const envList = (process.env.ALLOW_TEST_LOGIN_EMAILS || process.env.ALLOW_TEST_LOGIN_EMAIL || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const defaults = ['g@g.com', 'distillery@devilsthumbdistillery.com', 'distiller@devilsthumbdistillery.com']
  const allowedSet = new Set(envList.length ? envList : defaults)
  if (!email || (!allowAny && !allowedSet.has(email))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://distil-app.com'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!isValidUrl(supabaseUrl) || typeof supabaseAnonKey !== 'string') {
    return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 })
  }

  const admin = createServiceRoleClient()
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: site },
  })
  const props = (data as any)?.properties || {}
  const tokenHash = props.hashed_token || props.token_hash
  if (error || !tokenHash) {
    return NextResponse.json({ error: error?.message || 'token_hash_error' }, { status: 400 })
  }

  const serverSupabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return [] as any },
      setAll() {},
    }
  })
  const { data: sessionData, error: verifyError } = await serverSupabase.auth.verifyOtp({
    email,
    token_hash: tokenHash,
    type: 'email',
  })
  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 400 })
  }
  if (!sessionData?.session) {
    return NextResponse.json({ error: 'session_missing' }, { status: 400 })
  }
  const redirectUrl = new URL('/auth/test/callback', site)
  redirectUrl.searchParams.set('access_token', sessionData.session.access_token)
  redirectUrl.searchParams.set('refresh_token', sessionData.session.refresh_token)
  return NextResponse.redirect(redirectUrl)
}
