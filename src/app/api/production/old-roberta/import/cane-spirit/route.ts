import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { writeJson, readJson } from '@/lib/jsonStore'
import type { OldRobertaBatch, OldRobertaFile } from '@/modules/production/types/old-roberta.types'
import { requireAuth } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'
export const runtime = 'nodejs'

const STORE_PATH = 'data/old_roberta_distillations.json'
const REPO_CS_PATH = 'src/modules/production/data/old_cane_spirit.json'

function isReadOnlyDeployment(): boolean {
  const v = String(process.env.VERCEL || '').toLowerCase()
  return v === '1' || v === 'true' || v === 'yes' || process.env.NODE_ENV === 'production'
}

async function resolveOrganizationId(): Promise<string | null> {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return null
    return auth.organizationId
  } catch {
    return null
  }
}

function stripAndWrapObjectsToArray(text: string): any[] {
  const noBlock = text.replace(/\/\*[\s\S]*?\*\//g, '')
  const noLine = noBlock.replace(/(^|[^:])\/\/.*$/gm, '$1')
  const trimmed = noLine.trim()
  if (!trimmed) return []
  if (trimmed.startsWith('[')) {
    return JSON.parse(trimmed)
  }
  const joined = trimmed.replace(/}\s*{/g, '},{')
  const asArray = `[${joined}]`
  return JSON.parse(asArray)
}

function n(v: any): number | null {
  if (v === null || v === undefined || v === '') return null
  const num = Number(v)
  return Number.isFinite(num) ? num : null
}

function toOldRoberta(entry: any): OldRobertaBatch {
  const batch_id = String(entry.batch_id || entry.spirit_run_id || '').trim()
  const distillation_date = entry.date ?? entry.distillation_date ?? null
  const still_used = entry.still_used ?? entry.still ?? 'Roberta (simple pot still)'

  const hearts = entry.outputs?.hearts || {}
  const hv = n(hearts.volume_l ?? hearts.total_hearts_volume_l ?? hearts.total_volume_l)
  const habv = n(hearts.abv ?? hearts.abv_percent ?? hearts.combined_hearts_abv_percent)
  let hlal = n(hearts.lal ?? hearts.combined_hearts_lal)
  if ((hlal == null) && hv != null && habv != null) hlal = Number((hv * (habv / 100)).toFixed(3))

  const heads_volume_l = n(entry.outputs?.heads?.volume_l)
  const tails_volume_l = n(entry.outputs?.tails?.volume_l)
  const charge_l = n(entry.charge?.total_charge?.volume_l ?? entry.charge?.total_volume_l)

  return {
    batch_id,
    product_type: 'Cane Spirit',
    fermentation_date: null,
    distillation_date,
    still_used,
    wash_volume_l: null,
    wash_abv_percent: null,
    charge_l,
    hearts_volume_l: hv,
    hearts_abv_percent: habv,
    hearts_lal: hlal,
    heads_volume_l,
    tails_volume_l,
    notes: null,
  }
}

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), REPO_CS_PATH)
    const raw = await readFile(filePath, 'utf8')
    const objects = stripAndWrapObjectsToArray(raw)
    const cleaned: OldRobertaBatch[] = objects
      .map(toOldRoberta)
      .filter(b => b.batch_id)

    // Upsert to Supabase
    try {
      const supabase = await createClient()
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
        if (error) console.warn('Supabase upsert (cane) failed:', error)
      }
    } catch (e) {
      console.warn('Supabase upsert (cane) skipped:', e)
    }

    // Write-through to local store with dedupe by batch_id (skip on read-only deployments)
    if (!isReadOnlyDeployment()) {
      const existing = await readJson<OldRobertaFile>(STORE_PATH, { batches: [] })
      const byId = new Map<string, OldRobertaBatch>()
      for (const b of existing.batches) byId.set(b.batch_id, b)
      for (const b of cleaned) byId.set(b.batch_id, b)
      const merged: OldRobertaFile = { batches: Array.from(byId.values()) }
      await writeJson(STORE_PATH, merged)
      return NextResponse.json({ ok: true, imported: cleaned.length, total: merged.batches.length })
    }
    return NextResponse.json({ ok: true, imported: cleaned.length, total: cleaned.length })
  } catch (err: any) {
    console.error('Old Roberta cane spirit import failed:', err)
    return NextResponse.json({ error: err?.message || 'Failed to import old cane spirit' }, { status: 400 })
  }
}
