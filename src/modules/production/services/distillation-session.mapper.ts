/**
 * Maps distillation_runs DB rows to DistillationSession UI type.
 * Used by batch-overview and other pages that need the rich session format.
 */

import type {
  DistillationSession,
  ChargeDetails,
  ChargeComponent,
  BotanicalUsage,
  OutputPhase,
  DilutionStep,
  FinalOutput,
} from '../types/distillation-session.types'

/**
 * Convert a distillation_runs DB row to a DistillationSession object.
 *
 * @param row - Raw row from the distillation_runs table
 * @returns A DistillationSession suitable for UI rendering and cost calculation
 */
export function mapDbRowToSession(row: any): DistillationSession {
  const chargeComponents: ChargeComponent[] = Array.isArray(row.charge_components)
    ? row.charge_components.map((c: any) => ({
        source: c.source || c.name || 'Unknown',
        volume_L: toNum(c.volume_l ?? c.volume_L),
        abv_percent: toNum(c.abv_percent),
        lal: toNum(c.lal),
        type: normalizeChargeType(c.type),
      }))
    : []

  const charge: ChargeDetails | undefined = chargeComponents.length > 0
    ? {
        components: chargeComponents,
        total: {
          volume_L: toNum(row.charge_total_volume_l),
          abv_percent: toNum(row.charge_total_abv_percent),
          lal: toNum(row.charge_total_lal),
        },
      }
    : undefined

  const botanicals: BotanicalUsage[] = Array.isArray(row.botanicals)
    ? row.botanicals.map((b: any) => ({
        name: b.name || 'Unknown',
        weightG: toNum(b.weight_g ?? b.weightG),
        notes: b.notes || undefined,
        ratio_percent: toNum(b.ratio_percent) ?? undefined,
      }))
    : []

  const outputs: OutputPhase[] = buildOutputPhases(row)

  const dilutions: DilutionStep[] = Array.isArray(row.dilution_steps)
    ? row.dilution_steps.map((d: any, i: number) => ({
        stepNo: d.step ?? d.number ?? i + 1,
        date: d.date || null,
        newMakeL: toNum(d.new_make_l ?? d.newMake_L ?? d.new_make_L),
        waterL: toNum(d.filtered_water_l ?? d.filteredWater_L ?? d.water_l),
        finalVolumeL: toNum(d.new_volume_l ?? d.newVolume_L ?? d.final_volume_l),
        finalABV: toNum(d.abv_percent ?? d.final_abv_percent ?? d.finalAbv_percent),
        lal: toNum(d.lal) ?? undefined,
        notes: d.notes || undefined,
      }))
    : []

  const finalOutput: FinalOutput | undefined =
    row.final_output_volume_l != null
      ? {
          totalVolume_L: toNum(row.final_output_volume_l),
          lal: toNum(row.final_output_lal),
          finalAbv_percent: toNum(row.final_output_abv_percent),
          notes: '',
        }
      : undefined

  const totalBotanicals_g = botanicals.reduce(
    (sum, b) => sum + (b.weightG ?? 0),
    0
  )
  const chargeLAL = toNum(row.charge_total_lal) ?? 0
  const heartsLAL = toNum(row.hearts_lal) ?? 0

  return {
    id: row.batch_id || row.id,
    spiritRun: row.batch_id,
    sku: row.sku || row.display_name || 'Unknown',
    date: row.date || '',
    still: row.still_used || 'Unknown',
    boilerOn: row.boiler_on_time ? String(row.boiler_on_time).substring(0, 5) : '06:00',
    chargeVolumeL: toNum(row.charge_total_volume_l),
    chargeABV: toNum(row.charge_total_abv_percent),
    chargeLAL: toNum(row.charge_total_lal),
    lalIn: chargeLAL,
    lalOut: heartsLAL,
    lalEfficiency: chargeLAL > 0 ? Number(((heartsLAL / chargeLAL) * 100).toFixed(1)) : null,
    powerA: 0,
    elementsKW: parseElementsKW(row.heating_elements),
    charge,
    botanicals,
    totalBotanicals_g: totalBotanicals_g > 0 ? totalBotanicals_g : null,
    botanicalsPerLAL: heartsLAL > 0 && totalBotanicals_g > 0
      ? Number((totalBotanicals_g / heartsLAL).toFixed(1))
      : null,
    outputs,
    dilutions: dilutions.length > 0 ? dilutions : undefined,
    finalOutput,
    notes: row.notes || undefined,
  }
}

/**
 * Map multiple DB rows to DistillationSession array.
 */
export function mapDbRowsToSessions(rows: any[]): DistillationSession[] {
  return rows.map(mapDbRowToSession)
}

// --- Helpers ---

function toNum(v: any): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizeChargeType(type: string | undefined): ChargeComponent['type'] {
  if (!type) return 'other'
  const t = type.toLowerCase()
  if (t.includes('ethanol') || t === 'ngs') return 'ethanol'
  if (t.includes('dilution') || t.includes('water')) return 'water'
  return 'other'
}

function buildOutputPhases(row: any): OutputPhase[] {
  const phases: OutputPhase[] = []
  if (row.foreshots_volume_l != null) {
    phases.push({
      name: 'Foreshots',
      volumeL: toNum(row.foreshots_volume_l),
      abv: toNum(row.foreshots_abv_percent),
      lal: toNum(row.foreshots_lal),
    })
  }
  if (row.heads_volume_l != null) {
    phases.push({
      name: 'Heads',
      volumeL: toNum(row.heads_volume_l),
      abv: toNum(row.heads_abv_percent),
      lal: toNum(row.heads_lal),
    })
  }
  if (row.hearts_volume_l != null) {
    phases.push({
      name: 'Hearts',
      volumeL: toNum(row.hearts_volume_l),
      abv: toNum(row.hearts_abv_percent),
      lal: toNum(row.hearts_lal),
    })
  }
  if (row.tails_volume_l != null) {
    phases.push({
      name: 'Tails',
      volumeL: toNum(row.tails_volume_l),
      abv: toNum(row.tails_abv_percent),
      lal: toNum(row.tails_lal),
    })
  }
  return phases
}

/**
 * Parse heating_elements string to extract total kW.
 * Examples: "5750W * 5", "5750 ×1, 2200 ×1, 2400 ×1", "2 new ones"
 */
function parseElementsKW(value: string | null | undefined): number {
  if (!value) return 0
  const matches = value.match(/(\d+)\s*[Ww]/g)
  if (!matches || matches.length === 0) return 0
  let totalW = 0
  for (const m of matches) {
    const watts = parseInt(m, 10)
    if (!isNaN(watts)) totalW += watts
  }
  return totalW / 1000
}
