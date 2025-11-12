import type { BatchNew, CutPhase, Cuts, HeartsSegment, TailsSegment } from "@/modules/production/new-model/types/batch.types"

export type LalFlag =
  | "missing_abv"
  | "missing_volume"
  | "needs_density_conversion"
  | "lal_discrepancy"
  | "spreadsheet_error"
  | "kpi_incomplete_data"

export interface LalResult {
  value: number | null
  flags: LalFlag[]
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function calcLal(volume_l?: number | null, abv_percent?: number | null, existing_lal?: number | null, density?: number | null): LalResult {
  // 1) Use existing LAL if present
  if (existing_lal != null) return { value: existing_lal, flags: [] }
  // 2) If Volume + ABV exist → compute
  if (volume_l != null && abv_percent != null) {
    return { value: round1(volume_l * (abv_percent / 100)), flags: [] }
  }
  // 3) If ABV missing
  if (volume_l != null && (abv_percent == null || Number.isNaN(abv_percent))) {
    const flags: LalFlag[] = ["missing_abv"]
    if (density != null && (abv_percent == null || Number.isNaN(abv_percent))) flags.push("needs_density_conversion")
    return { value: null, flags }
  }
  // 4) If Volume missing
  return { value: null, flags: ["missing_volume"] }
}

export function sumSegmentsLal(segments: Array<{ volume_l?: number | null; abv_percent?: number | null; lal?: number | null; density?: number | null }>): LalResult {
  let total = 0
  const flags: LalFlag[] = []
  for (const seg of segments) {
    const r = calcLal(seg.volume_l ?? null, seg.abv_percent ?? null, seg.lal ?? null, (seg as any).density ?? null)
    if (r.value == null) flags.push(...r.flags)
    else total += r.value
  }
  return { value: round1(total), flags }
}

export function computeHeartsLal(cuts: Cuts): LalResult {
  // Prefer explicit hearts.lal if present
  const hearts = cuts.hearts
  const segs = cuts.hearts_segments || []
  // If hearts.lal exists, use it
  if (hearts?.lal != null) return { value: hearts.lal, flags: [] }
  // If hearts segments exist, sum their LALs (computing where possible)
  if (segs.length > 0) {
    return sumSegmentsLal(segs as HeartsSegment[])
  }
  // Else compute from hearts volume/abv
  return calcLal(hearts?.volume_l ?? null, hearts?.abv_percent ?? null, hearts?.lal ?? null, (hearts as any)?.density ?? null)
}

export function computeTailsLal(cuts: Cuts): LalResult {
  const tails = cuts.tails
  const segs = cuts.tails_segments || []
  // If segments exist → sum is authoritative
  if (segs.length > 0) {
    return sumSegmentsLal(segs as TailsSegment[])
  }
  // Else rely on single tails phase
  return calcLal(tails?.volume_l ?? null, tails?.abv_percent ?? null, tails?.lal ?? null, (tails as any)?.density ?? null)
}

export function computeHeadsLal(cuts: Cuts): LalResult {
  const heads = cuts.heads
  return calcLal(heads?.volume_l ?? null, heads?.abv_percent ?? null, heads?.lal ?? null, (heads as any)?.density ?? null)
}

export function computeForeshotsLal(cuts: Cuts): LalResult {
  const fs = cuts.foreshots
  return calcLal(fs?.volume_l ?? null, fs?.abv_percent ?? null, fs?.lal ?? null, (fs as any)?.density ?? null)
}

export interface BatchKpi {
  hearts_lal: number | null
  tails_lal: number | null
  heads_lal: number | null
  charge_lal: number | null
  out_lal: number | null
  losses_lal: number | null
  hearts_recovery_pct: number | null
  total_recovery_pct: number | null
  losses_pct: number | null
  heads_ratio_pct: number | null
  tails_ratio_pct: number | null
  flags: LalFlag[]
}

export function computeBatchKpi(batch: BatchNew): BatchKpi {
  const flags: LalFlag[] = []
  const charge_lal = batch.charge?.total?.lal ?? null
  const hearts = computeHeartsLal(batch.cuts)
  const tails = computeTailsLal(batch.cuts)
  const heads = computeHeadsLal(batch.cuts)

  let hearts_recovery_pct: number | null = null
  let total_recovery_pct: number | null = null
  let losses_pct: number | null = null
  let out_lal: number | null = null
  let losses_lal: number | null = null
  let heads_ratio_pct: number | null = null
  let tails_ratio_pct: number | null = null

  if (charge_lal == null || hearts.value == null || tails.value == null || heads.value == null) {
    flags.push("kpi_incomplete_data")
  } else {
    const totalOut = hearts.value + tails.value + heads.value
    out_lal = round1(totalOut)
    losses_lal = round1(charge_lal - totalOut)
    hearts_recovery_pct = round1((hearts.value / charge_lal) * 100)
    total_recovery_pct = round1((totalOut / charge_lal) * 100)
    losses_pct = round1(100 - total_recovery_pct)
    heads_ratio_pct = round1((heads.value / charge_lal) * 100)
    tails_ratio_pct = round1((tails.value / charge_lal) * 100)
  }

  return {
    hearts_lal: hearts.value,
    tails_lal: tails.value,
    heads_lal: heads.value,
    charge_lal,
    out_lal,
    losses_lal,
    hearts_recovery_pct,
    total_recovery_pct,
    losses_pct,
    heads_ratio_pct,
    tails_ratio_pct,
    flags: [...flags, ...hearts.flags, ...tails.flags, ...heads.flags],
  }
}

export function checkDilutionInvariance(batch: BatchNew): LalResult {
  // Dilution should not change LAL (Hearts → Final Output LAL)
  const hearts = computeHeartsLal(batch.cuts)
  const finalLal = batch.dilution?.combined?.final_output_run?.lal ?? null
  if (hearts.value == null || finalLal == null) return { value: null, flags: ["kpi_incomplete_data"] }
  const eps = 0.2 // tolerance for rounding
  if (Math.abs(hearts.value - finalLal) > eps) {
    return { value: finalLal, flags: ["lal_discrepancy"] }
  }
  return { value: finalLal, flags: [] }
}

export type CutKey = "foreshots" | "heads" | "hearts" | "tails"

export function applyLalOnCutUpdate(batch: BatchNew, cutKey: CutKey, updates: Partial<CutPhase>): BatchNew {
  // Pure function: returns a new batch object with LAL applied according to rules
  const next: BatchNew = JSON.parse(JSON.stringify(batch)) as BatchNew
  const target = (next.cuts as any)[cutKey] as CutPhase
  const merged: CutPhase = { ...target, ...updates }
  ;(next.cuts as any)[cutKey] = merged

  // Recompute this cut's LAL if needed (preserve existing if present)
  const r = calcLal(merged.volume_l ?? null, merged.abv_percent ?? null, merged.lal ?? null, (merged as any)?.density ?? null)
  if (merged.lal == null) {
    merged.lal = r.value
  }

  // If tails updated and has segments, ensure tails.lal reflects sum of segments per rule
  if (cutKey === "tails") {
    const segs = next.cuts.tails_segments || []
    if (segs.length > 0) {
      const s = sumSegmentsLal(segs)
      next.cuts.tails.lal = s.value
    }
  }

  // If hearts have segments, set hearts.lal as sum of segments if hearts.lal is null
  if (next.cuts.hearts_segments && next.cuts.hearts_segments.length > 0 && (next.cuts.hearts.lal == null)) {
    const s = sumSegmentsLal(next.cuts.hearts_segments)
    next.cuts.hearts.lal = s.value
  }

  return next
}
