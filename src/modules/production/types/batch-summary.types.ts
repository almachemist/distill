/**
 * Batch summary types used by production API routes.
 * Extracted from batch-fallback.service.ts during Phase 2 cleanup.
 */

export interface GinBatchSummary {
  run_id: string
  batch_id?: string
  recipe: string | null
  date: string | null
  still_used: string | null
  updated_at: string | null
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
