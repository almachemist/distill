import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(req: NextRequest) {
  if (!allow(req)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  const url = new URL(req.url)
  const email = (url.searchParams.get('email') || '').toLowerCase()
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
  const sb = createServiceRoleClient()
  const { data, error } = await sb.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: site },
  })
  const link = (data as any)?.properties?.action_link || (data as any)?.action_link
  if (error || !link) {
    return NextResponse.json({ error: error?.message || 'link_error' }, { status: 400 })
  }
  return NextResponse.redirect(link, 302)
}
