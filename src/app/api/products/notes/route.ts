import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function log(level: 'info' | 'error', message: string, meta?: Record<string, any>) {
  const entry = { level, message, time: new Date().toISOString(), ...(meta || {}) }
  if (level === 'error') console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}
function getReqId(req: NextRequest) {
  return req.headers.get('x-request-id') || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
}

type NoteRow = {
  id?: string
  organization_id?: string
  product_name: string
  notes: string
  updated_at?: string
}

const memoryStore = new Map<string, NoteRow>()


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
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: organization_id } = auth
    const { data, error } = await supabase
      .from('product_notes')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('product_name', name)
      .maybeSingle()
    if (error) throw error
    const row = data as NoteRow | null
    log('info', 'product_notes_fetch', { organization_id, productName: name, found: !!row, reqId: getReqId(request) })
    return NextResponse.json({ productName: name, notes: row?.notes || '', updated_at: row?.updated_at || null }, { status: 200 })
  } catch (error) {
    log('error', 'product_notes_fetch_error', { error: (error as any)?.message, reqId: getReqId(request) })
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
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: organization_id } = auth
    const upsertRow = { organization_id, product_name: productName, notes }
    const { data, error } = await supabase
      .from('product_notes')
      .upsert(upsertRow, { onConflict: 'organization_id,product_name' })
      .select('*')
      .maybeSingle()
    if (error) throw error
    log('info', 'product_notes_saved', { organization_id, productName, reqId: getReqId(request) })
    return NextResponse.json({ ok: true, productName, notes: (data as NoteRow)?.notes || notes }, { status: 200 })
  } catch (error) {
    log('error', 'product_notes_save_error', { error: (error as any)?.message, reqId: getReqId(request) })
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }
}
