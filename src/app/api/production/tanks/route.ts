import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'

function toNum(v: any) {
  const n = parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : 0
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('tanks')
      .select('*')
      .order('tank_id')

    if (error) {
      return NextResponse.json({ tanks: [], error: error.message }, { status: 200 })
    }

    const tanks = (data || []).map((t: any) => ({
      id: t.id,
      organization_id: t.organization_id || '',
      tank_id: t.tank_id || '',
      tank_name: t.tank_name || t.name || '',
      name: t.tank_name || t.name || '',
      tank_type: t.tank_type || t.type || 'spirits',
      type: t.type || null,
      capacity_l: toNum(t.capacity_l ?? t.capacity),
      capacity: toNum(t.capacity_l ?? t.capacity),
      has_lid: typeof t.has_lid === 'boolean' ? t.has_lid : undefined,
      product: t.product ?? null,
      current_abv: t.current_abv ?? t.abv ?? null,
      abv: t.current_abv ?? t.abv ?? null,
      current_volume_l: t.current_volume_l ?? t.volume ?? null,
      volume: t.current_volume_l ?? t.volume ?? null,
      status: t.status || 'empty',
      notes: t.notes ?? null,
      batch_id: t.batch_id || '',
      batch: t.batch ?? null,
      infusion_type: t.infusion_type ?? null,
      extra_materials: t.extra_materials ?? null,
      started_on: t.started_on ?? null,
      expected_completion: t.expected_completion ?? null,
      location: t.location ?? null,
      last_updated_by: t.last_updated_by ?? null,
      created_at: t.created_at || '',
      updated_at: t.updated_at || ''
    }))

    return NextResponse.json({ tanks })
  } catch (e: any) {
    return NextResponse.json({ tanks: [], error: String(e?.message || 'Unknown error') }, { status: 200 })
  }
}

