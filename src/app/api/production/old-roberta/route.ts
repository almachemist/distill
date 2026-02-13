import { NextResponse } from 'next/server'
import { readJson } from '@/lib/jsonStore'
import type { OldRobertaFile } from '@/modules/production/types/old-roberta.types'
import { requireAuth } from '@/lib/api/auth'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'

const STORE_PATH = 'data/old_roberta_distillations.json'

async function resolveOrganizationId(): Promise<string | null> {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return null
    return auth.organizationId
  } catch {
    return null
  }
}

export async function GET() {
  // Prefer Supabase when available; fall back to JSON file
  try {
    const supabase = createServiceRoleClient()
    const orgId = await resolveOrganizationId()
    const query = supabase
      .from('old_roberta_batches')
      .select('*')
      .order('distillation_date', { ascending: false })

    const { data, error } = orgId
      ? await query.eq('organization_id', orgId)
      : await query

    if (!error && Array.isArray(data)) {
      const mapped = data.map((d: any) => ({
        batch_id: d.batch_id,
        product_type: d.product_type,
        fermentation_date: d.fermentation_date,
        distillation_date: d.distillation_date,
        still_used: d.still_used,
        wash_volume_l: d.wash_volume_l,
        wash_abv_percent: d.wash_abv_percent,
        charge_l: d.charge_l,
        hearts_volume_l: d.hearts_volume_l,
        hearts_abv_percent: d.hearts_abv_percent,
        hearts_lal: d.hearts_lal,
        heads_volume_l: d.heads_volume_l,
        tails_volume_l: d.tails_volume_l,
        notes: d.notes,
      }))
      const res = NextResponse.json({ batches: mapped })
      res.headers.set('x-source', 'supabase')
      return res
    }
  } catch (e) {
    // Table may not exist yet or RLS/auth may block; silently fall back
  }

  const data = await readJson<OldRobertaFile>(STORE_PATH, { batches: [] })
  const res = NextResponse.json(data)
  res.headers.set('x-source', 'json')
  return res
}
