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

export async function POST(req: NextRequest) {
  if (!allow(req)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  const { email: rawEmail, password: rawPassword } = await req.json().catch(() => ({}))
  const allowAny = (process.env.ALLOW_TEST_LOGIN_ANY || 'false').toLowerCase() === 'true'
  const envList = (process.env.ALLOW_TEST_LOGIN_EMAILS || process.env.ALLOW_TEST_LOGIN_EMAIL || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const defaults = ['g@g.com', 'distillery@devilsthumbdistillery.com', 'distiller@devilsthumbdistillery.com']
  const allowedSet = new Set(envList.length ? envList : defaults)
  const email = (rawEmail || envList[0] || defaults[0]).toLowerCase()
  const password = rawPassword || process.env.TEST_LOGIN_PASSWORD || '12345678'

  if (!allowAny && !allowedSet.has(email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const sb = createServiceRoleClient()
  const admin: any = (sb as any).auth.admin

  let userId: string | null = null
  try {
    const { data } = await admin.listUsers({ page: 1, perPage: 200 })
    const users = (data?.users || [])
    const match = users.find((u: any) => u.email?.toLowerCase() === email)
    userId = match?.id || null
  } catch {}

  if (!userId) {
    const { data, error } = await admin.createUser({ email, password, email_confirm: true })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    userId = (data?.user?.id) || null
    if (!userId) {
      return NextResponse.json({ error: 'user_create_failed' }, { status: 400 })
    }
  } else {
    const { error } = await admin.updateUserById(userId, { password, email_confirm: true })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  return NextResponse.json({ status: 'ok', email })
}
