import { batchesDataset } from "@/modules/production/new-model/data/batches.dataset"
import { rumBatchesDataset } from "@/modules/production/data/rum-batches.dataset"
import productionBatches from "@/modules/production/data/production_batches.json"
import rumProductionData from "@/app/rum/rum_production_data.json"
import { signatureGinBatchSummaries } from "@/modules/production/data/signature-gin-batches"
import { distillationSessions } from "@/modules/production/data/distillation-sessions.data"
import { readFileSync } from "fs"
import { join } from "path"

export interface GinBatchSummary {
  run_id: string
  batch_id?: string // Alternative ID field used by some batches
  recipe: string | null
  date: string | null
  still_used: string | null
  updated_at: string | null
  // Optional enriched fields used by UI when Supabase is unavailable
  status?: string | null
  hearts_volume_l?: number | null
  hearts_abv_percent?: number | null
  hearts_lal?: number | null
  charge_total_volume_l?: number | null
  charge_total_abv_percent?: number | null
  charge_total_lal?: number | null
}

export interface RumBatchSummary {
  batch_id: string
  product_name: string | null
  product_type: string | null
  status?: string | null
  still_used: string | null
  fermentation_start_date: string | null
  distillation_date: string | null
  hearts_volume_l: number | null
  hearts_abv_percent: number | null
  hearts_lal: number | null
  fill_date: string | null
  cask_number: string | null
  initial_brix?: number | null
  initial_ph?: number | null
  yeast_type?: string | null
  boiler_volume_l?: number | null
  boiler_abv_percent?: number | null
  substrate_type?: string | null
  substrate_batch?: string | null
  substrate_mass_kg?: number | null
  water_mass_kg?: number | null
  anti_foam_ml?: number | null
  dunder_type?: string | null
  dunder_ph?: number | null
  fermaid_g?: number | null
  dap_g?: number | null
  calcium_carbonate_g?: number | null
  yeast_mass_g?: number | null
  yeast_rehydration_temp_c?: number | null
  yeast_rehydration_time_min?: number | null
  temperature_curve?: Record<string, number | string> | null
  brix_curve?: Record<string, number | string> | null
  ph_curve?: Record<string, number | string> | null
  final_brix?: number | null
  final_ph?: number | null
  final_abv_percent?: number | null
  foreshots_volume_l?: number | null
  foreshots_abv_percent?: number | null
  heads_volume_l?: number | null
  heads_abv_percent?: number | null
  heads_lal?: number | null
  tails_volume_l?: number | null
  tails_abv_percent?: number | null
  early_tails_volume_l?: number | null
  early_tails_abv_percent?: number | null
  late_tails_volume_l?: number | null
  late_tails_abv_percent?: number | null
}

const padRumBatchId = (id: string): string => {
  const m = id.match(/^RUM-(\d{2})-(\d+)$/i)
  if (!m) return id
  const year = m[1]
  const num = m[2].padStart(3, '0')
  return `RUM-${year}-${num}`
}

const normalizeCarrieStill = (value?: string | null): string | null => {
  if (!value) return "Carrie"
  const normalized = value.toLowerCase()
  if (normalized.includes("carrie") || normalized.includes("cp-")) {
    return "Carrie"
  }
  return value
}

const toNum = (v: any): number | null => {
  if (v === null || v === undefined) return null
  if (typeof v === "number") return v
  const m = String(v).match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

const sanitizeLooseJson = (s: string): string => {
  return s
    .replace(/\uFEFF/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\u200B/g, '')
    .replace(/("[^"]+"\s*:\s*(?:"[^"]*"|[0-9.+-eE]+)\s*)("[^"]+"\s*:)/g, '$1,$2')
    .replace(/,(\s*[}\]])/g, '$1')
}

const readLooseJsonObjects = (relPath: string): any[] => {
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

const summarizeGinNdjson = (obj: any): GinBatchSummary => {
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

export function buildGinBatchFallback(): GinBatchSummary[] {
  const toSummary = (batch: GinBatchSummary): GinBatchSummary => ({
    ...batch,
    still_used: normalizeCarrieStill(batch.still_used)
  })

  const monthBuckets = Object.values(batchesDataset.batches_by_month ?? {})
  const allBatches = monthBuckets.flat()

  const datasetSummaries = allBatches
    .filter((batch) => {
      const name = (batch.product_id ?? batch.sku ?? batch.display_name ?? "").toLowerCase()
      return (
        name.includes("gin") ||
        name.includes("vodka") ||
        name.includes("ethanol") ||
        name.includes("eth")
      )
    })
    .map((batch) => {
      const toNum = (v: any): number | null => {
        if (v === null || v === undefined) return null
        if (typeof v === "number") return v
        const m = String(v).match(/-?\d+(\.\d+)?/)
        return m ? Number(m[0]) : null
      }
      const hearts = batch.cuts?.hearts || null
      const segs = Array.isArray(batch.cuts?.hearts_segments) ? batch.cuts!.hearts_segments! : []
      const phaseOut = Array.isArray(batch.phase_outputs) ? batch.phase_outputs! : []
      const heartsPhase = phaseOut.filter((p: any) => String(p?.phase || "").toLowerCase().includes("hearts"))
      const segVol = segs.reduce((acc: number, s: any) => acc + (toNum(s?.volume_l) || 0), 0)
      const segLal = segs.reduce((acc: number, s: any) => acc + (toNum(s?.lal) || 0), 0)
      const segAbv = segVol > 0 ? Number(((segLal / segVol) * 100).toFixed(1)) : null
      const phaseVol = heartsPhase.reduce((acc: number, p: any) => acc + (toNum(p?.volume_l) || 0), 0)
      const phaseLal = heartsPhase.reduce((acc: number, p: any) => acc + (toNum(p?.lal) || 0), 0)
      const phaseAbv = phaseVol > 0 ? Number(((phaseLal / phaseVol) * 100).toFixed(1)) : null
      const hv = toNum(hearts?.volume_l) ?? (segVol || null) ?? (phaseVol || null)
      const habv = toNum(hearts?.abv_percent) ?? segAbv ?? phaseAbv ?? null
      const hlal = toNum(hearts?.lal) ?? (hv != null && habv != null ? Number((hv * (habv / 100)).toFixed(3)) : null)
      const chargeVol = toNum(batch.charge?.total?.volume_l)
      const chargeABV = toNum(batch.charge?.total?.abv_percent)
      const chargeLAL = chargeVol != null && chargeABV != null
        ? Number((Number(chargeVol) * (Number(chargeABV) / 100)).toFixed(1))
        : toNum(batch.charge?.total?.lal)
      return {
        run_id: batch.batch_id,
        recipe: batch.display_name ?? batch.sku ?? null,
        date: batch.date ?? null,
        still_used: batch.still_used ?? null,
        updated_at: batch.audit?.last_edited_at ?? null,
        status: 'completed',
        hearts_volume_l: hv ?? null,
        hearts_abv_percent: habv ?? null,
        hearts_lal: hlal ?? null,
        charge_total_volume_l: chargeVol ?? null,
        charge_total_abv_percent: chargeABV ?? null,
        charge_total_lal: chargeLAL ?? null,
      } as GinBatchSummary
    })

  const signatureSummaries: GinBatchSummary[] = signatureGinBatchSummaries.map((batch) => {
    // Compute enriched fields so UI cards show real numbers
    const heartsABV = batch.hearts_abv_percent ?? null
    const heartsLAL = batch.hearts_lal ?? null
    const heartsVolume = batch.hearts_volume_l ?? (
      heartsLAL != null && heartsABV != null && heartsABV > 0
        ? Number((heartsLAL / (heartsABV / 100)).toFixed(1))
        : null
    )

    const chargeVol = batch.charge_volume_l ?? null
    const chargeABV = batch.charge_abv_percent ?? null
    const chargeLAL = chargeVol != null && chargeABV != null
      ? Number((chargeVol * (chargeABV / 100)).toFixed(1))
      : null

    return {
      run_id: batch.batch_id,
      recipe: batch.recipe,
      date: batch.date,
      still_used: batch.still_used,
      updated_at: null,
      status: 'completed',
      hearts_volume_l: heartsVolume,
      hearts_abv_percent: heartsABV,
      hearts_lal: heartsLAL ?? (heartsVolume != null && heartsABV != null ? Number((heartsVolume * (heartsABV / 100)).toFixed(1)) : null),
      charge_total_volume_l: chargeVol,
      charge_total_abv_percent: chargeABV,
      charge_total_lal: chargeLAL,
    }
  })

  const sessionSummaries: GinBatchSummary[] = distillationSessions
    .filter((s) => {
      const name = (s.sku || s.id || "").toLowerCase()
      const id = (s.id || "").toLowerCase()
      return (
        name.includes("gin") ||
        name.includes("vodka") ||
        name.includes("ethanol") ||
        id.includes("spirit-liq")
      )
    })
    .map((s) => {
      const hvFromTotals = s.totals?.hearts?.volumeL ?? null
      const habvFromTotals = s.totals?.hearts?.avgAbvPercent ?? null
      const hlalFromTotals = s.totals?.hearts?.lal ?? null
      let hv = hvFromTotals
      let habv = habvFromTotals
      let hlal = hlalFromTotals

      if ((hv == null || habv == null) && Array.isArray(s.outputs)) {
        const toNum = (v: any): number | null => {
          if (v === null || v === undefined) return null
          if (typeof v === "number") return v
          const m = String(v).match(/-?\d+(\.\d+)?/)
          return m ? Number(m[0]) : null
        }
        const hearts = (s.outputs as any[])
          .filter((o) => {
            const p = (o?.name || o?.phase || "").toLowerCase()
            return p.includes("hearts")
          })
          .map((o) => ({
            volume: toNum(o?.volumeL ?? o?.volume_L),
            abv: toNum(o?.abv ?? o?.abv_percent),
            lal: toNum(o?.lal),
          }))
        const volSum = hearts.reduce((acc, x) => acc + (x.volume || 0), 0)
        const lalSum = hearts.reduce((acc, x) => acc + (x.lal || 0), 0)
        const abvWeighted = volSum > 0 ? Number(((lalSum / volSum) * 100).toFixed(1)) : null
        hv = hv ?? (volSum || null)
        habv = habv ?? abvWeighted
        hlal = hlal ?? (volSum > 0 && abvWeighted != null ? Number((volSum * (abvWeighted / 100)).toFixed(3)) : null)
      }

      const chargeVol = s.charge?.total?.volume_L ?? s.chargeVolumeL ?? null
      const chargeABV = s.charge?.total?.abv_percent ?? s.chargeABV ?? null
      const chargeLAL = chargeVol != null && chargeABV != null
        ? Number((Number(chargeVol) * (Number(chargeABV) / 100)).toFixed(1))
        : s.charge?.total?.lal ?? s.chargeLAL ?? null

      return {
        run_id: s.id,
        recipe: s.sku || null,
        date: s.date || null,
        still_used: s.still || null,
        updated_at: null,
        status: 'completed',
        hearts_volume_l: hv ?? null,
        hearts_abv_percent: habv ?? null,
        hearts_lal: hlal ?? null,
        charge_total_volume_l: chargeVol ?? null,
        charge_total_abv_percent: chargeABV ?? null,
        charge_total_lal: chargeLAL ?? null,
      }
    })

  const merged = new Map<string, GinBatchSummary>()

  datasetSummaries.forEach((batch) => {
    merged.set(batch.run_id, toSummary(batch))
  })

  signatureSummaries.forEach((batch) => {
    merged.set(batch.run_id, toSummary(batch))
  })

  sessionSummaries.forEach((batch) => {
    merged.set(batch.run_id, toSummary(batch))
  })

  const ndjsonSources = [
    'src/modules/production/data/wetseason.json',
    'src/modules/production/data/rainforest.json',
    'src/modules/production/data/dryseason.json',
    'src/modules/production/data/Navy.json',
  ]
  const extraObjs = ndjsonSources.flatMap(readLooseJsonObjects)
  const ndjsonSummaries: GinBatchSummary[] = extraObjs
    .filter(o => o && (o.run_id || o.batch_id))
    .map(summarizeGinNdjson)
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
  ndjsonSummaries.forEach((b) => {
    const existing = merged.get(b.run_id)
    if (!existing) {
      merged.set(b.run_id, toSummary(b))
      return
    }
    const combined: GinBatchSummary = {
      ...existing,
      recipe: existing.recipe ?? b.recipe ?? null,
      date: existing.date ?? b.date ?? null,
      still_used: existing.still_used ?? b.still_used ?? null,
      hearts_volume_l: (toNum(b.hearts_volume_l) ?? null) != null ? b.hearts_volume_l : (existing.hearts_volume_l ?? null),
      hearts_abv_percent: (toNum(b.hearts_abv_percent) ?? null) != null ? b.hearts_abv_percent : (existing.hearts_abv_percent ?? null),
      hearts_lal: (toNum(b.hearts_lal) ?? null) != null ? b.hearts_lal : (existing.hearts_lal ?? null),
      charge_total_volume_l: existing.charge_total_volume_l ?? b.charge_total_volume_l ?? null,
      charge_total_abv_percent: existing.charge_total_abv_percent ?? b.charge_total_abv_percent ?? null,
      charge_total_lal: existing.charge_total_lal ?? b.charge_total_lal ?? null,
    }
    if ((combined.hearts_lal == null || combined.hearts_lal === 0) && combined.hearts_volume_l != null && combined.hearts_abv_percent != null && combined.hearts_volume_l > 0 && combined.hearts_abv_percent > 0) {
      combined.hearts_lal = Number((combined.hearts_volume_l * (combined.hearts_abv_percent / 100)).toFixed(3))
    }
    merged.set(b.run_id, toSummary(combined))
  })

  return Array.from(merged.values()).sort((a, b) => {
    const aDate = a.date ?? ""
    const bDate = b.date ?? ""
    return bDate.localeCompare(aDate)
  })
}

export function buildRumBatchFallback(): RumBatchSummary[] {
  const rumFromDataset = rumBatchesDataset.map((batch) => {
    const hearts = batch.distillation?.cuts?.hearts
    return {
      batch_id: padRumBatchId(batch.batch_id),
      product_name: batch.product?.name ?? null,
      product_type: batch.product?.type ?? null,
      status: 'completed',
      still_used: batch.still_used ?? null,
      fermentation_start_date: batch.fermentation?.start_date ?? null,
      distillation_date: batch.distillation?.date ?? null,
      hearts_volume_l: hearts?.volume_l ?? null,
      hearts_abv_percent: hearts?.abv_percent ?? null,
      hearts_lal: hearts?.lal ?? null,
      fill_date: batch.aging?.fill_date ?? null,
      cask_number: batch.aging?.cask?.number ?? null
    }
  })

  type ProductionBatchJsonEntry = {
    batch_id: string
    product_group?: string
    fermentation?: { date_start?: string; volume_l?: number | string; brix_start?: number | string; ph_start?: number | string; yeast?: string }
    distillation?: { date?: string; charge_l?: number; abv_in?: number }
    distillations?: { date?: string }[]
    date?: string
    feedstock?: string
  }
  const prodBatches = (productionBatches as { batches?: ProductionBatchJsonEntry[] }).batches ?? []
  const rumFromProductionJson: RumBatchSummary[] = prodBatches
    .filter((b) => {
      const group = (b.product_group || '').toUpperCase()
      const isRum = typeof b.product_group === 'string' && group.startsWith('RUM')
      const isRum248Variant = group === 'RUM-24-8' && /RUM-24-8-/i.test(b.batch_id || '')
      return isRum && !isRum248Variant
    })
    .map((b) => {
      const parseNum = (v: any): number | null => {
        if (v === null || v === undefined) return null
        if (typeof v === 'number') return v
        if (typeof v === 'string') {
          const m = v.match(/-?\d+(\.\d+)?/)
          return m ? Number(m[0]) : null
        }
        return null
      }
      const firstDist = Array.isArray(b.distillations) && b.distillations.length > 0 ? b.distillations[0] : undefined
      const batchId = padRumBatchId(b.batch_id)
      return {
        batch_id: batchId,
        product_name: 'Rum',
        product_type: 'rum',
        status: 'completed',
        still_used: 'Roberta',
        fermentation_start_date: b.fermentation?.date_start ?? null,
        distillation_date: (b.distillations && b.distillations[0]?.date) || b.date || null,
        hearts_volume_l: null,
        hearts_abv_percent: null,
        hearts_lal: null,
        fill_date: null,
        cask_number: null,
        initial_brix: parseNum(b.fermentation?.brix_start),
        initial_ph: parseNum(b.fermentation?.ph_start),
        yeast_type: b.fermentation?.yeast || null,
        boiler_volume_l: (firstDist as any)?.charge_l ?? null,
        boiler_abv_percent: (firstDist as any)?.abv_in ?? null,
        substrate_type: b.feedstock || null,
      }
    })

  type CutPoint = { phase?: string; volume_l?: number; lal?: number }
  type DistillationRun = { date?: string; cut_points?: CutPoint[] }
  type RumProductionEntry = { batch_id: string; date?: string; distillation_runs?: DistillationRun[]; cask?: { fill_date?: string; cask_number?: string } }
  const appEntries: RumProductionEntry[] = Array.isArray(rumProductionData) ? (rumProductionData as RumProductionEntry[]) : []
  const rumFromAppJson: RumBatchSummary[] = appEntries
    .filter((entry) => {
      const id = (entry?.batch_id || '').toUpperCase()
      return /^RUM-\d{2}-\d+$/.test(id)
    })
    .map((entry) => {
      const parseNum = (v: any): number | null => {
        if (v === null || v === undefined) return null
        if (typeof v === 'number') return v
        if (typeof v === 'string') {
          const m = v.match(/-?\d+(\.\d+)?/)
          return m ? Number(m[0]) : null
        }
        return null
      }
      const runs: DistillationRun[] = Array.isArray(entry.distillation_runs) ? entry.distillation_runs! : []
      const heartsSegments: CutPoint[] = runs
        .flatMap((r) => Array.isArray(r.cut_points) ? r.cut_points! : [])
        .filter((cp) => (cp?.phase || '').toLowerCase() === 'hearts')
      const heartsVolSum = heartsSegments.reduce((acc, cp) => acc + (Number(cp?.volume_l) || 0), 0)
      const heartsLalSum = heartsSegments.reduce((acc, cp) => acc + (Number(cp?.lal) || 0), 0)
      const heartsABVWeighted = heartsVolSum > 0 ? Number(((heartsLalSum / heartsVolSum) * 100).toFixed(1)) : null
      const foreshotsSegments: CutPoint[] = runs
        .flatMap((r) => Array.isArray(r.cut_points) ? r.cut_points! : [])
        .filter((cp) => (cp?.phase || '').toLowerCase().includes('foreshots'))
      const foreshotsVolSum = foreshotsSegments.reduce((acc, cp) => acc + (Number(cp?.volume_l) || 0), 0)
      const foreshotsLalSum = foreshotsSegments.reduce((acc, cp) => acc + (Number(cp?.lal) || 0), 0)
      const foreshotsABVWeighted = foreshotsVolSum > 0 ? Number(((foreshotsLalSum / foreshotsVolSum) * 100).toFixed(1)) : null
      const headsSegments: CutPoint[] = runs
        .flatMap((r) => Array.isArray(r.cut_points) ? r.cut_points! : [])
        .filter((cp) => (cp?.phase || '').toLowerCase().includes('heads'))
      const headsVolSum = headsSegments.reduce((acc, cp) => acc + (Number(cp?.volume_l) || 0), 0)
      const headsLalSum = headsSegments.reduce((acc, cp) => acc + (Number(cp?.lal) || 0), 0)
      const headsABVWeighted = headsVolSum > 0 ? Number(((headsLalSum / headsVolSum) * 100).toFixed(1)) : null
      const earlyTailsSegments: CutPoint[] = runs
        .flatMap((r) => Array.isArray(r.cut_points) ? r.cut_points! : [])
        .filter((cp) => (cp?.phase || '').toLowerCase().includes('early tails'))
      const lateTailsSegments: CutPoint[] = runs
        .flatMap((r) => Array.isArray(r.cut_points) ? r.cut_points! : [])
        .filter((cp) => (cp?.phase || '').toLowerCase().includes('late tails'))
      const earlyTailsVolSum = earlyTailsSegments.reduce((acc, cp) => acc + (Number(cp?.volume_l) || 0), 0)
      const earlyTailsLalSum = earlyTailsSegments.reduce((acc, cp) => acc + (Number(cp?.lal) || 0), 0)
      const lateTailsVolSum = lateTailsSegments.reduce((acc, cp) => acc + (Number(cp?.volume_l) || 0), 0)
      const lateTailsLalSum = lateTailsSegments.reduce((acc, cp) => acc + (Number(cp?.lal) || 0), 0)
      const earlyTailsABVWeighted = earlyTailsVolSum > 0 ? Number(((earlyTailsLalSum / earlyTailsVolSum) * 100).toFixed(1)) : null
      const lateTailsABVWeighted = lateTailsVolSum > 0 ? Number(((lateTailsLalSum / lateTailsVolSum) * 100).toFixed(1)) : null
      const tailsVolSum = earlyTailsVolSum + lateTailsVolSum
      const tailsLalSum = earlyTailsLalSum + lateTailsLalSum
      const tailsABVWeighted = tailsVolSum > 0 ? Number(((tailsLalSum / tailsVolSum) * 100).toFixed(1)) : null
      const firstRunDate = runs.length > 0 ? runs[0]?.date || entry.date || null : entry.date || null
      const firstRunBoilerVol = runs.length > 0 ? parseNum((runs[0] as any)?.boiler_volume_l) : null
      const firstRunBoilerAbv = runs.length > 0 ? parseNum((runs[0] as any)?.boiler_abv_percent) : null
      const ferm = (entry as any).fermentation || {}
      const temperature_profile = ferm?.temperature_profile || null
      const brix_profile = ferm?.brix_profile || null
      const ph_profile = ferm?.ph_profile || null
      return {
        batch_id: padRumBatchId(entry.batch_id),
        product_name: 'Rum',
        product_type: 'rum',
        status: 'completed',
        still_used: 'Roberta',
        fermentation_start_date: entry.date || null,
        distillation_date: firstRunDate || null,
        hearts_volume_l: heartsVolSum || null,
        hearts_abv_percent: heartsABVWeighted,
        hearts_lal: heartsLalSum || null,
        fill_date: entry?.cask?.fill_date || null,
        cask_number: entry?.cask?.cask_number || null,
        substrate_type: ferm?.substrate || null,
        substrate_batch: ferm?.substrate_batch || null,
        substrate_mass_kg: parseNum(ferm?.substrate_mass_kg),
        water_mass_kg: parseNum(ferm?.water_mass_kg),
        anti_foam_ml: parseNum(ferm?.antifoam_ml),
        initial_brix: parseNum(ferm?.brix_initial),
        initial_ph: parseNum(ferm?.ph_initial),
        dunder_type: ferm?.dunder || null,
        dunder_ph: parseNum(ferm?.dunder_ph),
        fermaid_g: parseNum(ferm?.fermaid_g),
        dap_g: parseNum(ferm?.dap_g),
        calcium_carbonate_g: parseNum(ferm?.calcium_carbonate_g),
        yeast_type: ferm?.yeast_type || null,
        yeast_mass_g: parseNum(ferm?.yeast_mass_g),
        yeast_rehydration_temp_c: parseNum(ferm?.yeast_rehydration_temp_c),
        yeast_rehydration_time_min: parseNum(ferm?.yeast_rehydration_time_min),
        temperature_curve: temperature_profile,
        brix_curve: brix_profile,
        ph_curve: ph_profile,
        final_brix: parseNum(ferm?.final_brix),
        final_ph: parseNum(ferm?.final_ph),
        boiler_volume_l: firstRunBoilerVol,
        boiler_abv_percent: firstRunBoilerAbv,
        foreshots_volume_l: foreshotsVolSum || null,
        foreshots_abv_percent: foreshotsABVWeighted || null,
        heads_volume_l: headsVolSum || null,
        heads_abv_percent: headsABVWeighted || null,
        heads_lal: headsLalSum || null,
        tails_volume_l: tailsVolSum || null,
        tails_abv_percent: tailsABVWeighted || null,
        early_tails_volume_l: earlyTailsVolSum || null,
        early_tails_abv_percent: earlyTailsABVWeighted || null,
        late_tails_volume_l: lateTailsVolSum || null,
        late_tails_abv_percent: lateTailsABVWeighted || null
      }
    })

  // Aggregate CS-25 into two cards to match batch grouping
  type CsVariant = { id: string; date: string; vol: number; abv: number; lal: number }
  const cs25Variants: CsVariant[] = [
    // CS-25-1 variants: keep known right fermenter hearts; left unknown
    { id: 'CS-25-1-A', date: '2025-10-17', vol: 0, abv: 0, lal: 0 },
    { id: 'CS-25-1-B', date: '2025-10-17', vol: 60.0, abv: 65.6, lal: Number((60.0 * 0.656).toFixed(3)) },
    // CS-25-2 variants from user-provided JSON
    { id: 'CS-25-2-A', date: '2025-11-11', vol: 81.8, abv: 80.6, lal: 67.894 },
    { id: 'CS-25-2-B', date: '2025-11-15', vol: 45.0, abv: 78.8, lal: 35.775 }
  ]
  const getCsGroupMeta = (group: 'CS-24-1' | 'CS-24-2' | 'CS-24-3' | 'CS-25-1' | 'CS-25-2') => {
    const entries = prodBatches.filter(b => (b.product_group || '').toUpperCase() === group.toUpperCase())
    const fermentationEntry = entries.find(b => b.fermentation)
    const distillationEntry = entries.find(b => b.distillation)
    const parseNum = (v: any): number | null => {
      if (v === null || v === undefined) return null
      if (typeof v === 'number') return v
      if (typeof v === 'string') {
        const m = v.match(/-?\d+(\.\d+)?/)
        return m ? Number(m[0]) : null
      }
      return null
    }
    const initial_brix = fermentationEntry ? parseNum(fermentationEntry.fermentation?.brix_start) : null
    const initial_ph = fermentationEntry ? parseNum(fermentationEntry.fermentation?.ph_start) : null
    const yeast_type = fermentationEntry?.fermentation?.yeast || null
    const substrate_type = fermentationEntry?.feedstock || entries[0]?.feedstock || null
    const boiler_volume_l = distillationEntry?.distillation?.charge_l ?? null
    const boiler_abv_percent = distillationEntry?.distillation?.abv_in ?? null
    return { initial_brix, initial_ph, yeast_type, substrate_type, boiler_volume_l, boiler_abv_percent }
  }
  const aggregate = (prefix: 'CS-25-1' | 'CS-25-2', fermentationDate: string) => {
    const items = cs25Variants.filter(v => v.id.startsWith(prefix))
    const volSum = items.reduce((acc, v) => acc + v.vol, 0)
    const lalSum = items.reduce((acc, v) => acc + v.lal, 0)
    const abvWeighted = volSum > 0 ? Number(((lalSum / volSum) * 100).toFixed(1)) : null
    const distillationDate = items.reduce((latest, v) => {
      const t = v.date ? new Date(v.date).getTime() : 0
      return t > latest ? t : latest
    }, 0)
    const meta = getCsGroupMeta(prefix)
    return {
      batch_id: prefix,
      product_name: prefix === 'CS-25-1' ? 'Cane Spirit — CS-25-1' : 'Cane Spirit — CS-25-2',
      product_type: 'cane_spirit',
      status: 'completed',
      still_used: 'Carrie',
      fermentation_start_date: fermentationDate,
      distillation_date: distillationDate ? new Date(distillationDate).toISOString().split('T')[0] : fermentationDate,
      hearts_volume_l: volSum || null,
      hearts_abv_percent: abvWeighted,
      hearts_lal: volSum > 0 && abvWeighted != null ? Number((volSum * (abvWeighted / 100)).toFixed(3)) : null,
      fill_date: null,
      cask_number: null,
      initial_brix: meta.initial_brix ?? null,
      initial_ph: meta.initial_ph ?? null,
      yeast_type: meta.yeast_type ?? null,
      substrate_type: meta.substrate_type ?? null,
      boiler_volume_l: meta.boiler_volume_l ?? null,
      boiler_abv_percent: meta.boiler_abv_percent ?? null
    }
  }
  const caneSpiritCSSummary: RumBatchSummary[] = [
    {
      batch_id: 'CS-24-1',
      product_name: 'Cane Spirit — CS-24-1',
      product_type: 'cane_spirit',
      status: 'completed',
      still_used: 'Roberta',
      fermentation_start_date: '2024-09-25',
      distillation_date: '2024-10-02',
      hearts_volume_l: null,
      hearts_abv_percent: null,
      hearts_lal: null,
      fill_date: null,
      cask_number: null,
      initial_brix: 18.4,
      initial_ph: 4.64,
      yeast_type: 'Distillamax RM',
      substrate_type: 'Cane Juice',
      substrate_batch: null,
      substrate_mass_kg: 2000,
      water_mass_kg: 0,
      anti_foam_ml: 150,
      fermaid_g: 0,
      dap_g: 0,
      calcium_carbonate_g: 0,
      temperature_curve: {
        '0h': 32.0,
        '24h': 26.8,
        '48h': 26.0,
        '72h': 25.6,
      },
      brix_curve: {
        '0h': 12.2,
        '24h': 8.6,
        '48h': 2.4,
        '72h': 2.0,
      },
      ph_curve: {
        '0h': 3.59,
        '24h': 3.56,
        '48h': 3.56,
        '72h': 3.56,
      },
      final_brix: 2.0,
      final_ph: null,
      boiler_volume_l: null,
      boiler_abv_percent: null,
      foreshots_volume_l: null,
      foreshots_abv_percent: null,
      heads_volume_l: 0,
      heads_abv_percent: 0,
      heads_lal: 0,
      tails_volume_l: null,
      tails_abv_percent: null,
      early_tails_volume_l: null,
      early_tails_abv_percent: null,
      late_tails_volume_l: null,
      late_tails_abv_percent: null,
    },
    aggregate('CS-25-1', '2025-10-10'),
    aggregate('CS-25-2', '2025-10-31')
  ]

  // Aggregate RUM-25-001 (two runs A/B provided by user)
  const rum25Variants: CsVariant[] = [
    { id: 'RUM-25-001-A', date: '2025-11-28', vol: 88.0, abv: 80.2, lal: 72.6 },
    { id: 'RUM-25-001-B', date: '2025-11-28', vol: 72.0, abv: 79.9, lal: 59.112 }
  ]
  const rum25VolSum = rum25Variants.reduce((acc, v) => acc + v.vol, 0)
  const rum25LalSum = rum25Variants.reduce((acc, v) => acc + v.lal, 0)
  const rum25AbvWeighted = rum25VolSum > 0 ? Number(((rum25LalSum / rum25VolSum) * 100).toFixed(1)) : null
  const rum25LatestDate = rum25Variants.reduce((latest, v) => {
    const t = v.date ? new Date(v.date).getTime() : 0
    return t > latest ? t : latest
  }, 0)
  const rum25Summary: RumBatchSummary = {
    batch_id: 'RUM-25-001',
    product_name: 'Rum — RUM-25-001',
    product_type: 'rum',
    status: 'completed',
    still_used: 'Roberta',
    fermentation_start_date: '2025-11-28',
    distillation_date: rum25LatestDate ? new Date(rum25LatestDate).toISOString().split('T')[0] : '2025-11-28',
    hearts_volume_l: rum25VolSum || null,
    hearts_abv_percent: rum25AbvWeighted,
    hearts_lal: rum25LalSum || null,
    fill_date: null,
    cask_number: null,
    initial_brix: 17.9,
    initial_ph: 4.91,
    yeast_type: 'Distillamax RM 1kg',
    boiler_volume_l: 1100,
    boiler_abv_percent: 8.5,
    substrate_type: 'Cane Syrup',
  }

  // Aggregate RUM-25-002 (two runs provided by user)
  const rum25002Variants: CsVariant[] = [
    { id: 'RUM-25-002-1', date: '2025-12-18', vol: 95.0, abv: 79.4, lal: 77.9 },
    { id: 'RUM-25-002-2', date: '2025-12-22', vol: 44.0, abv: 73.9, lal: 32.516 }
  ]
  const rum25002VolSum = rum25002Variants.reduce((acc, v) => acc + v.vol, 0)
  const rum25002LalSum = rum25002Variants.reduce((acc, v) => acc + v.lal, 0)
  const rum25002AbvWeighted = rum25002VolSum > 0 ? Number(((rum25002LalSum / rum25002VolSum) * 100).toFixed(1)) : null
  const rum25002LatestDate = rum25002Variants.reduce((latest, v) => {
    const t = v.date ? new Date(v.date).getTime() : 0
    return t > latest ? t : latest
  }, 0)
  const rum25002Summary: RumBatchSummary = {
    batch_id: 'RUM-25-002',
    product_name: 'Rum — RUM-25-002',
    product_type: 'rum',
    status: 'completed',
    still_used: 'Roberta',
    fermentation_start_date: '2025-12-11',
    distillation_date: rum25002LatestDate ? new Date(rum25002LatestDate).toISOString().split('T')[0] : '2025-12-11',
    hearts_volume_l: rum25002VolSum || null,
    hearts_abv_percent: rum25002AbvWeighted,
    hearts_lal: rum25002LalSum || null,
    fill_date: null,
    cask_number: null,
    substrate_type: 'Cane Syrup',
    initial_brix: 17.9,
    initial_ph: 4.91,
    yeast_type: 'Distillamax RM 1kg',
    boiler_volume_l: 1100,
    boiler_abv_percent: 8.5
  }

  const rum24008HeartsVol = 72 + 79
  const rum24008HeartsLal = Number((59.976 + 65.175).toFixed(3))
  const rum24008HeartsAbv = rum24008HeartsVol > 0 ? Number(((rum24008HeartsLal / rum24008HeartsVol) * 100).toFixed(1)) : null
  const rum24008LateTailsVol = 69 + 58
  const rum24008LateTailsLal = Number((36.772 + 36.772).toFixed(3))
  const rum24008LateTailsAbv = rum24008LateTailsVol > 0 ? Number(((rum24008LateTailsLal / rum24008LateTailsVol) * 100).toFixed(1)) : null
  const rum24008Summary: RumBatchSummary = {
    batch_id: 'RUM-24-8',
    product_name: 'Rum — RUM-24-8',
    product_type: 'rum',
    status: 'completed',
    still_used: 'Roberta',
    fermentation_start_date: '2024-03-08',
    distillation_date: '2024-03-16',
    hearts_volume_l: rum24008HeartsVol,
    hearts_abv_percent: rum24008HeartsAbv,
    hearts_lal: rum24008HeartsLal,
    fill_date: '2024-03-20',
    cask_number: '42',
    initial_brix: 19,
    initial_ph: 4.84,
    yeast_type: 'Distillamax RM',
    boiler_volume_l: 1000,
    boiler_abv_percent: 8.5,
    substrate_type: 'Blend of C molasses and cane syrup',
    substrate_batch: '2021',
    substrate_mass_kg: 191,
    water_mass_kg: 1100,
    anti_foam_ml: 100,
    dunder_type: '100 L molasses dunder MUCK + 50 L funky dunder + 25 L extreme funky worm',
    yeast_mass_g: 500,
    yeast_rehydration_temp_c: 37.5,
    yeast_rehydration_time_min: 15,
    temperature_curve: { '24h': 29.7, '48h': 26.7, '72h': 26, '96h': 26.5, '120h': 26.4, 'final': '-' },
    brix_curve: { '24h': 17.8, '48h': 9.7, '72h': 5, '96h': 3.4, '120h': 3.3, 'final': 24.7 },
    ph_curve: { '24h': 4.73, '48h': 3.98, '72h': 3.92, '96h': 3.93, '120h': 3.91, 'final': '-' },
    heads_volume_l: 20 + 24,
    heads_abv_percent: Number(((15.174 + 20.16) / (20 + 24) * 100).toFixed(1)),
    heads_lal: Number((15.174 + 20.16).toFixed(3)),
    late_tails_volume_l: rum24008LateTailsVol,
    late_tails_abv_percent: rum24008LateTailsAbv
  }


  // Aggregate RUM-24-009 (primary + supplemental runs)
  const rum24009Variants: CsVariant[] = [
    { id: 'RUM-24-009-Primary', date: '2024-09-11', vol: 72.0, abv: 83.4, lal: 60.048 },
    { id: 'RUM-24-009-Supplemental', date: '2024-09-14', vol: 74.0, abv: 83.2, lal: 61.568 }
  ]
  const rum24009VolSum = rum24009Variants.reduce((acc, v) => acc + v.vol, 0)
  const rum24009LalSum = rum24009Variants.reduce((acc, v) => acc + v.lal, 0)
  const rum24009AbvWeighted = rum24009VolSum > 0 ? Number(((rum24009LalSum / rum24009VolSum) * 100).toFixed(1)) : null
  const rum24009LatestDate = rum24009Variants.reduce((latest, v) => {
    const t = v.date ? new Date(v.date).getTime() : 0
    return t > latest ? t : latest
  }, 0)
  const rum24009Summary: RumBatchSummary = {
    batch_id: 'RUM-24-009',
    product_name: 'Rum — RUM-24-009',
    product_type: 'rum',
    status: 'completed',
    still_used: 'Roberta',
    fermentation_start_date: '2024-09-05',
    distillation_date: rum24009LatestDate ? new Date(rum24009LatestDate).toISOString().split('T')[0] : '2024-09-14',
    hearts_volume_l: rum24009VolSum || null,
    hearts_abv_percent: rum24009AbvWeighted,
    hearts_lal: rum24009LalSum || null,
    fill_date: '2024-09-18',
    cask_number: 'WS',
    initial_brix: 20.5,
    initial_ph: 5.2,
    yeast_type: 'Distillamax RM',
    boiler_volume_l: 1000,
    boiler_abv_percent: 9.2,
    substrate_type: 'Cane Syrup',
    substrate_batch: '2021',
    substrate_mass_kg: 500,
    water_mass_kg: 1500,
    anti_foam_ml: 100,
    yeast_mass_g: 1000,
    yeast_rehydration_temp_c: 37.5,
    yeast_rehydration_time_min: 15,
    temperature_curve: { '24h': 25.9 },
    brix_curve: { '24h': 20.1 },
    ph_curve: { '24h': 4.54 },
    heads_volume_l: 20 + 26,
    heads_abv_percent: Number(((16.84 + 22.1) / (20 + 26) * 100).toFixed(1)),
    heads_lal: Number((16.84 + 22.1).toFixed(3)),
    early_tails_volume_l: 64,
    early_tails_abv_percent: 65.7,
    late_tails_volume_l: 46,
    late_tails_abv_percent: 49.2,
    final_brix: 30,
    final_ph: 4.51
  }

  const cs242Variants = [
    { id: 'CS-24-2-Left', date: '2024-10-22', vol: 67.0, lal: 55.208 },
    { id: 'CS-24-2-Right', date: '2024-10-22', vol: 79.0, lal: 65.175 }
  ]
  const cs242VolSum = cs242Variants.reduce((acc, v) => acc + v.vol, 0)
  const cs242LalSum = cs242Variants.reduce((acc, v) => acc + v.lal, 0)
  const cs242AbvWeighted = cs242VolSum > 0 ? Number(((cs242LalSum / cs242VolSum) * 100).toFixed(1)) : null
  const cs242LatestDate = cs242Variants.reduce((latest, v) => {
    const t = v.date ? new Date(v.date).getTime() : 0
    return t > latest ? t : latest
  }, 0)
  const cs24_2_meta = getCsGroupMeta('CS-24-2')
  const cs242Summary: RumBatchSummary = {
    batch_id: 'CS-24-2',
    product_name: 'Cane Spirit — CS-24-2',
    product_type: 'cane_spirit',
    status: 'completed',
    still_used: 'Carrie',
    fermentation_start_date: '2024-10-17',
    distillation_date: cs242LatestDate ? new Date(cs242LatestDate).toISOString().split('T')[0] : '2024-10-22',
    hearts_volume_l: cs242VolSum || null,
    hearts_abv_percent: cs242AbvWeighted,
    hearts_lal: cs242LalSum || null,
    fill_date: null,
    cask_number: null,
    initial_brix: cs24_2_meta.initial_brix ?? null,
    initial_ph: cs24_2_meta.initial_ph ?? null,
    yeast_type: cs24_2_meta.yeast_type ?? null,
    substrate_type: cs24_2_meta.substrate_type ?? null,
    boiler_volume_l: cs24_2_meta.boiler_volume_l ?? null,
    boiler_abv_percent: cs24_2_meta.boiler_abv_percent ?? null
  }

  const cs243Variants = [
    { id: 'CS-24-3-Left', date: '2024-11-06', vol: 65.0, lal: 53.3 },
    { id: 'CS-24-3-Right', date: '2024-11-06', vol: 66.0, lal: 54.12 }
  ]
  const cs243VolSum = cs243Variants.reduce((acc, v) => acc + v.vol, 0)
  const cs243LalSum = cs243Variants.reduce((acc, v) => acc + v.lal, 0)
  const cs243AbvWeighted = cs243VolSum > 0 ? Number(((cs243LalSum / cs243VolSum) * 100).toFixed(1)) : null
  const cs243LatestDate = cs243Variants.reduce((latest, v) => {
    const t = v.date ? new Date(v.date).getTime() : 0
    return t > latest ? t : latest
  }, 0)
  const cs24_3_meta = getCsGroupMeta('CS-24-3')
  const cs243Summary: RumBatchSummary = {
    batch_id: 'CS-24-3',
    product_name: 'Cane Spirit — CS-24-3',
    product_type: 'cane_spirit',
    status: 'completed',
    still_used: 'Carrie',
    fermentation_start_date: '2024-11-06',
    distillation_date: cs243LatestDate ? new Date(cs243LatestDate).toISOString().split('T')[0] : '2024-11-06',
    hearts_volume_l: cs243VolSum || null,
    hearts_abv_percent: cs243AbvWeighted,
    hearts_lal: cs243LalSum || null,
    fill_date: null,
    cask_number: null,
    initial_brix: cs24_3_meta.initial_brix ?? null,
    initial_ph: cs24_3_meta.initial_ph ?? null,
    yeast_type: cs24_3_meta.yeast_type ?? null,
    substrate_type: cs24_3_meta.substrate_type ?? null,
    boiler_volume_l: cs24_3_meta.boiler_volume_l ?? null,
    boiler_abv_percent: cs24_3_meta.boiler_abv_percent ?? null
  }

  const cs241Entries = prodBatches.filter(b => (b.product_group || '').toUpperCase() === 'CS-24-1')
  const cs24_1_meta = getCsGroupMeta('CS-24-1')
  const cs241FermentationDate = cs241Entries.find(b => b.fermentation?.date_start)?.fermentation?.date_start || cs241Entries[0]?.date || null
  const cs241DistillationDate = (cs241Entries.find(b => (b as any).distillation)?.distillation as any)?.date || cs241FermentationDate
  const cs241TotalLalOut = (() => {
    const d = (cs241Entries.find(b => (b as any).distillation)?.distillation as any) || {}
    const v = d?.total_lal_out
    if (v === null || v === undefined) return null
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const m = v.match(/-?\d+(\.\d+)?/)
      return m ? Number(m[0]) : null
    }
    return null
  })()
  const cs241Summary: RumBatchSummary = {
    batch_id: 'CS-24-1',
    product_name: 'Cane Spirit — CS-24-1',
    product_type: 'cane_spirit',
    status: 'completed',
    still_used: 'Carrie',
    fermentation_start_date: cs241FermentationDate || null,
    distillation_date: cs241DistillationDate || null,
    hearts_volume_l: null,
    hearts_abv_percent: null,
    hearts_lal: cs241TotalLalOut ?? null,
    fill_date: null,
    cask_number: null,
    initial_brix: cs24_1_meta.initial_brix ?? null,
    initial_ph: cs24_1_meta.initial_ph ?? null,
    yeast_type: cs24_1_meta.yeast_type ?? null,
    substrate_type: cs24_1_meta.substrate_type ?? null,
    boiler_volume_l: cs24_1_meta.boiler_volume_l ?? null,
    boiler_abv_percent: cs24_1_meta.boiler_abv_percent ?? null
  }

  const mergedMap = new Map<string, RumBatchSummary>()
  ;[...rumFromDataset, ...rumFromProductionJson, ...rumFromAppJson, ...caneSpiritCSSummary, rum25Summary, rum25002Summary, rum24008Summary, rum24009Summary, cs241Summary, cs242Summary, cs243Summary].forEach((b) => {
    mergedMap.set(b.batch_id, b)
  })

  const merged = Array.from(mergedMap.values())
  return merged.sort((a, b) => {
    const aDate = a.distillation_date ?? a.fermentation_start_date ?? ''
    const bDate = b.distillation_date ?? b.fermentation_start_date ?? ''
    return bDate.localeCompare(aDate)
  })
}
