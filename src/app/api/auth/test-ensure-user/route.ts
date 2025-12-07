import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { email: rawEmail, password: rawPassword } = await req.json().catch(() => ({}))
  const allowed = (process.env.ALLOW_TEST_LOGIN_EMAIL || 'distiller@devilsthumbdistillery.com').toLowerCase()
  const email = (rawEmail || allowed).toLowerCase()
  const password = rawPassword || process.env.TEST_LOGIN_PASSWORD || '12345678'

  if (email !== allowed) {
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
