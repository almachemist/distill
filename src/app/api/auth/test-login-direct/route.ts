import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'

function isValidUrl(u: string | null | undefined): u is string {
  return typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))
}

export async function GET(req: NextRequest) {
  const urlParam = new URL(req.url)
  const email = (urlParam.searchParams.get('email') || '').toLowerCase()
  const allowed = (process.env.ALLOW_TEST_LOGIN_EMAIL || 'distiller@devilsthumbdistillery.com').toLowerCase()
  const allowAny = (process.env.ALLOW_TEST_LOGIN_ANY || 'false').toLowerCase() === 'true'
  if (!email || (!allowAny && email !== allowed)) {
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
  const otp = (data as any)?.properties?.email_otp_token
  if (error || !otp) {
    return NextResponse.json({ error: error?.message || 'otp_error' }, { status: 400 })
  }

  let response = NextResponse.redirect(new URL('/dashboard', site))
  const serverSupabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Route handler does not need reads here
        return [] as any
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }: any) => {
          try { response.cookies.set(name, value, options) } catch {}
        })
      },
    }
  })

  const { data: sessionData, error: verifyError } = await serverSupabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  })
  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 400 })
  }
  if (!sessionData?.session) {
    return NextResponse.json({ error: 'session_missing' }, { status: 400 })
  }

  return response
}

