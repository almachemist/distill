/**
 * PRODUCTION TEMPLATES
 * 
 * Initial templates for creating new production batches.
 * These are cloned when user selects "New Production" and chooses a product type.
 */

import {
  GinVodkaSpiritBatch,
  RumCaneSpiritBatch,
  ProductType,
} from '@/types/production-schemas';

// ============================================================================
// GIN / VODKA / SPIRIT TEMPLATE
// ============================================================================

export function createGinVodkaSpiritTemplate(
  productType: 'gin' | 'vodka' | 'other' = 'gin'
): Partial<GinVodkaSpiritBatch> {
  const now = new Date().toISOString();
  
  return {
    status: 'draft',
    productType,
    createdAt: now,
    lastEditedAt: now,
    
    // Basic Info
    spiritRunId: '',
    sku: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    stillUsed: '',
    description: '',
    notes: '',
    boilerOn: '',
    
    // Charge
    chargeAdjustment: {
      total: {
        volume_L: 0,
        abv_percent: 0,
        lal: 0,
      },
      components: [],
    },
    
    // Botanicals (for gin)
    botanicals: [],
    totalBotanicals_g: 0,
    totalBotanicals_percent: 0,
    botanicalsPerLAL: 0,
    
    // Still Setup
    stillSetup: {
      elements: '',
      plates: 'Zero plates',
      steeping: '',
      options: '',
    },
    
    // Distillation Run
    runData: [],
    
    // Output Fractions
    output: [],
    
    // Total Run
    totalRun: {
      volume_L: 0,
      abv_percent: null,
      lal: null,
      notes: '',
    },
    
    // Dilutions
    dilutions: [],
    
    // Final Output
    finalOutput: {
      totalVolume_L: 0,
      abv_percent: 0,
      lal: null,
      notes: '',
    },
  };
}

// ============================================================================
// RUM / CANE SPIRIT TEMPLATE
// ============================================================================

export function createRumCaneSpiritTemplate(
  productType: 'rum' | 'cane_spirit' = 'rum'
): Partial<RumCaneSpiritBatch> {
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  
  return ({
    status: 'draft',
    productType,
    createdAt: now,
    lastEditedAt: now,
    
    // Basic Info
    batch_name: '',
    still_used: '',
    notes: '',
    
    // Fermentation
    fermentation_date: today,
    substrate_type: '',
    substrate_batch: '',
    substrate_mass_kg: 0,
    water_mass_kg: 0,
    initial_brix: 0,
    initial_ph: 0,
    
    // Dunder
    dunder_added: false,
    dunder_type: '',
    dunder_volume_l: 0,
    dunder_ph: 0,
    
    // Additives
    anti_foam_ml: 0,
    antifoam_added: false,
    citric_acid_g: 0,
    fermaid_g: 0,
    dap_g: 0,
    calcium_carbonate_g: 0,
    additional_nutrients: '',
    
    // Yeast
    yeast_type: '',
    yeast_mass_g: 0,
    yeast_rehydration_temp_c: 0,
    yeast_rehydration_time_min: 0,
    
    // Fermentation Curves
    temperature_curve: {
      start: 0,
      '24h': 0,
      '48h': 0,
      '72h': 0,
      '96h': 0,
      '120h': 0,
    },
    brix_curve: {
      start: 0,
      '24h': 0,
      '48h': 0,
      '72h': 0,
      '96h': 0,
      '120h': 0,
    },
    ph_curve: {
      start: 0,
      '24h': 0,
      '48h': 0,
      '72h': 0,
      '96h': 0,
      '120h': 0,
    },
    
    // Fermentation Results
    fermentation_duration_hours: 0,
    final_brix: 0,
    final_ph: 0,
    final_abv_percent: 0,
    fermentation_notes: '',
    
    // Distillation
    distillation_date: today,
    boiler_volume_l: 0,
    boiler_abv_percent: 0,
    boiler_lal: 0,
    
    // Retorts
    retort1_content: '',
    retort1_volume_l: 0,
    retort1_abv_percent: 0,
    retort1_lal: 0,
    retort2_content: '',
    retort2_volume_l: 0,
    retort2_abv_percent: 0,
    retort2_lal: 0,
    
    // Elements
    boiler_elements: '',
    retort1_elements: '',
    retort2_elements: '',
    
    // Distillation Times
    distillation_start_time: '09:00:00',
    foreshots_time: '',
    heads_time: '',
    hearts_time: '',
    
    // Cuts
    foreshots_volume_l: 0,
    foreshots_abv_percent: 0,
    foreshots_notes: '',
    
    heads_volume_l: 0,
    heads_abv_percent: 0,
    heads_lal: 0,
    heads_notes: '',
    
    hearts_volume_l: 0,
    hearts_abv_percent: 0,
    hearts_lal: 0,
    hearts_notes: '',
    
    // Tails
    tails_volume_l: 0,
    tails_abv_percent: 0,
    early_tails_volume_l: 0,
    early_tails_abv_percent: 0,
    late_tails_volume_l: 0,
    late_tails_abv_percent: 0,
    tails_segments: [],
    
    // LAL Tracking
    total_lal_start: 0,
    total_lal_end: 0,
    lal_loss: 0,
    heart_yield_percent: 0,
    distillation_notes: '',
    
    // Maturation
    output_product_name: productType === 'rum' ? 'Rum' : 'Cane Spirit',
    fill_date: '',
    cask_number: '',
    cask_origin: '',
    cask_type: '',
    cask_size_l: 0,
    fill_abv_percent: 0,
    volume_filled_l: 0,
    lal_filled: 0,
    maturation_location: '',
    expected_bottling_date: '',
  }) as unknown as Partial<RumCaneSpiritBatch>;
}

// ============================================================================
// TEMPLATE FACTORY
// ============================================================================

export function createProductionTemplate(productType: ProductType): Partial<GinVodkaSpiritBatch | RumCaneSpiritBatch> {
  switch (productType) {
    case 'gin':
      return createGinVodkaSpiritTemplate('gin');
    case 'vodka':
      return createGinVodkaSpiritTemplate('vodka');
    case 'rum':
      return createRumCaneSpiritTemplate('rum');
    case 'cane_spirit':
      return createRumCaneSpiritTemplate('cane_spirit');
    case 'liqueur':
    case 'other':
      return createGinVodkaSpiritTemplate('other');
    default:
      return createGinVodkaSpiritTemplate('gin');
  }
}

// ============================================================================
// FIELD METADATA FOR DYNAMIC FORMS
// ============================================================================

export interface FieldMetadata {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'boolean';
  unit?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  section?: string;
  helpText?: string;
}

// This will be expanded to include all fields with their metadata
// for dynamic form generation
export const GIN_VODKA_FIELDS: FieldMetadata[] = [
  // Basic Info
  { key: 'spiritRunId', label: 'Spirit Run ID', type: 'text', required: true, section: 'Basic Info' },
  { key: 'sku', label: 'Product Name (SKU)', type: 'text', required: true, section: 'Basic Info' },
  { key: 'date', label: 'Production Date', type: 'date', required: true, section: 'Basic Info' },
  { key: 'stillUsed', label: 'Still Used', type: 'select', required: true, section: 'Basic Info', options: [
    { value: 'Roberta', label: 'Roberta' },
    { value: 'Carrie', label: 'Carrie' },
    { value: 'CP-270', label: 'CP-270' },
    { value: 'CP-270-1', label: 'CP-270-1' },
  ]},
  { key: 'boilerOn', label: 'Boiler On Time', type: 'time', section: 'Basic Info' },
  { key: 'description', label: 'Description', type: 'textarea', section: 'Basic Info' },
  { key: 'notes', label: 'Notes', type: 'textarea', section: 'Basic Info' },
  
  // Charge - will be handled separately as nested object
  // Botanicals - will be handled as array
  // Still Setup - will be handled as nested object
  // etc.
];

export const RUM_CANE_FIELDS: FieldMetadata[] = [
  // Basic Info
  { key: 'batch_id', label: 'Batch ID', type: 'text', required: true, section: 'Basic Info' },
  { key: 'product_name', label: 'Product Name', type: 'text', required: true, section: 'Basic Info' },
  { key: 'still_used', label: 'Still Used', type: 'select', required: true, section: 'Basic Info', options: [
    { value: 'Roberta', label: 'Roberta' },
    { value: 'Carrie', label: 'Carrie' },
  ]},
  
  // Fermentation
  { key: 'fermentation_start_date', label: 'Fermentation Start Date', type: 'date', required: true, section: 'Fermentation' },
  { key: 'substrate_type', label: 'Substrate Type', type: 'text', required: true, section: 'Fermentation' },
  { key: 'substrate_mass_kg', label: 'Substrate Mass', type: 'number', unit: 'kg', section: 'Fermentation' },
  { key: 'water_mass_kg', label: 'Water Mass', type: 'number', unit: 'kg', section: 'Fermentation' },
  { key: 'initial_brix', label: 'Initial Brix', type: 'number', unit: '°Bx', section: 'Fermentation' },
  { key: 'initial_ph', label: 'Initial pH', type: 'number', step: 0.01, section: 'Fermentation' },
  
  // etc.
];

