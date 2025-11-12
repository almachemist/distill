export interface FermentationData {
  substrate?: string
  substrate_batch?: string
  substrate_mass_kg?: number | string
  water_mass_kg?: number | string
  antifoam_ml?: number | string
  additional_water_l?: number | string
  additional_substrate?: string | null
  brix_initial?: number | string
  actual_starting_brix?: number | string
  ph_initial?: number | string
  dunder?: string | null
  dunder_ph?: number | string
  chemicals?: string | null
  starting_temperature_c?: number | string
  fermaid_g?: number | string
  dap_g?: number | string
  calcium_carbonate_g?: number | string
  yeast_type?: string | null
  yeast_mass_g?: number | string
  yeast_rehydration_temp_c?: number | string
  yeast_rehydration_time_min?: number | string
  temperature_profile?: Record<string, number | string>
  brix_profile?: Record<string, number | string>
  ph_profile?: Record<string, number | string>
  final_brix?: number | string
  final_ph?: number | string
  notes?: string | null
  [key: string]: unknown
}

export interface DistillationCutPoint {
  time?: string
  phase?: string
  volume_l?: number | string | null
  abv_percent?: number | string | null
  lal?: number | string | null
  notes?: string | null
  [key: string]: unknown
}

export interface DistillationRun {
  date: string
  boiler_volume_l?: number | string | null
  boiler_abv_percent?: number | string | null
  boiler_lal?: number | string | null
  heads_addition?: Record<string, number | string | null>
  retort_1?: Record<string, number | string | null>
  retort_2?: Record<string, number | string | null>
  heating?: Record<string, number | string | null>
  first_spirit?: Record<string, number | string | null>
  cut_points?: DistillationCutPoint[]
  summary?: Record<string, number | string | null>
  notes?: string | null
  [key: string]: unknown
}

export interface CaskData {
  fill_date?: string
  cask_number?: string | number
  origin?: string | null
  fill_abv_percent?: number | string | null
  volume_filled_l?: number | string | null
  lal_filled?: number | string | null
  notes?: string | null
  [key: string]: unknown
}

export interface RumBatch {
  batch_id: string
  date: string
  day?: string
  product: string
  product_variant?: string
  fermentation: FermentationData
  distillation_runs: DistillationRun[]
  cask?: CaskData
  notes?: string | null
  [key: string]: unknown
}

export type RumDetailTab = 'fermentation' | 'distillation' | 'cask' | 'graphs' | 'notes'
