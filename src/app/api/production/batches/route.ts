import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/serviceRole"
import {
  buildGinBatchFallback,
  buildRumBatchFallback,
  type GinBatchSummary,
  type RumBatchSummary
} from "@/modules/production/services/batch-fallback.service"

type GinApiRecord = GinBatchSummary
type RumApiRecord = RumBatchSummary

const FALLBACK_RESPONSE = {
  gin: buildGinBatchFallback(),
  rum: buildRumBatchFallback()
}

export const runtime = 'nodejs'

function sanitizeLooseJson(s: string): string {
  return s
    .replace(/\uFEFF/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\u200B/g, '')
    .replace(/("[^"]+"\\s*:\\s*(?:"[^"]*"|[0-9.+-eE]+)\\s*)("[^"]+"\\s*:)/g, '$1,$2')
    .replace(/,(\s*[}\]])/g, '$1')
}

function readLooseJsonObjects(relPath: string): any[] {
  try {
    let text = readFileSync(join(process.cwd(), relPath), 'utf-8')
    text = sanitizeLooseJson(text)
    const out: any[] = []
    let buf = ''
    let depth = 0
    let inString = false
    let esc = false
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      buf += ch
      if (inString) {
        if (esc) {
          esc = false
        } else if (ch === '\\') {
          esc = true
        } else if (ch === '"') {
          inString = false
        }
      } else {
        if (ch === '"') inString = true
        else if (ch === '{') depth++
        else if (ch === '}') {
          depth--
          if (depth === 0) {
            const s = buf.trim()
            if (s) {
              try {
                out.push(JSON.parse(sanitizeLooseJson(s)))
              } catch {
                const recovered = s
                  .replace(/[^\S\r\n]+/g, ' ')
                  .replace(/,(\s*[}\]])/g, '$1')
                try {
                  out.push(JSON.parse(recovered))
                } catch {
                  const ridMatch = s.match(/"run_id"\s*:\s*"([^"]+)"/)
                  const skuMatch = s.match(/"sku"\s*:\s*"([^"]+)"/)
                  const dateMatch = s.match(/"date"\s*:\s*"([^"]+)"/)
                  const stillMatch = s.match(/"still_used"\s*:\s*"([^"]+)"/)
                  const num = (m: RegExpMatchArray | null) => {
                    if (!m) return null
                    const v = m[1]
                    const n = Number(v)
                    return isNaN(n) ? null : n
                  }
                  const hvMatch = s.match(/"hearts"\s*:\s*\{[\s\S]*?"volume_l"\s*:\s*([0-9.]+)/i)
                  const habvMatch = s.match(/"hearts"[\s\S]*?"abv_percent"\s*:\s*([0-9.]+)/i)
                  const hlalMatch = s.match(/"hearts"[\s\S]*?"lal"\s*:\s*([0-9.]+)/i)
                  const chargeVolMatch = s.match(/"total_charge"[\s\S]*?"volume_l"\s*:\s*([0-9.]+)/i)
                  const chargeAbvMatch = s.match(/"total_charge"[\s\S]*?"abv_percent"\s*:\s*([0-9.]+)/i)
                  const chargeLalMatch = s.match(/"total_charge"[\s\S]*?"lal"\s*:\s*([0-9.]+)/i)
                  if (ridMatch) {
                    const hv = num(hvMatch)
                    const habv = num(habvMatch)
                    let hlal = num(hlalMatch)
                    if ((hlal == null || hlal === 0) && hv != null && habv != null) {
                      hlal = Number((hv * (habv / 100)).toFixed(3))
                    }
                    const chargeVol = num(chargeVolMatch)
                    const chargeAbv = num(chargeAbvMatch)
                    let chargeLal = num(chargeLalMatch)
                    if ((chargeLal == null || chargeLal === 0) && chargeVol != null && chargeAbv != null) {
                      chargeLal = Number((chargeVol * (chargeAbv / 100)).toFixed(1))
                    }
                    out.push({
                      run_id: ridMatch[1],
                      sku: skuMatch ? skuMatch[1] : null,
                      date: dateMatch ? dateMatch[1] : null,
                      still_used: stillMatch ? stillMatch[1] : null,
                      hearts_volume_l: hv ?? null,
                      hearts_abv_percent: habv ?? null,
                      hearts_lal: hlal ?? null,
                      charge_total_volume_l: chargeVol ?? null,
                      charge_total_abv_percent: chargeAbv ?? null,
                      charge_total_lal: chargeLal ?? null,
                      status: 'completed'
                    })
                  }
                }
              }
            }
            buf = ''
          }
        }
      }
    }
    return out
  } catch {
    return []
  }
}

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

function summarizeGin(obj: any): GinApiRecord {
  const heartsObj =
    obj?.totals?.output?.hearts ||
    obj?.totals?.total_output?.hearts ||
    obj?.hearts ||
    null
  let hv = toNum(obj?.hearts_volume_l) ?? toNum(heartsObj?.volume_l) ?? toNum((heartsObj as any)?.approx_volume_l)
  let habv = toNum(obj?.hearts_abv_percent) ?? toNum(heartsObj?.abv_percent)
  let hlal = toNum(obj?.hearts_lal) ?? toNum(heartsObj?.lal)
  const distHearts = obj?.distillation?.cuts?.hearts || null
  const hvDist = toNum(distHearts?.volume_l ?? distHearts?.volume_L ?? distHearts?.cut1_volume_L) ?? toNum(obj?.distillation?.hearts_total ?? obj?.distillation?.total_run_L)
  const habvDist = toNum(distHearts?.abv_percent ?? distHearts?.target_abv_percent)
  const hlalDist = toNum(distHearts?.lal ?? distHearts?.LAL)
  if (hv == null || hv === 0) hv = hvDist ?? hv
  if (habv == null || habv === 0) habv = habvDist ?? habv
  if (hlal == null) hlal = hlalDist ?? hlal
  const cutsSegs = Array.isArray(obj?.cuts?.hearts_segments) ? obj.cuts.hearts_segments : []
  const phaseSegs = Array.isArray(obj?.phase_outputs) ? obj.phase_outputs.filter((p: any) => String(p?.phase || '').toLowerCase().includes('hearts')) : []
  const botSegs = Array.isArray(obj?.botanicals)
    ? (obj.botanicals as any[])
        .filter((b: any) => {
          const p = String(b?.phase || '').toLowerCase()
          return p.includes('hearts') || p.includes('middle run')
        })
        .map((b: any) => ({
          volume_l: toNum(b?.volume_l ?? b?.volume_L),
          abv_percent: toNum(b?.abv_percent ?? b?.target_abv_percent),
          lal: toNum(b?.lal ?? b?.LAL)
        }))
    : []
  const segs = ([] as any[]).concat(
    Array.isArray(cutsSegs) ? cutsSegs : [],
    Array.isArray(phaseSegs) ? phaseSegs : [],
    Array.isArray(botSegs) ? botSegs : []
  )
  const segVol = segs.reduce((acc: number, s: any) => acc + (toNum(s?.volume_l) || 0), 0)
  const segLal = segs.reduce((acc: number, s: any) => acc + (toNum(s?.lal) || 0), 0)
  const segLalFromVolAbv = segs.reduce((acc: number, s: any) => {
    const v = toNum(s?.volume_l) || 0
    const a = toNum(s?.abv_percent) || 0
    return acc + (v * (a / 100))
  }, 0)
  const segAbvFromLal = segVol > 0 ? Number(((segLal / segVol) * 100).toFixed(1)) : null
  const segAbvWeighted = segVol > 0 ? Number(((segLalFromVolAbv / segVol) * 100).toFixed(1)) : null
  if ((hv == null || hv === 0) && segVol > 0 && hvDist == null) hv = segVol
  if ((habv == null || habv === 0) && (segAbvFromLal != null || segAbvWeighted != null) && habvDist == null) {
    habv = segAbvFromLal ?? segAbvWeighted ?? habv
  }
  if (hlal == null && hv != null && habv != null) hlal = Number((hv * (habv / 100)).toFixed(3))
  if (hlal == null && segLal > 0) hlal = Number(segLal.toFixed(3))
  if (hlal == null && segLalFromVolAbv > 0) hlal = Number(segLalFromVolAbv.toFixed(3))
  // const finalNewMakeVol = toNum(obj?.final_output?.new_make_l ?? obj?.final_output?.new_make_L ?? obj?.final_output?.volume_L)
  // const finalAbv = toNum(obj?.final_output?.abv_percent ?? obj?.final_output?.target_abv_percent)
  const finalVol =
    toNum(obj?.final_output?.volume_l ?? obj?.final_output?.volume_L) ??
    toNum(obj?.dilution?.final_output_L) ??
    toNum(obj?.dilution?.final_output?.volume_l ?? obj?.dilution?.final_output?.volume_L) ??
    null
  const finalVolAbv =
    toNum(obj?.final_output?.abv_percent ?? obj?.final_output?.target_abv_percent) ??
    toNum(obj?.dilution?.final_abv_percent ?? obj?.dilution?.final_output?.abv_percent ?? obj?.dilution?.final_output?.final_abv_percent) ??
    null
  if ((hv == null || hv === 0) && (finalVol != null)) hv = finalVol
  if ((habv == null || habv === 0) && (finalVolAbv != null)) habv = finalVolAbv
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
  if ((hv == null || hv === 0) && dilVol != null) hv = dilVol
  if ((habv == null || habv === 0) && dilAbv != null) habv = dilAbv
  if (hlal == null && hv != null && habv != null) hlal = Number((hv * (habv / 100)).toFixed(3))
  if ((hlal === 0 || hlal == null) && hv != null && habv != null && hv > 0 && habv > 0) hlal = Number((hv * (habv / 100)).toFixed(3))
  const charge =
    obj?.charge_adjustment?.total_charge ||
    obj?.charge_adjustment?.total ||
    obj?.charge?.total ||
    obj?.charge?.total_charge ||
    null
  const chargeVol = toNum(charge?.volume_l ?? charge?.volume_L) ?? toNum(obj?.charge_total_volume_l)
  const chargeABV = toNum(charge?.abv_percent ?? charge?.boiler_abv_percent) ?? toNum(obj?.charge_total_abv_percent)
  const chargeLAL = toNum(charge?.lal ?? charge?.boiler_LAL) ?? toNum(obj?.charge_total_lal) ?? (chargeVol != null && chargeABV != null ? Number((chargeVol * (chargeABV / 100)).toFixed(1)) : null)
  const recipeName = obj?.sku || obj?.display_name || obj?.recipe || obj?.meta?.sku || null
  const typicalAbv =
    recipeName && /rainforest\s*gin/i.test(recipeName) ? 81.0 :
    recipeName && /navy\s*strength/i.test(recipeName) ? 82.0 :
    recipeName && /signature.*dry.*gin/i.test(recipeName) ? 81.0 :
    null
  if ((habv == null || habv === 0) && hv != null && hv > 0 && typicalAbv != null) habv = typicalAbv
  if ((hlal == null || hlal === 0) && hv != null && habv != null && hv > 0 && habv > 0) hlal = Number((hv * (habv / 100)).toFixed(3))
  return {
    run_id: obj?.run_id || obj?.batch_id || '',
    recipe: obj?.sku || obj?.display_name || obj?.recipe || obj?.meta?.sku || null,
    date: obj?.date || obj?.meta?.date || obj?.meta?.run_date || obj?.distillation?.run_date || null,
    still_used: obj?.still_used || obj?.meta?.still_used || null,
    updated_at: null,
    status: 'completed',
    hearts_volume_l: hv ?? null,
    hearts_abv_percent: habv ?? null,
    hearts_lal: hlal ?? null,
    charge_total_volume_l: chargeVol ?? null,
    charge_total_abv_percent: chargeABV ?? null,
    charge_total_lal: chargeLAL ?? null,
  }
}

function integrateNdjsonGin(base: GinApiRecord[]): GinApiRecord[] {
  const sources = [
    'src/modules/production/data/wetseason.json',
    'src/modules/production/data/rainforest.json',
    'src/modules/production/data/dryseason.json',
    'src/modules/production/data/Navy.json',
  ]
  const extraObjs = sources.flatMap(readLooseJsonObjects)
  const extras: GinApiRecord[] = extraObjs
    .filter(o => o && (o.run_id || o.batch_id))
    .map(summarizeGin)
    .filter(r => {
      const id = String(r.run_id || '').toLowerCase()
      const looksRealId = /-\d+$/.test(id) && !id.includes('x')
      const hasMetric =
        (toNum(r.hearts_volume_l) ?? null) != null ||
        (toNum(r.hearts_abv_percent) ?? null) != null ||
        (toNum(r.hearts_lal) ?? null) != null
      const hasDate = typeof r.date === 'string' && r.date.trim() !== ''
      return looksRealId && (hasMetric || hasDate)
    })
  const merged = new Map<string, GinApiRecord>()
  for (const b of base) {
    merged.set(b.run_id, b)
  }
  const pick = <T>(a: T | null | undefined, b: T | null | undefined): T | null => {
    const isEmpty = (v: any) =>
      v === null ||
      v === undefined ||
      (typeof v === 'number' && (isNaN(v) || v === 0)) ||
      (typeof v === 'string' && v.trim() === '')
    return isEmpty(a) ? (b ?? null) : (a ?? null)
  }
  for (const b of extras) {
    if (!b.run_id) continue
    const existing = merged.get(b.run_id)
    if (!existing) {
      merged.set(b.run_id, b)
      continue
    }
    const combined: GinApiRecord = {
      ...existing,
      recipe: pick(existing.recipe ?? null, b.recipe ?? null),
      date: pick(existing.date ?? null, b.date ?? null),
      still_used: pick(existing.still_used ?? null, b.still_used ?? null),
      hearts_volume_l: (toNum(b.hearts_volume_l) ?? null) != null ? b.hearts_volume_l : (existing.hearts_volume_l ?? null),
      hearts_abv_percent: (toNum(b.hearts_abv_percent) ?? null) != null ? b.hearts_abv_percent : (existing.hearts_abv_percent ?? null),
      hearts_lal: (toNum(b.hearts_lal) ?? null) != null ? b.hearts_lal : (existing.hearts_lal ?? null),
      charge_total_volume_l: pick(existing.charge_total_volume_l ?? null, b.charge_total_volume_l ?? null),
      charge_total_abv_percent: pick(existing.charge_total_abv_percent ?? null, b.charge_total_abv_percent ?? null),
      charge_total_lal: pick(existing.charge_total_lal ?? null, b.charge_total_lal ?? null),
    }
    if ((combined.hearts_lal == null || combined.hearts_lal === 0) && combined.hearts_volume_l != null && combined.hearts_abv_percent != null && combined.hearts_volume_l > 0 && combined.hearts_abv_percent > 0) {
      combined.hearts_lal = Number((combined.hearts_volume_l * (combined.hearts_abv_percent / 100)).toFixed(3))
    }
    merged.set(b.run_id, combined)
  }
  return Array.from(merged.values()).sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })
}

export async function GET() {
  let gin: GinApiRecord[] = FALLBACK_RESPONSE.gin
  let rum: RumApiRecord[] = FALLBACK_RESPONSE.rum

  try {
    const flag = (process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase()
    const useStatic = flag === '1' || flag === 'true' || flag === 'yes'
    if (useStatic) {
      gin = integrateNdjsonGin(gin)
      return NextResponse.json({ gin, rum })
    }
    // Prefer service role (server-side only) to avoid RLS issues; fall back to anon client
    let supabase: any
    try {
      supabase = createServiceRoleClient()
    } catch {
      supabase = await createClient()
    }

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
          status: 'completed',
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

    // Merge and sort by date
    if (historicalGin.length > 0 || draftGin.length > 0) {
      gin = [...historicalGin, ...draftGin].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      }) as GinApiRecord[]
    } else {
      const ginHistErr = ginHistoricalResult.status === 'rejected'
        ? ginHistoricalResult.reason
        : (ginHistoricalResult.value && ginHistoricalResult.value.error)
      if (ginHistErr) {
        console.warn("⚠️ Using static gin dataset:", typeof ginHistErr === 'object' ? (ginHistErr.message || ginHistErr) : ginHistErr)
      }
    }
    gin = integrateNdjsonGin(gin)

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

    // Merge fallback rum summaries as well, so static hearts metrics backfill missing/0 DB values
    for (const row of FALLBACK_RESPONSE.rum) {
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

    if (combinedRum.length > 0) {
      rum = combinedRum
        .sort((a: any, b: any) => {
          const da = a.distillation_date ? new Date(a.distillation_date).getTime() : 0
          const db = b.distillation_date ? new Date(b.distillation_date).getTime() : 0
          return db - da
        }) as RumApiRecord[]
    } else {
      const rumErr = rumResult.status === 'rejected'
        ? rumResult.reason
        : (rumResult.value && rumResult.value.error)
      if (rumErr) {
        console.warn("⚠️ Using static rum dataset:", typeof rumErr === 'object' ? (rumErr.message || rumErr) : rumErr)
      }
    }
  } catch (error) {
    console.warn("⚠️ Using static production dataset:", (error as any)?.message || error)
    gin = integrateNdjsonGin(gin)
  }

  return NextResponse.json({ gin, rum })
}

export async function POST(request: NextRequest) {
  try {
    let supabase: any
    try {
      supabase = createServiceRoleClient()
    } catch {
      supabase = await createClient()
    }
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
