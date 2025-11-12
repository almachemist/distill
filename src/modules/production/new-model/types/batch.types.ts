export type NullableNumber = number | null

export interface Product {
  product_id: string
  sku: string
  display_name: string
  category: string
  abv_targets?: {
    hearts_run_abv_target_percent?: NullableNumber
    bottling_abv_target_percent?: NullableNumber
  }
  default_still?: string
  status: string
}

export interface ChargeComponent {
  source: string
  volume_l: NullableNumber
  abv_percent: NullableNumber
  lal: NullableNumber
}

export interface ChargeTotal {
  volume_l: NullableNumber
  abv_percent: NullableNumber
  lal: NullableNumber
}

export interface Charge {
  components: ChargeComponent[]
  total: ChargeTotal
  notes?: string
}

export interface BotanicalItem {
  name: string
  prep?: string
  weight_g: NullableNumber
  ratio_percent?: NullableNumber
  time?: string
  phase?: string
}

export interface Botanicals {
  per_lal_g?: NullableNumber
  items: BotanicalItem[]
  steeping_notes?: string
  omitted_from_run?: string[]
}

export interface RunSummary {
  condenser_temp_c?: NullableNumber
  power_settings: string[]
  observations: string[]
}

export interface CutPhase {
  receiving_vessel?: string
  volume_l?: NullableNumber
  volume_percent?: NullableNumber
  abv_percent?: NullableNumber
  density?: NullableNumber
  lal?: NullableNumber
  time_start?: string
  notes?: string
}

export interface TailsSegment {
  date?: string
  volume_l?: NullableNumber
  abv_percent?: NullableNumber
  lal?: NullableNumber
  notes?: string
}

export interface HeartsSegment {
  time_start?: string
  volume_l?: NullableNumber
  abv_percent?: NullableNumber
  density?: NullableNumber
  lal?: NullableNumber
  notes?: string
}

export interface CutsTotalsLine {
  declared_total_run_volume_l?: NullableNumber
  declared_total_run_percent?: NullableNumber
  notes?: string
}

export interface Cuts {
  foreshots: CutPhase
  heads: CutPhase
  hearts: CutPhase
  tails: CutPhase
  tails_segments?: TailsSegment[]
  hearts_segments?: HeartsSegment[]
  totals_line_from_sheet?: CutsTotalsLine
}

export interface PhaseOutput {
  phase: string
  receiving_vessel?: string
  volume_l?: NullableNumber
  volume_percent?: NullableNumber
  abv_percent?: NullableNumber
  lal?: NullableNumber
}

export interface DilutionStep {
  step_id: string
  source_volume_l?: NullableNumber
  water_added_l?: NullableNumber
  new_volume_l?: NullableNumber
  target_abv_percent?: NullableNumber
  lal?: NullableNumber
  calculation_note?: string
}

export interface DilutionCombined {
  final_output_run: {
    new_make_l?: NullableNumber
    lal?: NullableNumber
    total_volume_l?: NullableNumber
  }
  notes?: string
}

export interface Dilution {
  instructions_note?: string
  steps: DilutionStep[]
  combined: DilutionCombined
}

export interface StillSetupNew {
  steeping_duration_hours?: NullableNumber
  steeped_items?: string[]
  heating_elements?: string[]
  condenser_temp_c?: NullableNumber
}

export interface Attachment {
  type: string
  label: string
  path: string
}

export interface DataIntegrity {
  source_sheet_cells_with_errors: string[]
  fields_with_nulls_due_to_missing_values: string[]
  error_cells?: string[]
}

export interface AuditInfo {
  created_at: string
  created_by: string
  last_edited_at: string
  editable: boolean
}

export interface BatchNew {
  batch_id: string
  product_id: string
  sku: string
  display_name: string
  date: string
  timezone?: string
  boiler_on_time?: string
  still_used: string
  charge: Charge
  botanicals?: Botanicals
  run_summary?: RunSummary
  cuts: Cuts
  phase_outputs?: PhaseOutput[]
  dilution?: Dilution
  still_setup?: StillSetupNew
  attachments?: Attachment[]
  data_integrity?: DataIntegrity
  audit?: AuditInfo
}

export interface BatchesDataset {
  products: Product[]
  batches_by_month: Record<string, BatchNew[]>
  ui_suggestions?: any
}
