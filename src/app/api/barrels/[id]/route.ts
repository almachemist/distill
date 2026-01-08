import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'

function toNum(v: any) {
  const n = parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : 0
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
    batch: b.batch || '',
    dateMature: b.date_mature || '',
    tastingNotes: b.tasting_notes || '',
    angelsShare: b.angelsshare || '',
    lastInspection: b.last_inspection || '',
    organizationId: b.organization_id || '',
    createdBy: b.created_by || null,
    createdAt: b.created_at || '',
    updatedAt: b.updated_at || ''
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceRoleClient()
    const { id: rawId } = await params
    const id = decodeURIComponent(rawId)
    const configured = process.env.NEXT_PUBLIC_BARRELS_TABLE || ''
    const candidates = [configured, 'tracking', 'barrels', 'barrel_tracking', 'barrels_tracking'].filter(Boolean)

    let record: any = null
    let chosen = ''

    for (const tbl of candidates) {
      const { record: r } = await findRecordByKeys(supabase, tbl, id)
      if (r) {
        record = r
        chosen = tbl
        break
      }
    }

    if (!record) {
      const fallback = 'tracking'
      const { record: r } = await findRecordByKeys(supabase, fallback, id)
      if (r) {
        record = r
        chosen = fallback
      }
    }

    if (!record) {
      return NextResponse.json({ error: 'Barrel not found' }, { status: 404 })
    }

    const barrel = mapBarrel(record)
    return NextResponse.json({ barrel, table: chosen })
  } catch (e: any) {
    return NextResponse.json({ barrel: null, error: String(e?.message || 'Unknown error') }, { status: 200 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceRoleClient()
    const { id: rawId } = await params
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
