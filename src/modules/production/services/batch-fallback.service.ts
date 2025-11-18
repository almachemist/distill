import { batchesDataset } from "@/modules/production/new-model/data/batches.dataset"
import { rumBatchesDataset } from "@/modules/production/data/rum-batches.dataset"
import { signatureGinBatchSummaries } from "@/modules/production/data/signature-gin-batches"

export interface GinBatchSummary {
  run_id: string
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
}

const normalizeCarrieStill = (value?: string | null): string | null => {
  if (!value) return "Carrie"
  const normalized = value.toLowerCase()
  if (normalized.includes("carrie") || normalized.includes("cp-")) {
    return "Carrie"
  }
  return value
}

export function buildGinBatchFallback(): GinBatchSummary[] {
  const toSummary = (batch: GinBatchSummary): GinBatchSummary => ({
    ...batch,
    still_used: normalizeCarrieStill(batch.still_used)
  })

  const monthBuckets = Object.values(batchesDataset.batches_by_month ?? {})
  const allBatches = monthBuckets.flat()

  const datasetSummaries = allBatches
    .filter((batch) => (batch.product_id ?? batch.sku ?? "").toLowerCase().includes("gin"))
    .map((batch) => ({
      run_id: batch.batch_id,
      recipe: batch.display_name ?? batch.sku ?? null,
      date: batch.date ?? null,
      still_used: batch.still_used ?? null,
      updated_at: batch.audit?.last_edited_at ?? null
    }))

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

  const merged = new Map<string, GinBatchSummary>()

  datasetSummaries.forEach((batch) => {
    merged.set(batch.run_id, toSummary(batch))
  })

  signatureSummaries.forEach((batch) => {
    merged.set(batch.run_id, toSummary(batch))
  })

  return Array.from(merged.values()).sort((a, b) => {
    const aDate = a.date ?? ""
    const bDate = b.date ?? ""
    return bDate.localeCompare(aDate)
  })
}

export function buildRumBatchFallback(): RumBatchSummary[] {
  return rumBatchesDataset.map((batch) => {
    const hearts = batch.distillation?.cuts?.hearts

    return {
      batch_id: batch.batch_id,
      product_name: batch.product?.name ?? null,
      product_type: batch.product?.type ?? null,
      status: 'completed', // Fallback data is all completed
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
}
