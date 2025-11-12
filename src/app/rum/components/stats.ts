import type { RumBatch } from "./types"

const formatter = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

function formatMaybeNumber(value: unknown, suffix = "") {
  if (value === null || value === undefined || value === "-") return "—"
  const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  if (Number.isNaN(numeric)) {
    return typeof value === "string" && value.trim().length > 0 ? value : "—"
  }
  return `${formatter.format(numeric)}${suffix}`
}

export function getBatchHeadlineStats(batch: RumBatch) {
  const firstRun = batch.distillation_runs?.[0]
  const summary = firstRun?.summary ?? {}

  const boilerAbv = formatMaybeNumber(firstRun?.boiler_abv_percent, "%")
  const lalIn = formatMaybeNumber(summary.lal_in)
  const lalOut = formatMaybeNumber(summary.lal_out)
  const heartYield = formatMaybeNumber(summary.heart_yield_percent, "%")

  return {
    boilerAbv,
    heartYield,
    lalInOut: lalIn === "—" && lalOut === "—" ? "—" : `${lalIn} → ${lalOut}`
  }
}
