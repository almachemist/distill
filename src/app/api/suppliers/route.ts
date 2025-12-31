import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Supplier } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getOrgId(supabase: any): Promise<string> {
  if (process.env.NODE_ENV === 'development') return '00000000-0000-0000-0000-000000000001'
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  if (!profile?.organization_id) throw new Error('User organization not found')
  return profile.organization_id
}

export async function GET() {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_name, email, phone, notes')
      .eq('organization_id', org)
      .order('name')
    if (error) throw error
    const out: Supplier[] = (data || []).map((s: any) => ({ id: s.id, name: s.name, contactName: s.contact_name || '', email: s.email || '', phone: s.phone || '', notes: s.notes || '' }))
    return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    const flag = (process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase()
    const useStatic = flag === '1' || flag === 'true' || flag === 'yes' || process.env.NODE_ENV === 'development'
    if (useStatic) {
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
    }
    return NextResponse.json({ error: e?.message || 'Failed to load suppliers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
    const payload = await req.json()
    if (!payload?.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    const { data, error } = await supabase
      .from('suppliers')
      .insert({ organization_id: org, name: payload.name, contact_name: payload.contactName || null, email: payload.email || null, phone: payload.phone || null, notes: payload.notes || null })
      .select('id, name, contact_name, email, phone, notes')
      .single()
    if (error) throw error
    const supplier: Supplier = { id: data.id, name: data.name, contactName: data.contact_name || '', email: data.email || '', phone: data.phone || '', notes: data.notes || '' }
    return NextResponse.json(supplier, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create supplier' }, { status: 500 })
  }
}
