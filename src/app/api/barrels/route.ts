import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'

function toNum(v: any) {
  const n = parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : 0
}

function parseDateLike(v: any) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  const t = new Date(s).getTime()
  return Number.isFinite(t) ? new Date(t).toISOString() : ''
}

function mapBarrel(b: any) {
  const vol =
    typeof b.volume_l !== 'undefined' ? toNum(b.volume_l) :
    typeof b.liters !== 'undefined' ? toNum(b.liters) :
    toNum(b.volume)
  const abv =
    typeof b.abv !== 'undefined' ? toNum(b.abv) :
    typeof b.strength !== 'undefined' ? toNum(b.strength) : 0
  const size =
    typeof b.size !== 'undefined' ? String(b.size) :
    typeof b.barrel_size !== 'undefined' ? String(b.barrel_size) : ''
  const fill =
    b.date_filled_normalized || b.date_filled || b.fill_date || b.filled_date || ''
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
    originalVolume: vol,
    abv,
    notes: b.notes_comments || b.notes || '',
    organizationId: b.organization_id || '',
    createdBy: b.created_by || null,
    createdAt: b.created_at || '',
    updatedAt: b.updated_at || ''
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'all'
    const supabase = createServiceRoleClient()
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
    
    const barrels = rows.map(mapBarrel)
    const now = Date.now()
    const averageAge = barrels.length
      ? Math.round(
          barrels.reduce((acc, b) => {
            const t = parseDateLike(b.fillDate)
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
    return NextResponse.json({ barrels, stats, table: chosen })
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
    const supabase = createServiceRoleClient()
    if (body && body.purgeTest) {
      const patterns = ['Test barrel creation', 'Testing new ID structure']
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
