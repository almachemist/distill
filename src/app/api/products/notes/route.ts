import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NoteRow = {
  id?: string
  organization_id?: string
  product_name: string
  notes: string
  updated_at?: string
}

const memoryStore = new Map<string, NoteRow>()

async function getOrganizationId(supabase: SupabaseClient): Promise<string> {
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

export async function GET(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get('name') || ''
    const flag = (process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase()
    const useStatic = flag === '1' || flag === 'true' || flag === 'yes' || process.env.NODE_ENV === 'development'
    if (!name) {
      return NextResponse.json({ productName: '', notes: '', updated_at: null }, { status: 200 })
    }
    if (useStatic) {
      const row = memoryStore.get(name) || { product_name: name, notes: '' }
      return NextResponse.json({ productName: row.product_name, notes: row.notes, updated_at: row.updated_at || null }, { status: 200 })
    }
    const supabase = await createClient()
    const organization_id = await getOrganizationId(supabase)
    const { data, error } = await supabase
      .from('product_notes')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('product_name', name)
      .maybeSingle()
    if (error) throw error
    const row = data as NoteRow | null
    return NextResponse.json({ productName: name, notes: row?.notes || '', updated_at: row?.updated_at || null }, { status: 200 })
  } catch (error) {
    console.error('GET /api/products/notes error:', error)
    return NextResponse.json({ productName: '', notes: '', updated_at: null }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { productName?: string; notes?: string }
    const productName = String(body?.productName || '').trim()
    const notes = String(body?.notes || '')
    if (!productName) {
      return NextResponse.json({ error: 'Missing productName' }, { status: 400 })
    }
    const flag = (process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase()
    const useStatic = flag === '1' || flag === 'true' || flag === 'yes' || process.env.NODE_ENV === 'development'
    if (useStatic) {
      const row: NoteRow = { product_name: productName, notes, updated_at: new Date().toISOString() }
      memoryStore.set(productName, row)
      return NextResponse.json({ ok: true, productName, notes }, { status: 200 })
    }
    const supabase = await createClient()
    const organization_id = await getOrganizationId(supabase)
    const upsertRow = { organization_id, product_name: productName, notes }
    const { data, error } = await supabase
      .from('product_notes')
      .upsert(upsertRow, { onConflict: 'organization_id,product_name' })
      .select('*')
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ ok: true, productName, notes: (data as NoteRow)?.notes || notes }, { status: 200 })
  } catch (error) {
    console.error('POST /api/products/notes error:', error)
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }
}
