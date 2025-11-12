export type NullableNumber = number | null
export type NullableString = string | null

export interface FermentationSubstrate {
  material: NullableString
  batch: NullableString
  mass_kg: NullableNumber
  water_mass_kg: NullableNumber
  initial_brix: NullableNumber
  initial_ph: NullableNumber
}

export interface FermentationDunder {
  added: boolean | null
  type: NullableString
  volume_l: NullableNumber
  ph: NullableNumber
}

export interface FermentationAdditives {
  anti_foam_ml: NullableNumber
  citric_acid_g: NullableNumber
  fermaid_g: NullableNumber
  dap_g: NullableNumber
  calcium_carbonate_g: NullableNumber
  additional_nutrients: NullableString
}

export interface FermentationYeast {
  strain: NullableString
  mass_g: NullableNumber
  rehydration_temp_c: NullableNumber
  rehydration_time_min: NullableNumber
}

export interface FermentationStage {
  start_date: NullableString
  substrate: FermentationSubstrate
  dunder: FermentationDunder
  additives: FermentationAdditives
  yeast: FermentationYeast
  temperature_curve: Record<string, number>
  brix_curve: Record<string, number>
  ph_curve: Record<string, number>
  duration_hours: NullableNumber
  final_brix: NullableNumber
  final_ph: NullableNumber
  final_abv_percent: NullableNumber
  notes: NullableString
}

export interface DistillationBoiler {
  volume_l: NullableNumber
  abv_percent: NullableNumber
  lal: NullableNumber
}

export interface DistillationRetort {
  id: number
  content: NullableString
  volume_l: NullableNumber
  abv_percent: NullableNumber
  lal: NullableNumber
  notes?: NullableString
}

export interface DistillationHeatProfile {
  start_time: NullableString
  boiler_elements: NullableString
  retort1_elements: NullableString
  retort2_elements: NullableString
}

export interface DistillationCutDetail {
  time: NullableString
  volume_l: NullableNumber
  abv_percent: NullableNumber
  lal: NullableNumber
  density?: NullableNumber
  notes?: NullableString
}

export interface DistillationCuts {
  foreshots: {
    time: NullableString
    abv_percent: NullableNumber
    notes?: NullableString
  }
  heads: DistillationCutDetail
  hearts: DistillationCutDetail
  tails_segments: DistillationCutDetail[]
}

export interface DistillationYield {
  total_lal_start: NullableNumber
  total_lal_end: NullableNumber
  lal_loss: NullableNumber
}

export interface DistillationStage {
  date: NullableString
  boiler: DistillationBoiler
  retorts: DistillationRetort[]
  heat_profile: DistillationHeatProfile
  cuts: DistillationCuts
  yield: DistillationYield
  notes: NullableString
}

export interface AgingCask {
  number: NullableString
  origin: NullableString
  type: NullableString
  size_l: NullableNumber
}

export interface AgingStage {
  fill_date: NullableString
  cask: AgingCask
  fill_abv_percent: NullableNumber
  volume_filled_l: NullableNumber
  lal_filled: NullableNumber
  maturation_location: NullableString
  expected_bottling_date: NullableString
  notes?: NullableString
}

export interface RunMetrics {
  lal_efficiency_percent: NullableNumber
  heart_fraction_percent: NullableNumber
}

export interface RunMetadata {
  created_at: NullableString
  updated_at: NullableString
  created_by: NullableString
}

export interface RunSensors {
  temperature_probe: NullableString
  ph_meter: NullableString
}

export interface RunProductInfo {
  name: string
  type: 'rum' | 'cane_spirit'
}

export type RunType = 'primary' | 'supplemental' | 'topup'

export interface RumProductionRunDB {
  id?: string
  batch_id: string
  run_type: RunType
  run_index: number
  product: RunProductInfo
  still_used: string
  fermentation: FermentationStage
  distillation: DistillationStage | null
  aging?: AgingStage | null
  metrics?: RunMetrics
  metadata?: RunMetadata
  sensors?: RunSensors
  raw_log: string
}


