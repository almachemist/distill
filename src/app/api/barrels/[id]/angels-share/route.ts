import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'

function toNum(v: any) {
  const n = parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : 0
}

function pickFirstExistingKey(record: any, keys: string[]) {
  for (const k of keys) {
    if (record && Object.prototype.hasOwnProperty.call(record, k)) return k
  }
  return ''
}

function setIfExists(update: any, record: any, keys: string[], value: any) {
  const key = pickFirstExistingKey(record, keys)
  if (!key) return
  const current = (record as any)[key]
  if (typeof current === 'number') update[key] = toNum(value)
  else update[key] = value == null ? null : String(value)
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

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const { id: rawId } = await context.params
    const id = decodeURIComponent(rawId)

    const body = await req.json().catch(() => ({}))
    const afterVolume = toNum(body?.afterVolume)
    const afterAbv = toNum(body?.afterAbv)

    if (!Number.isFinite(afterVolume) || afterVolume <= 0) {
      return NextResponse.json({ error: 'Invalid after volume' }, { status: 400 })
    }
    if (!Number.isFinite(afterAbv) || afterAbv <= 0 || afterAbv > 100) {
      return NextResponse.json({ error: 'Invalid after ABV' }, { status: 400 })
    }

    const configured = process.env.NEXT_PUBLIC_BARRELS_TABLE || ''
    const candidates = [configured, 'tracking', 'barrels', 'barrel_tracking', 'barrels_tracking'].filter(Boolean)

    let targetTable = ''
    let matchedKey = ''
    let record: any = null

    for (const tbl of candidates) {
      const found = await findRecordByKeys(supabase, tbl, id)
      if (found?.record) {
        targetTable = tbl
        matchedKey = found.matchedKey
        record = found.record
        break
      }
    }

    if (!targetTable || !matchedKey || !record) {
      return NextResponse.json({ error: 'Barrel not found' }, { status: 404 })
    }

    const beforeVolume = toNum(record.volume_l ?? record.current_volume_l ?? record.current_volume ?? record.volume)
    const beforeAbv = toNum(record.current_abv ?? record.abv_percent ?? record.abv)

    if (!Number.isFinite(beforeVolume) || beforeVolume <= 0) {
      return NextResponse.json({ error: 'Missing before volume on barrel record' }, { status: 400 })
    }
    if (!Number.isFinite(beforeAbv) || beforeAbv <= 0 || beforeAbv > 100) {
      return NextResponse.json({ error: 'Missing before ABV on barrel record' }, { status: 400 })
    }

    const volumeLoss = Math.max(0, beforeVolume - afterVolume)
    const volumeLossPct = beforeVolume > 0 ? (volumeLoss / beforeVolume) * 100 : 0

    const lalBefore = beforeVolume * (beforeAbv / 100)
    const lalAfter = afterVolume * (afterAbv / 100)
    const lalLoss = Math.max(0, lalBefore - lalAfter)

    const angelsShareSummary = `${volumeLoss.toFixed(1)} L (${volumeLossPct.toFixed(1)}%) • ${lalLoss.toFixed(1)} LAL`

    // 1) Always write an immutable measurement record so we never lose the previous values.
    const barrelUuid = isUuid(record.id) ? String(record.id) : (isUuid(record.barrel_id) ? String(record.barrel_id) : null)
    const barrelNumber = String(record.barrel_number || record.barrel_id || '').trim() || null
    const measurementRow: any = {
      barrel_uuid: barrelUuid,
      barrel_number: barrelNumber,
      source_table: targetTable,
      source_key: matchedKey,
      measurement_type: 'angels_share',
      measured_at: new Date().toISOString(),
      before_volume_l: beforeVolume,
      before_abv_percent: beforeAbv,
      after_volume_l: afterVolume,
      after_abv_percent: afterAbv,
      volume_loss_l: volumeLoss,
      volume_loss_percent: volumeLossPct,
      lal_before: lalBefore,
      lal_after: lalAfter,
      lal_loss: lalLoss,
      summary: angelsShareSummary,
    }

    let measurementInserted = false
    try {
      const { error: measErr } = await supabase.from('barrel_measurements').insert(measurementRow)
      if (!measErr) measurementInserted = true
    } catch {}

    // 2) Optionally update a summary field on the barrel record (but do NOT overwrite volume/abv).
    const updateData: any = {}
    setIfExists(updateData, record, ['angelsshare', 'angels_share'], angelsShareSummary)

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from(targetTable)
        .update(updateData)
        .eq(matchedKey, id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({
      ok: true,
      angelsShare: angelsShareSummary,
      measurementInserted,
      before: { volume_l: beforeVolume, abv_percent: beforeAbv },
      after: { volume_l: afterVolume, abv_percent: afterAbv },
    })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Unknown error') }, { status: 500 })
  }
}
