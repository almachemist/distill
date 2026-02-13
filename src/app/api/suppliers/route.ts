import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { Supplier } from '@/types/inventory'
import { z } from 'zod'

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


export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: org } = auth
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_name, email, phone, notes')
      .eq('organization_id', org)
      .order('name')
    if (error) throw error
    const out: Supplier[] = (data || []).map((s: any) => ({ id: s.id, name: s.name, contactName: s.contact_name || '', email: s.email || '', phone: s.phone || '', notes: s.notes || '' }))
    log('info', 'suppliers_list', { org, count: out.length, reqId: getReqId(req) })
    return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    const flag = (process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase()
    const useStatic = flag === '1' || flag === 'true' || flag === 'yes' || process.env.NODE_ENV === 'development'
    if (useStatic) {
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
    }
    log('error', 'suppliers_list_error', { error: e?.message, reqId: getReqId(req) })
    return NextResponse.json({ error: e?.message || 'Failed to load suppliers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: org } = auth
    const body = await req.json()
    const SupplierSchema = z.object({
      name: z.string().min(1),
      contactName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      notes: z.string().optional()
    })
    const parsed = SupplierSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const payload = parsed.data
    log('info', 'supplier_create_attempt', { org, name: payload.name, reqId: getReqId(req) })
    const { data, error } = await supabase
      .from('suppliers')
      .insert({ organization_id: org, name: payload.name, contact_name: payload.contactName || null, email: payload.email || null, phone: payload.phone || null, notes: payload.notes || null })
      .select('id, name, contact_name, email, phone, notes')
      .single()
    if (error) throw error
    const supplier: Supplier = { id: data.id, name: data.name, contactName: data.contact_name || '', email: data.email || '', phone: data.phone || '', notes: data.notes || '' }
    log('info', 'supplier_created', { org, id: data.id, name: data.name, reqId: getReqId(req) })
    return NextResponse.json(supplier, { status: 201 })
  } catch (e: any) {
    log('error', 'supplier_create_error', { error: e?.message, reqId: getReqId(req) })
    return NextResponse.json({ error: e?.message || 'Failed to create supplier' }, { status: 500 })
  }
}
