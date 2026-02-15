import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'

function toNum(v: any) {
  const n = parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : 0
}

function toNumOrNull(v: any): number | null {
  if (v === null || v === undefined) return null
  const raw = String(v).trim()
  if (!raw) return null
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : null
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id: rawId } = await context.params
    const id = decodeURIComponent(rawId)
    const body = await req.json().catch(() => ({}))

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

    const updateData: any = {}
    setIfExists(updateData, record, ['spirit', 'spirit_type'], body?.spiritType)
    setIfExists(updateData, record, ['prev_spirit'], body?.prevSpirit)
    setIfExists(updateData, record, ['barrel', 'barrel_type', 'cask', 'cask_type'], body?.barrelType)
    setIfExists(updateData, record, ['location', 'location_name', 'warehouse', 'location_normalized'], body?.location)

    if (body?.currentVolume !== undefined) {
      setIfExists(updateData, record, ['current_volume_l', 'volume_l', 'liters', 'current_volume', 'volume'], body.currentVolume)
    }
    if (body?.originalVolume !== undefined) {
      setIfExists(updateData, record, ['original_volume_l', 'original_volume', 'filled_liters'], body.originalVolume)
    }
    if (body?.abv !== undefined) {
      setIfExists(updateData, record, ['abv', 'current_abv', 'abv_percent', 'strength'], body.abv)
    }

    setIfExists(updateData, record, ['notes_comments', 'notes'], body?.notes)
    setIfExists(updateData, record, ['status'], body?.status)
    setIfExists(updateData, record, ['batch', 'batch_id', 'batch_code', 'batch_name'], body?.batch)
    setIfExists(updateData, record, ['tasting_notes', 'tasting'], body?.tastingNotes)
    setIfExists(updateData, record, ['angelsshare', 'angels_share'], body?.angelsShare)

    setDateIfExists(updateData, record, ['date_filled', 'date_filled_normalized', 'fill_date', 'filled_date', 'filled_at', 'date_filled_at'], body?.fillDate)
    setDateIfExists(updateData, record, ['date_mature', 'date_mature_normalized', 'mature_date', 'maturation_date', 'date_maturation', 'matured_date', 'matured_at'], body?.dateMature)
    setDateIfExists(updateData, record, ['last_inspection', 'inspection_date'], body?.lastInspection)

    const hasUpdates = Object.keys(updateData).length > 0
    if (!hasUpdates) {
      const mapped = mapBarrel(record)
      return NextResponse.json({ ok: true, barrel: mapped, table: targetTable })
    }

    const { data: updated, error } = await supabase
      .from(targetTable)
      .update(updateData)
      .eq(matchedKey, id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const mapped = mapBarrel(updated)
    return NextResponse.json({ ok: true, barrel: mapped, table: targetTable })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Unknown error') }, { status: 500 })
  }
}

const normalizeDateInput = (value?: string | null): string => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  const lower = raw.toLowerCase()
  if (lower === 'invalid date' || lower === 'null' || lower === 'undefined') return ''

  let s = raw
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) {
    s = s.replace(/\s+/, 'T')
  }
  if (/[+-]\d{2}$/.test(s)) {
    s = `${s}:00`
  }
  if (/[+-]\d{4}$/.test(s)) {
    s = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) {
    s = `${s}Z`
  }
  return s
}

const toIsoDateLike = (value?: any): string => {
  const raw = normalizeDateInput(value)
  if (!raw) return ''
  const direct = Date.parse(raw)
  if (Number.isFinite(direct)) return new Date(direct).toISOString()

  const ymd = raw.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/)
  if (ymd) {
    const year = parseInt(ymd[1], 10)
    const month = parseInt(ymd[2], 10)
    const day = parseInt(ymd[3], 10)
    const t = Date.UTC(year, month - 1, day)
    return Number.isFinite(t) ? new Date(t).toISOString() : ''
  }

  const dmy = raw.match(/^([0-9]{1,2})[\/\-.]([0-9]{1,2})[\/\-.]([0-9]{2,4})$/)
  if (dmy) {
    let day = parseInt(dmy[1], 10)
    let month = parseInt(dmy[2], 10)
    let year = parseInt(dmy[3], 10)
    if (year < 100) year += 2000
    if (day <= 12 && month > 12) {
      const tmp = day
      day = month
      month = tmp
    }
    const t = Date.UTC(year, month - 1, day)
    return Number.isFinite(t) ? new Date(t).toISOString() : ''
  }

  return ''
}

const pickDateLike = (...values: any[]) => {
  for (const value of values) {
    const iso = toIsoDateLike(value)
    if (iso) return iso
  }
  return ''
}

function mapBarrel(b: any) {
  const vol =
    typeof b.volume_l !== 'undefined' ? toNum(b.volume_l) :
    typeof b.liters !== 'undefined' ? toNum(b.liters) :
    toNum(b.volume)

  const volOriginal =
    typeof b.original_volume_l !== 'undefined' ? toNumOrNull(b.original_volume_l) :
    typeof b.original_volume !== 'undefined' ? toNumOrNull(b.original_volume) :
    typeof b.filled_liters !== 'undefined' ? toNumOrNull(b.filled_liters) :
    null
  const abv =
    typeof b.abv !== 'undefined' ? toNum(b.abv) :
    typeof b.strength !== 'undefined' ? toNum(b.strength) : 0
  const size =
    typeof b.size !== 'undefined' ? String(b.size) :
    typeof b.barrel_size !== 'undefined' ? String(b.barrel_size) : ''
  const fill = pickDateLike(
    b.fillDate,
    b.date_filled_normalized,
    b.date_filled,
    b.fill_date,
    b.filled_date,
    b.date_filled_at,
    b.filled_at,
    b.date_filled_on,
  )
  const loc =
    b.location_normalized || b.location || b.location_name || ''

  const id =
    (typeof b.id === 'string' && b.id) ? b.id :
    (typeof b.barrel_id === 'string' && b.barrel_id) ? b.barrel_id :
    (typeof b.barrel_number === 'string' && b.barrel_number) ? b.barrel_number :
    String(b.id ?? '')

  return {
    id,
    barrelNumber: b.barrel_number || b.barrel_id || '',
    spiritType: b.spirit || '',
    prevSpirit: b.prev_spirit,
    barrelType: b.barrel || b.barrel_type || '',
    barrelSize: String(size).trim() === '0' ? '' : size,
    liters: vol,
    fillDate: fill,
    location: loc,
    status: b.status || 'Aging',
    currentVolume: vol,
    originalVolume: volOriginal,
    abv,
    notes: b.notes_comments || b.notes || '',
    batch: b.batch || '',
    dateMature: pickDateLike(
      b.dateMature,
      b.date_mature_normalized,
      b.date_mature,
      b.mature_date,
      b.maturation_date,
      b.date_maturation,
      b.matured_date,
      b.matured_at,
    ),
    tastingNotes: b.tasting_notes || '',
    angelsShare: b.angelsshare || b.angels_share || '',
    lastInspection: pickDateLike(b.lastInspection, b.last_inspection, b.inspection_date),
    organizationId: b.organization_id || '',
    createdBy: b.created_by || null,
    createdAt: pickDateLike(b.created_at, b.createdAt),
    updatedAt: pickDateLike(b.updated_at, b.updatedAt)
  }
}

async function findRecordByKeys(supabase: any, table: string, id: string) {
  const keys = ['id', 'barrel_id', 'barrel_number']
  for (const key of keys) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(key, id)
        .limit(1)
      if (!error && Array.isArray(data) && data.length > 0) {
        return { record: data[0], matchedKey: key }
      }
    } catch {}
  }
  return { record: null, matchedKey: '' }
}

function pickFirstExistingKey(record: any, keys: string[]) {
  for (const k of keys) {
    if (record && Object.prototype.hasOwnProperty.call(record, k)) return k
  }
  return ''
}

function setIfExists(update: any, record: any, keys: string[], value: any) {
  if (value === undefined) return
  if (typeof value === 'string' && value.trim() === '') return
  const key = pickFirstExistingKey(record, keys)
  if (!key) return
  const current = record[key]
  const wantsNumber =
    typeof current === 'number' ||
    (current == null && (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))))) ||
    /(_l|_liters|_percent|_abv|_volume)$/i.test(String(key))
  if (wantsNumber) update[key] = toNum(value)
  else update[key] = String(value)
}

function setDateIfExists(update: any, record: any, keys: string[], value: any) {
  if (value === undefined) return
  if (typeof value === 'string' && value.trim() === '') return
  const key = pickFirstExistingKey(record, keys)
  if (!key) return
  const iso = toIsoDateLike(value)
  if (!iso) return
  update[key] = iso
}

function scoreMappedBarrel(b: any) {
  const isValid = (v: any) => {
    const s = String(v ?? '').trim()
    if (!s) return false
    const t = Date.parse(s)
    return Number.isFinite(t)
  }
  let score = 0
  if (isValid(b?.fillDate)) score += 3
  if (isValid(b?.dateMature)) score += 2
  if (isValid(b?.lastInspection)) score += 1
  return score
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const { id: rawId } = await context.params
    const id = decodeURIComponent(rawId)
    const debug = (() => {
      try {
        const url = new URL(req.url)
        return url.searchParams.get('debug') === '1'
      } catch {
        return false
      }
    })()
    const configured = process.env.NEXT_PUBLIC_BARRELS_TABLE || ''
    const candidates = [configured, 'tracking', 'barrels', 'barrel_tracking', 'barrels_tracking'].filter(Boolean)

    const matches: { table: string; record: any; matchedKey?: string }[] = []
    for (const tbl of candidates) {
      const { record: r, matchedKey } = await findRecordByKeys(supabase, tbl, id)
      if (r) {
        matches.push({ table: tbl, record: r, matchedKey })
      }
    }

    if (matches.length === 0) {
      return NextResponse.json({ error: 'Barrel not found' }, { status: 404 })
    }

    const ranked = matches
      .map((m) => {
        const mapped = mapBarrel(m.record)
        return { ...m, mapped, score: scoreMappedBarrel(mapped) }
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        // Tie-breaker: prefer configured table, else keep earlier order
        if (configured && a.table === configured) return -1
        if (configured && b.table === configured) return 1
        return 0
      })

    const best = ranked[0]
    if (debug) {
      return NextResponse.json({
        barrel: best.mapped,
        table: best.table,
        matches: ranked.map((r) => ({
          table: r.table,
          matchedKey: (matches.find((m) => m.table === r.table)?.matchedKey) || '',
          score: r.score,
          mapped: r.mapped,
        })),
      })
    }

    return NextResponse.json({ barrel: best.mapped, table: best.table })
  } catch (e: any) {
    return NextResponse.json({ barrel: null, error: String(e?.message || 'Unknown error') }, { status: 200 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const { id: rawId } = await context.params
    const id = decodeURIComponent(rawId)
    const configured = process.env.NEXT_PUBLIC_BARRELS_TABLE || ''
    const candidates = [configured, 'tracking', 'barrels', 'barrel_tracking', 'barrels_tracking'].filter(Boolean)

    let targetTable = ''
    let matchedKey = ''

    for (const tbl of candidates) {
      const { record, matchedKey: key } = await findRecordByKeys(supabase, tbl, id)
      if (record) {
        targetTable = tbl
        matchedKey = key
        break
      }
    }

    if (!targetTable) {
      const { record, matchedKey: key } = await findRecordByKeys(supabase, 'tracking', id)
      if (record) {
        targetTable = 'tracking'
        matchedKey = key
      }
    }

    if (!targetTable || !matchedKey) {
      return NextResponse.json({ error: 'Barrel not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from(targetTable)
      .delete()
      .eq(matchedKey, id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Unknown error') }, { status: 200 })
  }
}
