import { NextResponse } from 'next/server'

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

function normalizeDateInput(value: any): string {
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

function toIsoDateLike(v: any) {
  const raw = normalizeDateInput(v)
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

function mapBarrel(b: any) {
  const volCurrent =
    typeof b.current_volume_l !== 'undefined' ? toNum(b.current_volume_l) :
    typeof b.volume_l !== 'undefined' ? toNum(b.volume_l) :
    typeof b.liters !== 'undefined' ? toNum(b.liters) :
    typeof b.current_volume !== 'undefined' ? toNum(b.current_volume) :
    toNum(b.volume)

  const volOriginal =
    typeof b.original_volume_l !== 'undefined' ? toNumOrNull(b.original_volume_l) :
    typeof b.original_volume !== 'undefined' ? toNumOrNull(b.original_volume) :
    typeof b.filled_liters !== 'undefined' ? toNumOrNull(b.filled_liters) :
    null
  const abv =
    typeof b.abv !== 'undefined' ? toNum(b.abv) :
    typeof b.strength !== 'undefined' ? toNum(b.strength) :
    typeof b.current_abv !== 'undefined' ? toNum(b.current_abv) :
    typeof b.abv_percent !== 'undefined' ? toNum(b.abv_percent) : 0
  const size =
    typeof b.size !== 'undefined' ? String(b.size) :
    typeof b.barrel_size !== 'undefined' ? String(b.barrel_size) :
    typeof b.capacity !== 'undefined' ? String(b.capacity) :
    typeof b.capacity_l !== 'undefined' ? String(b.capacity_l) : ''
  const fill =
    toIsoDateLike(b.date_filled_normalized) ||
    toIsoDateLike(b.date_filled) ||
    toIsoDateLike(b.fill_date) ||
    toIsoDateLike(b.filled_date) ||
    ''
  const loc =
    b.location_normalized || b.location || b.location_name || b.warehouse || ''

  const id =
    (typeof b.id === 'string' && b.id) ? b.id :
    (typeof b.barrel_id === 'string' && b.barrel_id) ? b.barrel_id :
    (typeof b.barrel_number === 'string' && b.barrel_number) ? b.barrel_number :
    String(b.id ?? '')

  return {
    id,
    barrelNumber: b.barrel_number || b.barrel_id || '',
    spiritType: b.spirit || b.spirit_type || '',
    prevSpirit: b.prev_spirit,
    barrelType: b.barrel || b.barrel_type || b.cask || b.cask_type || '',
    barrelSize: String(size).trim() === '0' ? '' : size,
    liters: volCurrent,
    fillDate: fill,
    location: loc,
    status: b.status || 'Aging',
    currentVolume: volCurrent,
    originalVolume: volOriginal,
    abv,
    notes: b.notes_comments || b.notes || '',
    batch: b.batch || b.batch_id || b.batch_code || b.batch_name || '',
    dateMature:
      toIsoDateLike(b.date_mature) ||
      toIsoDateLike(b.mature_date) ||
      toIsoDateLike(b.maturation_date) ||
      toIsoDateLike(b.date_maturation) ||
      '',
    tastingNotes: b.tasting_notes || b.tasting || '',
    angelsShare: (() => {
      const raw = (typeof b.angelsshare !== 'undefined'
        ? String(b.angelsshare)
        : (typeof b.angels_share !== 'undefined' ? String(b.angels_share) : '')
      ).trim()
      const lower = raw.toLowerCase()
      return raw && lower !== 'null' && lower !== 'undefined' ? raw : ''
    })(),
    lastInspection: toIsoDateLike(b.last_inspection) || toIsoDateLike(b.inspection_date) || '',
    organizationId: b.organization_id || '',
    createdBy: b.created_by || null,
    createdAt: toIsoDateLike(b.created_at) || '',
    updatedAt: toIsoDateLike(b.updated_at) || ''
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'all'
    const supabase = await createClient()
    const configured = process.env.NEXT_PUBLIC_BARRELS_TABLE || ''
    const candidates = [configured, 'tracking', 'barrels', 'barrel_tracking', 'barrels_tracking'].filter(Boolean)
    
    let rows: any[] = []
    let chosen = ''
    for (const tbl of candidates) {
      try {
        let q0 = supabase.from(tbl).select('*')
        if (status && status !== 'all') q0 = q0.eq('status', status)
        const { data: d0, error: e0 } = await q0.order('created_at', { ascending: false })
        if (!e0 && Array.isArray(d0) && d0.length > rows.length) {
          rows = d0
          chosen = tbl
        }
      } catch {}
    }
    if (!rows.length) {
      const fallback = 'tracking'
      let qf = supabase.from(fallback).select('*')
      if (status && status !== 'all') qf = qf.eq('status', status)
      const { data: df, error: ef } = await qf.order('created_at', { ascending: false })
      if (ef) {
        const emptyStats = {
          totalBarrels: 0,
          activeBarrels: 0,
          totalVolume: 0,
          averageAge: 0,
          byStatus: {},
          bySpiritType: {},
          byLocation: {}
        }
        return NextResponse.json({ barrels: [], stats: emptyStats, table: '', error: ef.message })
      }
      rows = df || []
      chosen = fallback
    }
    rows = rows.filter((b: any) => {
      const notes = String(b.notes_comments ?? b.notes ?? '').trim().toLowerCase()
      const id = String(b.id ?? b.barrel_id ?? b.barrel_number ?? '')
      if (notes === 'test barrel created via api') return false
      if (id === 'd357edcc-d588-4114-9a10-7c0881bc108c') return false
      return true
    })
    
    const barrels = rows.map(mapBarrel)
    const now = Date.now()
    const averageAge = barrels.length
      ? Math.round(
          barrels.reduce((acc, b) => {
            const t = toIsoDateLike(b.fillDate)
            const df = t ? new Date(t).getTime() : now
            return acc + Math.floor((now - df) / (1000 * 60 * 60 * 24))
          }, 0) / barrels.length
        )
      : 0
    const totalVolume = barrels.reduce((sum, b) => sum + (b.currentVolume || 0), 0)
    const byStatus = barrels.reduce((acc: Record<string, number>, b) => {
      const s = b.status || 'Aging'
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const bySpiritType = barrels.reduce((acc: Record<string, number>, b) => {
      const s = b.spiritType || ''
      if (!s) return acc
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const byLocation = barrels.reduce((acc: Record<string, number>, b) => {
      const raw = b.location || ''
      const s = raw ? (raw.toLowerCase().includes('warehouse') ? 'Warehouse' : raw) : 'Warehouse'
      if (!s) return acc
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  const stats = {
    totalBarrels: barrels.length,
    activeBarrels: barrels.filter(b => b.status !== 'Emptied').length,
    totalVolume,
    averageAge,
    byStatus,
    bySpiritType,
    byLocation
  }
  const enriched = barrels.map(b => {
    if (!b.angelsShare && (b.originalVolume || 0) > 0) {
      const loss = (b.originalVolume || 0) - (b.currentVolume || 0)
      const pct = ((loss / (b.originalVolume || 1)) * 100)
      const pctStr = Number.isFinite(pct) ? `${pct.toFixed(1)}%` : ''
      const lossStr = Number.isFinite(loss) ? `${loss.toFixed(1)} L` : ''
      const joined = [lossStr, pctStr].filter(Boolean).join(' ')
      return { ...b, angelsShare: joined }
    }
    return b
  })
  return NextResponse.json({ barrels: enriched, stats, table: chosen })
  } catch (e: any) {
    const emptyStats = {
      totalBarrels: 0,
      activeBarrels: 0,
      totalVolume: 0,
      averageAge: 0,
      byStatus: {},
      bySpiritType: {},
      byLocation: {}
    }
    return NextResponse.json({ barrels: [], stats: emptyStats, table: '', error: String(e?.message || 'Unknown error') }, { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const table = process.env.NEXT_PUBLIC_BARRELS_TABLE || 'tracking'
    const supabase = await createClient()
    if (body && body.purgeTest) {
      const patterns = ['Test barrel creation', 'Testing new ID structure', 'Test barrel created via API', 'Test barrel created via api']
      const { error } = await supabase.from(table).delete().or(
        patterns.map(p => `notes_comments.ilike.%${p}%`).join(',')
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Unsupported operation' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Unknown error') }, { status: 500 })
  }
}
