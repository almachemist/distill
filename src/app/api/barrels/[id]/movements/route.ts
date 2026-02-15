import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'

type MovementRow = {
  id: string
  barrel_uuid: string | null
  barrel_number: string | null
  source_table: string | null
  source_key: string | null
  from_status: string | null
  to_status: string
  movement_type: string
  moved_at: string
  notes: string | null
  blend_batch_id: string | null
  created_at: string
}

function isUuid(v: any) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || '').trim())
}

async function findRecordByKeys(supabase: any, table: string, id: string) {
  const keys = ['id', 'barrel_id', 'barrel_number']
  for (const key of keys) {
    try {
      const { data, error } = await supabase.from(table).select('*').eq(key, id).limit(1)
      if (!error && Array.isArray(data) && data.length > 0) {
        return { record: data[0], matchedKey: key }
      }
    } catch {}
  }
  return { record: null, matchedKey: '' }
}

async function locateBarrel(supabase: any, id: string) {
  const configured = process.env.NEXT_PUBLIC_BARRELS_TABLE || ''
  const candidates = [configured, 'tracking', 'barrels', 'barrel_tracking', 'barrels_tracking'].filter(Boolean)
  for (const table of candidates) {
    const found = await findRecordByKeys(supabase, table, id)
    if (found.record) return { table, ...found }
  }
  return { table: '', record: null as any, matchedKey: '' }
}

function pickFirstExistingKey(record: any, keys: string[]) {
  for (const k of keys) {
    if (record && Object.prototype.hasOwnProperty.call(record, k)) return k
  }
  return ''
}

function normalizeBarrelNumber(record: any) {
  const v = String(record?.barrel_number || record?.barrel_id || '').trim()
  return v || null
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const { id } = await context.params
    const raw = decodeURIComponent(id)

    const located = await locateBarrel(supabase, raw)
    if (!located.record) {
      return NextResponse.json({ movements: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const barrelUuid = isUuid(located.record.id) ? String(located.record.id) : (isUuid(located.record.barrel_id) ? String(located.record.barrel_id) : null)
    const barrelNumber = normalizeBarrelNumber(located.record)

    let q = supabase
      .from('barrel_movements')
      .select('*')
      .order('moved_at', { ascending: false })
      .limit(250)

    if (barrelUuid) {
      q = q.eq('barrel_uuid', barrelUuid)
    } else if (barrelNumber) {
      q = q.eq('barrel_number', barrelNumber)
    } else {
      return NextResponse.json({ movements: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const { data, error } = await q
    if (error) throw error

    return NextResponse.json({ movements: (data || []) as MovementRow[] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load movements' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const { id } = await context.params
    const raw = decodeURIComponent(id)
    const body = await req.json().catch(() => ({}))
    const toStatus = String(body?.toStatus || '').trim()
    const notes = typeof body?.notes === 'string' ? body.notes : null
    const blendBatchId = typeof body?.blendBatchId === 'string' && body.blendBatchId.trim() ? body.blendBatchId.trim() : null

    if (!toStatus) {
      return NextResponse.json({ error: 'Missing toStatus' }, { status: 400 })
    }

    const located = await locateBarrel(supabase, raw)
    if (!located.record) {
      return NextResponse.json({ error: 'Barrel not found' }, { status: 404 })
    }

    const fromStatus = String(located.record.status || '').trim() || null
    const statusKey = pickFirstExistingKey(located.record, ['status'])
    if (!statusKey) {
      return NextResponse.json({ error: 'Underlying barrel record has no status column' }, { status: 400 })
    }

    const barrelUuid = isUuid(located.record.id) ? String(located.record.id) : (isUuid(located.record.barrel_id) ? String(located.record.barrel_id) : null)
    const barrelNumber = normalizeBarrelNumber(located.record)

    const movementType = toStatus.toLowerCase() === 'blended' ? 'blend' : 'status_change'

    const movementRow: any = {
      barrel_uuid: barrelUuid,
      barrel_number: barrelNumber,
      source_table: located.table,
      source_key: located.matchedKey,
      from_status: fromStatus,
      to_status: toStatus,
      movement_type: movementType,
      moved_at: new Date().toISOString(),
      notes,
      blend_batch_id: blendBatchId,
    }

    const { error: movErr } = await supabase.from('barrel_movements').insert(movementRow)
    if (movErr) throw movErr

    const keyValue = (located.record as any)?.[located.matchedKey]
    if (keyValue === undefined || keyValue === null || String(keyValue).trim() === '') {
      return NextResponse.json({ error: 'Failed to resolve barrel key value for status update' }, { status: 400 })
    }

    const { error: updErr } = await supabase
      .from(located.table)
      .update({ status: toStatus })
      .eq(located.matchedKey, keyValue)

    if (updErr) throw updErr

    return NextResponse.json({ ok: true, fromStatus, toStatus, table: located.table })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to move barrel' }, { status: 500 })
  }
}
