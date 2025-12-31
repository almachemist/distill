import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type MovementChange = { id?: string; sku?: string; delta: number; note?: string }

type MovementRecord = {
  dt: string
  reference?: string
  reason?: string
  changes: Array<{ id: string; sku: string; delta: number; before: number; after: number; note?: string }>
}

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

async function getOnHand(supabase: any, org: string, item_id: string): Promise<number> {
  const { data } = await supabase
    .from('inventory_txns')
    .select('quantity, txn_type')
    .eq('organization_id', org)
    .eq('item_id', item_id)
  return (data || []).reduce((acc: number, t: any) => {
    switch (t.txn_type) {
      case 'RECEIVE':
      case 'PRODUCE':
        return acc + Number(t.quantity || 0)
      case 'CONSUME':
      case 'TRANSFER':
      case 'DESTROY':
      case 'ADJUST':
        return acc - Number(t.quantity || 0)
      default:
        return acc
    }
  }, 0)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(500, Number(searchParams.get('limit') || 100)))
    const { data, error } = await supabase
      .from('inventory_txns')
      .select('dt, item_id, quantity, txn_type, note')
      .eq('organization_id', org)
      .order('dt', { ascending: false })
      .limit(limit)
    if (error) throw error
    const out: MovementRecord[] = []
    for (const t of data || []) {
      const after = await getOnHand(supabase, org, t.item_id)
      const sign = ['RECEIVE','PRODUCE'].includes(t.txn_type) ? 1 : -1
      const delta = sign * Number(t.quantity || 0)
      out.push({
        dt: t.dt,
        reference: t.note || undefined,
        reason: t.txn_type.toLowerCase(),
        changes: [{ id: t.item_id, sku: t.item_id, delta, before: after - delta, after, note: t.note || undefined }]
      })
    }
    return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load movements' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
    const payload = await req.json() as { reference?: string; reason?: string; changes: MovementChange[] }
    if (!payload?.changes || !Array.isArray(payload.changes) || payload.changes.length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }
    const pending = new Map<string, { item_id: string; delta: number; note?: string }>()
    const notFound: MovementChange[] = []
    for (const ch of payload.changes) {
      let item_id = ch.id || ''
      if (!item_id && ch.sku) {
        const byId = await supabase
          .from('items')
          .select('id')
          .eq('organization_id', org)
          .eq('id', ch.sku)
          .single()
        if (byId.data?.id) item_id = byId.data.id
        else {
          const byName = await supabase
            .from('items')
            .select('id')
            .eq('organization_id', org)
            .eq('name', ch.sku)
            .single()
          if (byName.data?.id) item_id = byName.data.id
        }
      }
      if (!item_id) { notFound.push(ch); continue }
      const prev = pending.get(item_id)
      pending.set(item_id, { item_id, delta: (prev?.delta || 0) + Number(ch.delta || 0), note: ch.note || prev?.note })
    }
    if (notFound.length) {
      return NextResponse.json({ error: 'Some items not found', notFound }, { status: 404 })
    }

    for (const { item_id, delta } of pending.values()) {
      if (delta < 0) {
        const available = await getOnHand(supabase, org, item_id)
        if (available + delta < 0) {
          return NextResponse.json({ error: 'Insufficient stock', detail: { id: item_id, requestedDelta: delta, available } }, { status: 400 })
        }
      }
    }

    const txns = [] as any[]
    const now = new Date().toISOString()
    const reason = (payload.reason || '').toLowerCase()
    for (const { item_id, delta, note } of pending.values()) {
      let txn_type: 'RECEIVE'|'CONSUME'|'ADJUST'|'PRODUCE' = 'ADJUST'
      if (delta >= 0) txn_type = reason === 'receive' ? 'RECEIVE' : 'PRODUCE'
      else txn_type = reason === 'consume' ? 'CONSUME' : 'ADJUST'
      txns.push({ organization_id: org, item_id, txn_type, quantity: Math.abs(delta), uom: 'unit', note: payload.reference || note || 'Movement', dt: now })
    }
    const { error } = await supabase
      .from('inventory_txns')
      .insert(txns)
    if (error) throw error

    const applied: MovementRecord['changes'] = []
    for (const { item_id, delta } of pending.values()) {
      const after = await getOnHand(supabase, org, item_id)
      applied.push({ id: item_id, sku: item_id, delta, before: after - delta, after, note: payload.reference })
    }
    const out: MovementRecord = { dt: new Date().toISOString(), reference: payload.reference, reason: payload.reason, changes: applied }
    return NextResponse.json(out)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to apply movements' }, { status: 500 })
  }
}
