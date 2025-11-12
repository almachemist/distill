/**
 * PRODUCTION SCHEMAS - MASTER DESIGN
 * 
 * Based on REAL data structures from Supabase:
 * - production_batches (Gin/Vodka/Spirits)
 * - rum_production_runs (Rum/Cane Spirit)
 * 
 * These schemas define the structure for the dynamic Production tab,
 * allowing progressive creation and editing of batches.
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export type ProductionStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type ProductType = 
  | 'gin' 
  | 'vodka' 
  | 'rum' 
  | 'cane_spirit' 
  | 'liqueur'
  | 'other';

export interface BaseProductionBatch {
  id?: string;
  status: ProductionStatus;
  productType: ProductType;
  createdAt: string;
  lastEditedAt: string;
  createdBy?: string;
}

// ============================================================================
// GIN / VODKA / SPIRITS SCHEMA
// Based on production_batches.data structure
// ============================================================================

export interface BotanicalItem {
  id?: string;
  name: string;
  weight_g: number;
  ratio_percent: number;
  notes?: string;
}

export interface ChargeComponent {
  id?: string;
  type: 'ethanol' | 'dilution' | 'other';
  source: string;
  volume_L: number;
  abv_percent: number;
  lal: number;
}

export interface ChargeAdjustment {
  total: {
    volume_L: number;
    abv_percent: number;
    lal: number;
  };
  components: ChargeComponent[];
}

export interface StillSetup {
  elements: string;
  plates: string;
  steeping: string;
  options?: string;
}

export interface RunDataPoint {
  id?: string;
  time: string;
  phase: 'Foreshots' | 'Heads' | 'Hearts' | 'Tails';
  volume_L?: number;
  abv_percent?: number;
  headTemp_C?: number;
  condenserTemp_C?: number;
  ambientTemp_C?: number;
  observations?: string;
}

export interface OutputFraction {
  id?: string;
  date?: string;
  phase: 'Foreshots' | 'Heads' | 'Hearts' | 'Tails';
  volume_L: number;
  abv_percent: number;
  output: string;
  receivingVessel: string;
  volume_percent?: number;
}

export interface DilutionStep {
  id?: string;
  number: number;
  date: string;
  newMake_L: number;
  filteredWater_L: number;
  newVolume_L: number;
  abv_percent: number;
  temperature_C?: number;
  notes?: string;
}

export interface TotalRun {
  volume_L: number;
  abv_percent: number | null;
  lal: number | null;
  notes?: string;
}

export interface FinalOutput {
  totalVolume_L: number;
  abv_percent: number;
  lal: number | null;
  notes?: string;
}

export interface GinVodkaSpiritBatch extends BaseProductionBatch {
  productType: 'gin' | 'vodka' | 'other';

  // Recipe Reference
  recipeName?: string;
  recipeId?: string;

  // Basic Info
  spiritRunId: string;
  sku: string;
  date: string;
  stillUsed: string;
  description?: string;
  notes?: string;
  boilerOn?: string;
  boilerStartTime?: string;
  
  // Charge
  chargeAdjustment: ChargeAdjustment;
  
  // Botanicals (for gin)
  botanicals?: BotanicalItem[];
  totalBotanicals_g?: number;
  totalBotanicals_percent?: number;
  botanicalsPerLAL?: number;
  
  // Still Setup
  stillSetup: StillSetup;
  
  // Distillation Run
  runData: RunDataPoint[];
  
  // Output Fractions
  output: OutputFraction[];
  
  // Total Run
  totalRun: TotalRun;
  
  // Dilutions
  dilutions: DilutionStep[];
  targetFinalABV?: number;

  // Final Output
  finalOutput: FinalOutput;

  // Bottling
  bottlingDate?: string;
  bottleSize_ml?: number;
  totalBottles?: number;
}

// ============================================================================
// RUM / CANE SPIRIT SCHEMA
// Based on rum_production_runs table structure
// ============================================================================

export interface TemperatureCurve {
  start: number;
  '24h': number | string;
  '48h': number | string;
  '72h': number | string;
  '96h': number | string;
  '120h': number | string;
}

export interface BrixCurve {
  start: number;
  '24h': number | string;
  '48h': number | string;
  '72h': number | string;
  '96h': number | string;
  '120h': number | string;
}

export interface PhCurve {
  start: number;
  '24h': number | string;
  '48h': number | string;
  '72h': number | string;
  '96h': number | string;
  '120h': number | string;
}

export interface TailSegment {
  segment: 'early' | 'late';
  volume_l: number;
  abv_percent: number;
  lal?: number;
  notes?: string;
}

// ============================================================================
// SUBSTRATE ENTRY (for multiple substrate additions)
// ============================================================================

export interface SubstrateEntry {
  name: string; // e.g., "Cane Juice", "Molasses"
  batch_or_year?: string;
  volume_l: number;
}

// ============================================================================
// FERMENTATION MONITORING (24h, 48h, 72h, 96h, 120h)
// ============================================================================

export interface FermentationReading {
  hours: number; // 24, 48, 72, 96, 120
  temperature_c?: number;
  brix?: number;
  ph?: number;
}

// ============================================================================
// RUM / CANE SPIRIT BATCH (Complete Schema)
// ============================================================================

export interface RumCaneSpiritBatch extends BaseProductionBatch {
  productType: 'rum' | 'cane_spirit';

  // ========== FERMENTATION ==========

  // Basic Info
  batch_name: string; // Unique batch name that follows through all phases
  fermentation_date: string;
  fermentation_day?: number;

  // Substrates (can have multiple entries)
  substrates: SubstrateEntry[];

  // Water
  water_volume_l: number;

  // Dunder
  dunder_batch?: string;
  dunder_volume_l?: number;
  dunder_ph?: number;

  // Initial Conditions
  initial_brix: number;
  initial_ph: number;
  initial_temperature_c?: number;
  temperature_control_settings?: string;

  // Yeast
  yeast_type: string;
  yeast_mass_g: number;
  yeast_rehydration_temperature_c?: number;
  yeast_rehydration_time_min?: number;

  // Chemicals & Nutrients
  chems_added?: string;
  nutrients_added?: string;

  // Fermentation Monitoring (24h, 48h, 72h, 96h, 120h)
  fermentation_readings: FermentationReading[];

  // Final Fermentation
  final_brix: number;
  final_ph: number;

  // Calculated ABV (from Brix conversion)
  calculated_abv_percent?: number;

  // ========== DISTILLATION (Double Retort - Roberta) ==========

  distillation_date?: string;

  // Boiler
  boiler_volume_l?: number;
  boiler_abv_percent?: number;
  boiler_lal?: number; // Calculated: boiler_volume_l * boiler_abv_percent * 0.01

  // Heads added to boiler
  heads_added_volume_l?: number;
  heads_added_abv_percent?: number;
  heads_added_lal?: number; // Calculated

  // Retort 1 (Right)
  retort1_content?: string;
  retort1_volume_l?: number;
  retort1_abv_percent?: number;
  retort1_lal?: number; // Calculated

  // Retort 2 (Left)
  retort2_content?: string;
  retort2_volume_l?: number;
  retort2_abv_percent?: number;
  retort2_lal?: number; // Calculated

  // Power & Timing
  power_input_boiler_a?: number;
  still_heat_starting_time?: string;
  power_input_r1_a?: number;
  r1_heat_starting_time?: string;
  power_input_r2_a?: number;
  r2_heat_starting_time?: string;

  // First Spirit
  first_spirit_pot_temperature_c?: number;
  r1_temperature_c?: number;
  r2_temperature_c?: number;
  first_spirit_time?: string;
  first_spirit_abv_percent?: number;
  first_spirit_density?: number;

  // Power Adjustments during run
  power_input_pot_a?: number;
  r1_power_input_a?: number;
  r2_power_input_a?: number;
  flow_l_per_h?: number;

  // Foreshots
  foreshots_volume_l?: number;

  // Heads Cut
  heads_cut_time?: string;
  heads_cut_abv_percent?: number;
  heads_cut_volume_l?: number;
  heads_cut_lal?: number; // Calculated
  heads_cut_density?: number;

  // Hearts Cut
  hearts_cut_time?: string;
  hearts_cut_density?: number;
  hearts_cut_abv_percent?: number;
  hearts_volume_l?: number;
  hearts_abv_percent?: number;
  hearts_lal?: number; // Calculated
  hearts_density?: number;

  // Power change during hearts
  power_input_changed_to?: number;

  // Early Tails Cut
  early_tails_cut_time?: string;
  early_tails_cut_abv_percent?: number;
  early_tails_total_abv_percent?: number;
  early_tails_volume_l?: number;
  early_tails_lal?: number; // Calculated
  early_tails_density?: number;

  // Power change during early tails
  power_input_changed_to_2?: number;

  // Late Tails Cut
  late_tails_cut_time?: string;
  late_tails_cut_abv_percent?: number;
  late_tails_total_abv_percent?: number;
  late_tails_volume_l?: number;
  late_tails_lal?: number; // Calculated
  late_tails_density?: number;

  // ========== DILUTION ==========

  // Final Hearts volume and ABV are used for dilution calculator
  water_added_for_dilution_l?: number;
  final_abv_after_dilution_percent?: number;
  final_volume_after_dilution_l?: number;

  // ========== BARREL AGING ==========

  // Option 59 relates to proof for bottling or barrel aging
  barrel_aging_batch_name?: string; // Same as batch_name for tracking
  fill_date?: string;
  cask_number?: string;
  cask_type?: string;
  cask_size_l?: number;
  fill_abv_percent?: number;
  volume_filled_l?: number;
  lal_filled?: number;
  maturation_location?: string;
  expected_bottling_date?: string;
  barrel_aging_notes?: string;

  // Legacy fields (for backward compatibility)
  product_name?: string;
  still_used?: string;
  notes?: string;
}

// ============================================================================
// UNION TYPE FOR ALL PRODUCTION BATCHES
// ============================================================================

export type ProductionBatch = GinVodkaSpiritBatch | RumCaneSpiritBatch;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isGinVodkaSpiritBatch(batch: ProductionBatch): batch is GinVodkaSpiritBatch {
  return batch.productType === 'gin' || batch.productType === 'vodka' || batch.productType === 'other';
}

export function isRumCaneSpiritBatch(batch: ProductionBatch): batch is RumCaneSpiritBatch {
  return batch.productType === 'rum' || batch.productType === 'cane_spirit';
}

