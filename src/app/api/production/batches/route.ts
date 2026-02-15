import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { GinBatchSummary, RumBatchSummary } from "@/modules/production/types/batch-summary.types"

type GinApiRecord = GinBatchSummary
type RumApiRecord = RumBatchSummary

export const runtime = 'nodejs'

function toNum(v: any): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return v
  const m = String(v).match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

function normalizeRumBatchId(id: any): string {
  const raw = String(id ?? '').trim()
  if (!raw) return raw
  const m = raw.match(/^(RUM)-(\d{2})-(\d+)$/i)
  if (!m) return raw
  const prefix = m[1].toUpperCase()
  const year = m[2]
  const n = m[3].padStart(3, '0')
  return `${prefix}-${year}-${n}`
}

export async function GET() {
  let gin: GinApiRecord[] = []
  let rum: RumApiRecord[] = []

  try {
    const supabase = await createClient()

    // Fetch both historical batches (distillation_runs) AND draft batches (production_batches)
    const [ginHistoricalResult, ginDraftResult, rumResult] = await Promise.allSettled([
      // Historical gin batches (completed, finalized)
      supabase
        .from("distillation_runs")
        .select("*")
        .order("date", { ascending: false }),
      // Draft gin batches (draft, in_progress) - production_batches schema: id, type, still, data, created_at, updated_at
      supabase
        .from("production_batches")
        .select("*")
        .eq("type", "gin")
        .order("updated_at", { ascending: false }),
      // Rum batches
      supabase
        .from("rum_production_runs")
        .select("*")
        .order("distillation_date", { ascending: false })
    ])

    // Combine historical and draft gin batches
    const historicalGin = (ginHistoricalResult.status === 'fulfilled' && !ginHistoricalResult.value.error && Array.isArray(ginHistoricalResult.value.data))
      ? ginHistoricalResult.value.data.map((batch: any) => ({
          run_id: batch.batch_id,
          recipe: batch.display_name,
          date: batch.date,
          still_used: batch.still_used,
          updated_at: batch.updated_at,
          status: batch.status || 'completed',
          ...batch
        }))
      : []

    const draftGin = (ginDraftResult.status === 'fulfilled' && !ginDraftResult.value.error && Array.isArray(ginDraftResult.value.data))
      ? ginDraftResult.value.data.map((batch: any) => ({
          run_id: batch?.data?.spiritRunId || batch.id,
          recipe: batch?.data?.sku || batch?.data?.recipeName || null,
          date: batch?.data?.date || null,
          still_used: batch.still || null,
          updated_at: batch.updated_at || null,
          status: batch?.data?.status || 'draft',
          ...batch?.data,
          id: batch.id,
        }))
      : []

    // Merge and sort by date — use only DB results (no static fallback)
    gin = [...historicalGin, ...draftGin].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    }) as GinApiRecord[]

    // Build rum list from dedicated table plus cane spirit runs from distillation_runs
    const rumFromTable: any[] = (rumResult.status === 'fulfilled' && !rumResult.value.error && Array.isArray(rumResult.value.data))
      ? rumResult.value.data
      : []

    // Select Cane Spirit runs from distillation_runs
    const caneSpiritRuns = (ginHistoricalResult.status === 'fulfilled' && !ginHistoricalResult.value.error && Array.isArray(ginHistoricalResult.value.data))
      ? (ginHistoricalResult.value.data as any[]).filter((row: any) => {
          const name = (row.display_name || row.sku || '').toLowerCase()
          return name.includes('cane spirit') || name.includes('cane')
        }).map((row: any) => ({
          batch_id: row.batch_id,
          product_name: row.display_name || row.sku || 'Cane Spirit',
          product_type: 'cane_spirit',
          status: 'completed',
          still_used: row.still_used || null,
          fermentation_start_date: null,
          distillation_date: row.date || null,
          hearts_volume_l: row.hearts_volume_l ?? null,
          hearts_abv_percent: row.hearts_abv_percent ?? null,
          hearts_lal: row.hearts_lal ?? (
            row.hearts_volume_l != null && row.hearts_abv_percent != null
              ? Number((row.hearts_volume_l * (row.hearts_abv_percent / 100)).toFixed(3))
              : null
          ),
          fill_date: null,
          cask_number: null
        }))
      : []

    const coalesce = <T>(primary: T | null | undefined, fallback: T | null | undefined): T | null => {
      const isEmpty = (value: any) =>
        value === null ||
        value === undefined ||
        (typeof value === 'number' && (Number.isNaN(value) || value === 0)) ||
        (typeof value === 'string' && value.trim() === '')
      if (!isEmpty(primary)) return (primary ?? null) as T | null
      if (!isEmpty(fallback)) return (fallback ?? null) as T | null
      return null
    }

    const mergeRumSummary = (base: any, incoming: any) => {
      const merged = { ...base }
      merged.batch_id = normalizeRumBatchId(base.batch_id ?? incoming.batch_id)
      merged.product_name = coalesce(base.product_name, incoming.product_name)
      merged.product_type = coalesce(base.product_type, incoming.product_type)
      merged.status = coalesce(base.status, incoming.status)
      merged.still_used = coalesce(base.still_used, incoming.still_used)
      merged.fermentation_start_date = coalesce(base.fermentation_start_date, incoming.fermentation_start_date)
      merged.distillation_date = coalesce(base.distillation_date, incoming.distillation_date)

      const heartsVolume = coalesce(base.hearts_volume_l, incoming.hearts_volume_l)
      const heartsLal = coalesce(base.hearts_lal, incoming.hearts_lal)
      const heartsAbv = coalesce(base.hearts_abv_percent, incoming.hearts_abv_percent)

      merged.hearts_volume_l = heartsVolume
      merged.hearts_lal = heartsLal
      merged.hearts_abv_percent = heartsAbv ?? (
        heartsVolume != null && heartsVolume > 0 && heartsLal != null
          ? Number(((heartsLal / heartsVolume) * 100).toFixed(3))
          : null
      )
      if ((merged.hearts_lal == null || merged.hearts_lal === 0) && merged.hearts_volume_l != null && merged.hearts_abv_percent != null) {
        merged.hearts_lal = Number((merged.hearts_volume_l * (merged.hearts_abv_percent / 100)).toFixed(3))
      }

      merged.fill_date = coalesce(base.fill_date, incoming.fill_date)
      merged.cask_number = coalesce(base.cask_number, incoming.cask_number)

      return merged
    }

    const rumMap = new Map<string, any>()
    for (const row of rumFromTable) {
      if (!row?.batch_id) continue
      const key = normalizeRumBatchId(row.batch_id)
      rumMap.set(key, { ...row, batch_id: key })
    }

    for (const row of caneSpiritRuns) {
      if (!row?.batch_id) continue
      const key = normalizeRumBatchId(row.batch_id)
      const existing = rumMap.get(key)
      if (!existing) {
        rumMap.set(key, { ...row, batch_id: key })
        continue
      }
      const merged = mergeRumSummary(existing, row)
      rumMap.set(key, merged)
    }

    const combinedRum = Array.from(rumMap.values())

    rum = combinedRum
      .sort((a: any, b: any) => {
        const da = a.distillation_date ? new Date(a.distillation_date).getTime() : 0
        const db = b.distillation_date ? new Date(b.distillation_date).getTime() : 0
        return db - da
      }) as RumApiRecord[]
  } catch (error) {
    console.warn("⚠️ Supabase query failed, returning empty dataset:", (error as any)?.message || error)
  }

  return NextResponse.json({ gin, rum })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const obj = await request.json()
    const id = String(obj?.run_id || obj?.batch_id || '').trim()
    const name = String(obj?.sku || obj?.display_name || obj?.recipe || obj?.meta?.sku || '').trim() || 'Gin'
    const still = String(obj?.still_used || obj?.meta?.still_used || '').trim() || 'Roberta'
    const rawDate = String(obj?.date || obj?.meta?.date || obj?.meta?.run_date || obj?.distillation?.run_date || '').trim()
    const hearts = obj?.distillation?.cuts?.hearts || {}
    let hv = toNum(hearts?.volume_l ?? hearts?.volume_L) ?? null
    let hlal = toNum(hearts?.lal ?? hearts?.LAL) ?? null
    let habv = hv != null && hv > 0 && hlal != null ? Number(((hlal / hv) * 100).toFixed(1)) : toNum(hearts?.abv_percent) ?? null
    if (hv == null || habv == null || hlal == null) {
      const finalVol =
        toNum(obj?.final_output?.volume_l ?? obj?.final_output?.volume_L) ??
        toNum(obj?.dilution?.final_output_L) ??
        toNum(obj?.dilution?.final_output?.volume_l ?? obj?.dilution?.final_output?.volume_L) ??
        null
      const finalVolAbv =
        toNum(obj?.final_output?.abv_percent ?? obj?.final_output?.target_abv_percent) ??
        toNum(obj?.dilution?.final_abv_percent ?? obj?.dilution?.final_output?.abv_percent ?? obj?.dilution?.final_output?.final_abv_percent) ??
        null
      if (hv == null && finalVol != null) hv = finalVol
      if (habv == null && finalVolAbv != null) habv = finalVolAbv
      if (hlal == null && hv != null && habv != null) hlal = Number((hv * (habv / 100)).toFixed(3))
      const dilList = Array.isArray(obj?.dilution)
        ? obj?.dilution
        : Array.isArray(obj?.dilution?.timeline)
          ? obj?.dilution?.timeline
          : Array.isArray(obj?.dilution?.steps)
            ? obj?.dilution?.steps
            : []
      const dilStep = Array.isArray(dilList) && dilList.length > 0 ? dilList[dilList.length - 1] : null
      const dilVol = toNum(dilStep?.new_volume_l ?? dilStep?.new_volume_L ?? dilStep?.final_volume_l ?? dilStep?.final_volume_L ?? dilStep?.new_make_l ?? dilStep?.new_make_L)
      const dilAbv = toNum(dilStep?.final_abv_percent ?? dilStep?.abv_percent ?? dilStep?.target_abv_percent)
      if (hv == null && dilVol != null) hv = dilVol
      if (habv == null && dilAbv != null) habv = dilAbv
      if (hlal == null && hv != null && habv != null) hlal = Number((hv * (habv / 100)).toFixed(3))
    }
    const charge = obj?.charge?.total_charge || obj?.charge?.total || null
    const chargeVol = toNum(charge?.volume_l ?? charge?.volume_L)
    const chargeABV = toNum(charge?.abv_percent ?? charge?.boiler_abv_percent)
    const chargeLAL = toNum(charge?.lal ?? charge?.boiler_LAL) ?? (chargeVol != null && chargeABV != null ? Number((chargeVol * (chargeABV / 100)).toFixed(1)) : null)
    const parseDate = (s: string): string => {
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      if (!m) return s
      const d = m[1].padStart(2, '0')
      const M = m[2].padStart(2, '0')
      const Y = m[3]
      return `${Y}-${M}-${d}`
    }
    const dbRecord: any = {
      batch_id: id,
      date: parseDate(rawDate),
      display_name: name,
      sku: name,
      still_used: still,
      hearts_volume_l: hv,
      hearts_abv_percent: habv,
      hearts_lal: hlal,
      charge_total_volume_l: chargeVol,
      charge_total_abv_percent: chargeABV,
      charge_total_lal: chargeLAL,
      botanicals: Array.isArray(obj?.botanicals) ? obj.botanicals : null,
      charge_components: obj?.charge || null,
      dilution_steps: Array.isArray(obj?.dilution) ? obj?.dilution : (Array.isArray(obj?.dilution?.timeline) ? obj?.dilution?.timeline : null),
      boiler_on_time: obj?.meta?.boiler_on_time || null,
      heating_elements: obj?.charge?.elements || obj?.distillation?.elements?.boiler || null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      created_by: 'system'
    }
    const { data: existing } = await supabase
      .from('distillation_runs')
      .select('id')
      .eq('batch_id', id)
      .maybeSingle()
    let result
    if (existing && existing.id) {
      result = await supabase
        .from('distillation_runs')
        .update(dbRecord)
        .eq('batch_id', id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('distillation_runs')
        .insert(dbRecord)
        .select()
        .single()
    }
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, record: result.data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to upsert gin batch' }, { status: 500 })
  }
}
