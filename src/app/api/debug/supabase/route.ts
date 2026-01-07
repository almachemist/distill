import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const hasUrl = typeof url === 'string' && url.includes('.supabase.co')
  const hasAnon = typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasService = typeof process.env.SUPABASE_SERVICE_ROLE_KEY === 'string' && !!process.env.SUPABASE_SERVICE_ROLE_KEY
  try {
    const sb = createServiceRoleClient()
    const headRes = await sb.from('tracking').select('*', { count: 'exact', head: true })
    if (!headRes.error && typeof headRes.count === 'number') {
      return NextResponse.json({
        projectUrlOk: hasUrl,
        projectUrl: url,
        anonKeyOk: hasAnon,
        serviceRoleOk: hasService,
        usingServiceRole: true,
        trackingCount: headRes.count,
        error: null,
      })
    }
    const fullRes = await sb.from('tracking').select('*')
    return NextResponse.json({
      projectUrlOk: hasUrl,
      projectUrl: url,
      anonKeyOk: hasAnon,
      serviceRoleOk: hasService,
      usingServiceRole: true,
      trackingCount: Array.isArray(fullRes.data) ? fullRes.data.length : null,
      error: fullRes.error ? fullRes.error.message : null,
    })
  } catch (e: any) {
    return NextResponse.json({
      projectUrlOk: hasUrl,
      anonKeyOk: hasAnon,
      serviceRoleOk: hasService,
      usingServiceRole: false,
      trackingCount: null,
      error: e?.message || 'Failed to create service role client',
    }, { status: 500 })
  }
}
