import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TABLE = process.env.SUPABASE_BARRELS_TABLE || 'tracking'

type BarrelRow = {
  id: string
  barrel_number: string
  spirit: string | null
  prev_spirit: string | null
  barrel: string | null
  volume: string | null
  date_filled: string | null
  location: string | null
  status: string | null
  abv: string | null
  notes_comments: string | null
  organization_id: string | null
  created_at: string | null
  updated_at: string | null
}

export async function GET(req: Request) {
  try {
    const url = (() => {
      try {
        return new URL(req.url)
      } catch {
        return new URL(req.url, 'http://localhost')
      }
    })()
    const tableParam = url.searchParams.get('table') || undefined
    const table = process.env.NODE_ENV === 'development' && tableParam ? tableParam : TABLE
    const status = url.searchParams.get('status') || undefined
    const spiritType = url.searchParams.get('spiritType') || undefined
    const location = url.searchParams.get('location') || undefined
    const barrelType = url.searchParams.get('barrelType') || undefined
    const fillDateFrom = url.searchParams.get('fillDateFrom') || undefined
    const fillDateTo = url.searchParams.get('fillDateTo') || undefined

    const supabase = createServiceRoleClient()
    let chosenTable = table
    if (!tableParam) {
      const base = [table, 'tracking', 'barrels', 'barrel_tracking', 'oak_tracking', 'cask_tracking', 'casks', 'barrels_view', 'barrels_data']
      const seen = new Set<string>()
      const candidates = base.filter(t => {
        if (!t) return false
        if (seen.has(t)) return false
        seen.add(t)
        return true
      })
      let bestCount = -1
      for (const t of candidates) {
        const res = await supabase.from(t).select('*', { count: 'exact', head: true })
        if (!res.error && typeof res.count === 'number' && res.count > bestCount) {
          bestCount = res.count
          chosenTable = t
        }
      }
    }
    let query = supabase.from(chosenTable).select('*')
    if (status) query = query.eq('status', status)
    if (spiritType) query = query.eq('spirit', spiritType)
    if (location) query = query.eq('location', location)
    if (barrelType) query = query.eq('barrel', barrelType)
    if (fillDateFrom) query = query.gte('date_filled', fillDateFrom)
    if (fillDateTo) query = query.lte('date_filled', fillDateTo)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    const barrels = (data || []) as BarrelRow[]
    const normalizeDate = (s: any) => {
      const v = typeof s === 'string' ? s.trim() : ''
      if (!v) return null
      if (v.includes('/')) {
        const p = v.split('/')
        if (p.length >= 3) {
          const dd = parseInt(p[0], 10)
          const mm = parseInt(p[1], 10)
          const yy = parseInt(p[2], 10)
          if (Number.isFinite(dd) && Number.isFinite(mm) && Number.isFinite(yy) && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
            const d = new Date(yy, mm - 1, dd)
            if (Number.isFinite(d.getTime())) return d.toISOString().slice(0,10)
          }
        }
      }
      const t = new Date(v).getTime()
      if (!Number.isFinite(t)) return null
      return new Date(t).toISOString().slice(0,10)
    }
    const normalizeLocation = (s: any) => {
      const v = typeof s === 'string' ? s.trim() : ''
      if (!v) return 'Warehouse'
      const lower = v.toLowerCase()
      if (lower.includes('warehouse')) return 'Warehouse'
      return v
    }
    const normalized = barrels.map((b: any) => ({
      ...b,
      date_filled_normalized: normalizeDate(b.date_filled || (b as any).fill_date || (b as any).filled_date || null),
      location_normalized: normalizeLocation((b as any).location || (b as any).location_name || '')
    }))

    const stats = {
      totalBarrels: normalized.length,
      activeBarrels: normalized.filter(b => (b.status || 'Aging') !== 'Emptied').length,
      totalVolume: normalized.reduce((sum, b) => {
        const v =
          typeof (b as any).volume_l !== 'undefined' ? parseFloat(String((b as any).volume_l)) :
          typeof (b as any).liters !== 'undefined' ? parseFloat(String((b as any).liters)) :
          parseFloat(String((b as any).volume || '0'))
        return sum + (Number.isFinite(v) ? v : 0)
      }, 0),
      averageAge: (() => {
        if (normalized.length === 0) return 0
        const now = Date.now()
        const ages = normalized.map(b => {
          const s: any = (b as any).date_filled_normalized || (b as any).date_filled || (b as any).fill_date || (b as any).filled_date || null
          const df = s ? new Date(String(s)).getTime() : NaN
          const t = Number.isFinite(df) ? df : now
          return Math.floor((now - t) / (1000 * 60 * 60 * 24))
        })
        return Math.round(ages.reduce((a, v) => a + v, 0) / normalized.length)
      })(),
      byStatus: normalized.reduce<Record<string, number>>((acc, b) => {
        const s = (b as any).status || 'Aging'
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {}),
      bySpiritType: normalized.reduce<Record<string, number>>((acc, b) => {
        const s = (b as any).spirit || ''
        if (!s) return acc
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {}),
      byLocation: normalized.reduce<Record<string, number>>((acc, b) => {
        const s = (b as any).location_normalized || (b as any).location || (b as any).location_name || ''
        if (!s) return acc
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {}),
    }

    return NextResponse.json({
      barrels: normalized,
      stats,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load barrels' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createServiceRoleClient()
    const organizationId =
      process.env.NODE_ENV === 'development'
        ? '00000000-0000-0000-0000-000000000001'
        : body.organizationId || body.organization_id || '00000000-0000-0000-0000-000000000001'

    const insertPayload = {
      barrel_number: body.barrelNumber,
      organization_id: organizationId,
      spirit: body.spiritType,
      prev_spirit: body.prevSpirit || null,
      barrel: body.barrelType,
      volume: String(body.currentVolume ?? body.volume ?? 0),
      date_filled: body.fillDate,
      location: body.location,
      abv: String(body.abv ?? 0),
      notes_comments: body.notes || null,
      status: 'Aging',
      created_by: body.created_by ?? null,
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mapped = {
      id: data.id,
      barrelNumber: data.barrel_number,
      spiritType: data.spirit || '',
      prevSpirit: data.prev_spirit,
      barrelType: data.barrel || '',
      barrelSize: '',
      liters: parseFloat(data.volume || '0') || 0,
      fillDate: data.date_filled,
      location: data.location || '',
      status: data.status || 'Aging',
      currentVolume: parseFloat(data.volume || '0') || 0,
      originalVolume: parseFloat(data.volume || '0') || 0,
      abv: parseFloat(data.abv || '0') || 0,
      notes: data.notes_comments || '',
      organizationId: data.organization_id || '',
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || '',
    }

    return NextResponse.json(mapped, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create barrel' }, { status: 500 })
  }
}
