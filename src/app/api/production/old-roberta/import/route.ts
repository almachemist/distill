import { NextRequest, NextResponse } from 'next/server'
import { writeJson, readJson } from '@/lib/jsonStore'
import type { OldRobertaBatch, OldRobertaFile } from '@/modules/production/types/old-roberta.types'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
export const runtime = 'nodejs'

const STORE_PATH = 'data/old_roberta_distillations.json'

function isReadOnlyDeployment(): boolean {
  const v = String(process.env.VERCEL || '').toLowerCase()
  return v === '1' || v === 'true' || v === 'yes' || process.env.NODE_ENV === 'production'
}

function normalizePayload(payload: any): OldRobertaFile {
  if (!payload) return { batches: [] }
  if (Array.isArray(payload)) return { batches: payload as OldRobertaBatch[] }
  if (payload.batches && Array.isArray(payload.batches)) return { batches: payload.batches as OldRobertaBatch[] }
  if (payload.old_roberta_batches && Array.isArray(payload.old_roberta_batches)) return { batches: payload.old_roberta_batches as OldRobertaBatch[] }
  if (payload.oldRobertaBatches && Array.isArray(payload.oldRobertaBatches)) return { batches: payload.oldRobertaBatches as OldRobertaBatch[] }
  return { batches: [] }
}

async function resolveOrganizationId() {
  if (process.env.NODE_ENV === 'development') {
    return '00000000-0000-0000-0000-000000000001'
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()
  return profile?.organization_id ?? null
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let parsed: any = null

    if (contentType.includes('application/json')) {
      parsed = await req.json()
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      if (!file) return NextResponse.json({ error: 'Missing file field' }, { status: 400 })
      const text = await file.text()
      parsed = JSON.parse(text)
    } else {
      // Try raw body as JSON
      const text = await req.text()
      parsed = text ? JSON.parse(text) : null
    }

    const incoming = normalizePayload(parsed)

    // Basic sanity pass: coerce types, compute hearts_lal if missing
    const cleaned: OldRobertaBatch[] = (incoming.batches || []).map((b: any) => {
      const hearts_volume_l = b.hearts_volume_l != null ? Number(b.hearts_volume_l) : null
      const hearts_abv_percent = b.hearts_abv_percent != null ? Number(b.hearts_abv_percent) : null
      let hearts_lal = b.hearts_lal != null ? Number(b.hearts_lal) : null
      if ((hearts_lal == null || Number.isNaN(hearts_lal)) && hearts_volume_l != null && hearts_abv_percent != null) {
        hearts_lal = Number((hearts_volume_l * (hearts_abv_percent / 100)).toFixed(3))
      }
      return {
        batch_id: String(b.batch_id || b.id || '').trim(),
        product_type: (b.product_type || 'Other') as any,
        fermentation_date: b.fermentation_date ?? null,
        distillation_date: b.distillation_date ?? b.date ?? null,
        still_used: b.still_used ?? 'Roberta (simple pot still)',
        wash_volume_l: b.wash_volume_l != null ? Number(b.wash_volume_l) : null,
        wash_abv_percent: b.wash_abv_percent != null ? Number(b.wash_abv_percent) : null,
        charge_l: b.charge_l != null ? Number(b.charge_l) : null,
        hearts_volume_l,
        hearts_abv_percent,
        hearts_lal,
        heads_volume_l: b.heads_volume_l != null ? Number(b.heads_volume_l) : null,
        tails_volume_l: b.tails_volume_l != null ? Number(b.tails_volume_l) : null,
        notes: b.notes ?? null,
      }
    }).filter(b => b.batch_id)

    // Attempt to persist to Supabase as source of truth
    try {
      const supabase = createServiceRoleClient()
      const orgId = await resolveOrganizationId()
      if (orgId) {
        const rows = cleaned.map(b => ({
          organization_id: orgId,
          batch_id: b.batch_id,
          product_type: b.product_type,
          fermentation_date: b.fermentation_date,
          distillation_date: b.distillation_date,
          still_used: b.still_used,
          wash_volume_l: b.wash_volume_l,
          wash_abv_percent: b.wash_abv_percent,
          charge_l: b.charge_l,
          hearts_volume_l: b.hearts_volume_l,
          hearts_abv_percent: b.hearts_abv_percent,
          hearts_lal: b.hearts_lal,
          heads_volume_l: b.heads_volume_l,
          tails_volume_l: b.tails_volume_l,
          notes: b.notes,
        }))
        const { error } = await supabase
          .from('old_roberta_batches')
          .upsert(rows, { onConflict: 'organization_id,batch_id' })
        if (error) {
          console.warn('Supabase upsert failed for old_roberta_batches:', error)
        }
      }
    } catch (e) {
      // Table may not exist yet or RLS/auth may block; continue with JSON write-through
      console.warn('Supabase old_roberta upsert skipped:', e)
    }

    // Also write-through to local JSON for offline/dev use and easy export
    if (!isReadOnlyDeployment()) {
      const existing = await readJson<OldRobertaFile>(STORE_PATH, { batches: [] })
      // Deduplicate by batch_id (new entries override existing on same id)
      const byId = new Map<string, OldRobertaBatch>()
      for (const b of existing.batches) byId.set(b.batch_id, b)
      for (const b of cleaned) byId.set(b.batch_id, b)
      const merged: OldRobertaFile = { batches: Array.from(byId.values()) }
      await writeJson(STORE_PATH, merged)
      return NextResponse.json({ ok: true, imported: cleaned.length, total: merged.batches.length })
    }
    return NextResponse.json({ ok: true, imported: cleaned.length, total: cleaned.length })
  } catch (err: any) {
    console.error('Old Roberta import failed:', err)
    return NextResponse.json({ error: err?.message || 'Failed to import' }, { status: 400 })
  }
}
