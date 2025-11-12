import type { BatchesDataset, BatchNew, Product } from "@/modules/production/new-model/types/batch.types"
import { computeBatchKpi } from "@/modules/production/new-model/services/lal.service"

export type GroupDim = "product" | "category"

export interface GroupAggregate {
  key: string
  label: string
  n_batches: number
  n_complete: number
  charge_lal_sum: number
  hearts_lal_sum: number
  heads_lal_sum: number
  tails_lal_sum: number
  out_lal_sum: number
  losses_lal_sum: number
  hearts_recovery_pct_aggregate: number | null
  total_recovery_pct_aggregate: number | null
  losses_pct_aggregate: number | null
  flags: string[]
  bad_still_count: number
  roberta_count: number
}

function round1(n: number): number { return Math.round(n * 10) / 10 }

function productsMap(dataset: BatchesDataset): Map<string, Product> {
  const m = new Map<string, Product>()
  for (const p of dataset.products) m.set(p.product_id, p)
  return m
}

export function flattenBatchesForYear(dataset: BatchesDataset, year: number): BatchNew[] {
  const prefix = `${year}-`
  const out: BatchNew[] = []
  for (const [k, list] of Object.entries(dataset.batches_by_month)) {
    if (k.startsWith(prefix)) out.push(...list)
  }
  return out
}

export function filterByStill(batches: BatchNew[], still: string): { filtered: BatchNew[]; mismatched: BatchNew[] } {
  const filtered: BatchNew[] = []
  const mismatched: BatchNew[] = []
  for (const b of batches) {
    if ((b.still_used || "").toLowerCase() === still.toLowerCase()) filtered.push(b)
    else mismatched.push(b)
  }
  return { filtered, mismatched }
}

export function aggregate(dataset: BatchesDataset, year: number, still: string, dim: GroupDim): GroupAggregate[] {
  const pm = productsMap(dataset)
  const yearBatches = flattenBatchesForYear(dataset, year)
  const { filtered, mismatched } = filterByStill(yearBatches, still)

  const groups = new Map<string, GroupAggregate>()

  function groupKeyLabel(b: BatchNew): { key: string; label: string } {
    if (dim === "product") {
      const p = pm.get(b.product_id)
      return { key: b.product_id, label: p?.display_name || b.sku || b.product_id }
    } else {
      const p = pm.get(b.product_id)
      return { key: p?.category || "uncategorized", label: p?.category || "Uncategorized" }
    }
  }

  function ensure(key: string, label: string): GroupAggregate {
    if (!groups.has(key)) {
      groups.set(key, {
        key, label,
        n_batches: 0, n_complete: 0,
        charge_lal_sum: 0,
        hearts_lal_sum: 0,
        heads_lal_sum: 0,
        tails_lal_sum: 0,
        out_lal_sum: 0,
        losses_lal_sum: 0,
        hearts_recovery_pct_aggregate: null,
        total_recovery_pct_aggregate: null,
        losses_pct_aggregate: null,
        flags: [],
        bad_still_count: 0,
        roberta_count: 0,
      })
    }
    return groups.get(key) as GroupAggregate
  }

  // Count mismatches to the special key '*all*' and also to each group's bad_still_count when present
  const mismatchSet = new Set<string>(mismatched.map(m => m.batch_id))

  for (const b of filtered) {
    const { key, label } = groupKeyLabel(b)
    const g = ensure(key, label)
    g.n_batches += 1

    const k = computeBatchKpi(b)

    // Accumulate only when all required values present
    const complete = k.charge_lal != null && k.hearts_lal != null && k.heads_lal != null && k.tails_lal != null && k.out_lal != null && k.losses_lal != null
    if (complete) {
      g.n_complete += 1
      g.charge_lal_sum += k.charge_lal as number
      g.hearts_lal_sum += k.hearts_lal as number
      g.heads_lal_sum += k.heads_lal as number
      g.tails_lal_sum += k.tails_lal as number
      g.out_lal_sum += k.out_lal as number
      g.losses_lal_sum += k.losses_lal as number
    } else {
      // propagate KPI incomplete flag
      if (!g.flags.includes("kpi_incomplete_data")) g.flags.push("kpi_incomplete_data")
    }
    // carry over service flags (dedup)
    for (const f of k.flags) if (!g.flags.includes(f)) g.flags.push(f)
  }

  // post compute ratios from sums
  for (const g of groups.values()) {
    if (g.charge_lal_sum > 0) {
      const heartsPct = (g.hearts_lal_sum / g.charge_lal_sum) * 100
      const totalPct = (g.out_lal_sum / g.charge_lal_sum) * 100
      const lossesPct = 100 - totalPct
      g.hearts_recovery_pct_aggregate = round1(heartsPct)
      g.total_recovery_pct_aggregate = round1(totalPct)
      g.losses_pct_aggregate = round1(lossesPct)
    } else {
      if (!g.flags.includes("kpi_incomplete_data")) g.flags.push("kpi_incomplete_data")
    }
    // add still mismatch counts per group (count all mismatches overall for visibility)
    g.bad_still_count = mismatched.length
    const robCount = mismatched.filter(m => (m.still_used || '').toLowerCase() === 'roberta').length
    g.roberta_count = robCount
    if (mismatched.length > 0 && !g.flags.includes("still_mismatch")) g.flags.push("still_mismatch")
    if (robCount > 0 && !g.flags.includes("roberta_mislabel")) g.flags.push("roberta_mislabel")
  }

  return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label))
}

export function aggregateByProduct(dataset: BatchesDataset, year: number, still: string): GroupAggregate[] {
  return aggregate(dataset, year, still, "product")
}

export function aggregateByCategory(dataset: BatchesDataset, year: number, still: string): GroupAggregate[] {
  return aggregate(dataset, year, still, "category")
}
