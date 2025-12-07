import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const email = url.searchParams.get('email') || ''
  const allowed = (process.env.ALLOW_TEST_LOGIN_EMAIL || 'distiller@devilsthumbdistillery.com').toLowerCase()
  if (!email || email.toLowerCase() !== allowed) {
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
