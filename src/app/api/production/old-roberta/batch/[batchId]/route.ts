import { NextResponse, NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'

function stripAndWrapObjectsToArray(text: string): any[] {
  const noBlock = text.replace(/\/\*[\s\S]*?\*\//g, '')
  const noLine = noBlock.replace(/(^|[^:])\/\/.*$/gm, '$1')
  const trimmed = noLine.trim()
  if (!trimmed) return []
  if (trimmed.startsWith('[')) return JSON.parse(trimmed)
  const joined = trimmed.replace(/}\s*{/g, '},{')
  return JSON.parse(`[${joined}]`)
}

async function resolveOrganizationId() {
  if (process.env.NODE_ENV === 'development') {
    return '00000000-0000-0000-0000-000000000001'
  }
  // In production we could resolve via user session, but this endpoint is server-side only
  return null
}

export async function GET(req: NextRequest, context: RouteContext<"/api/production/old-roberta/batch/[batchId]">) {
  const { batchId } = await context.params
  const id = decodeURIComponent(batchId)
  const supabase = createServiceRoleClient()
  const orgId = await resolveOrganizationId()

  // 1) Fetch summary from Supabase
  let summary: any = null
  try {
    const q = supabase.from('old_roberta_batches').select('*').eq('batch_id', id)
    const { data, error } = orgId ? await q.eq('organization_id', orgId) : await q
    if (!error && Array.isArray(data) && data.length > 0) {
      const d = data[0]
      summary = {
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
      }
    }
  } catch {}

  // 2) Try to load raw record from repo JSON files
  let raw: any = null
  let rawSource: 'none' | 'cane' | 'rum' = 'none'
  const tryFindIn = async (rel: string): Promise<any | null> => {
    try {
      const p = path.join(process.cwd(), rel)
      const txt = await readFile(p, 'utf8')
      const arr = stripAndWrapObjectsToArray(txt)
      return arr.find((o: any) => String(o.batch_id) === id) || null
    } catch {
      return null
    }
  }
  raw = await tryFindIn('src/modules/production/data/old_cane_spirit.json')
  if (raw) rawSource = 'cane'
  if (!raw) {
    raw = await tryFindIn('src/modules/production/data/old_rum.json')
    if (raw) rawSource = 'rum'
  }

  if (!summary && !raw) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const res = NextResponse.json({ summary, raw })
  res.headers.set('x-source', summary ? 'supabase' : 'none')
  res.headers.set('x-raw-source', rawSource)
  return res
}
