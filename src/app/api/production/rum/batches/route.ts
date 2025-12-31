import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
import { RumCaneSpiritBatch } from '@/types/production-schemas'

export const runtime = 'nodejs'

// GET - List all rum batches
export async function GET(request: NextRequest) {
  try {
    let supabase: any
    try {
      supabase = createServiceRoleClient()
    } catch {
      supabase = await createClient()
    }
    
    const { data, error } = await supabase
      .from('rum_production_runs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rum batches:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/production/rum/batches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new rum batch
export async function POST(request: NextRequest) {
  try {
    let supabase: any
    try {
      supabase = createServiceRoleClient()
    } catch {
      supabase = await createClient()
    }
    const batch: RumCaneSpiritBatch = await request.json()

    // Helper to ensure numeric values are actually numbers or null
    const ensureNumber = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null
      const num = typeof value === 'string' ? parseFloat(value) : value
      return isNaN(num) ? null : num
    }

    // Map TypeScript interface to database columns
    const dbRecord = {
      // Basic Info - REQUIRED FIELDS
      batch_id: batch.batch_name || batch.id || `DRAFT-RUM-${Date.now()}`,
      product_name: batch.product_name || batch.batch_name || 'Rum',
      product_type: batch.productType || 'rum',
      still_used: batch.still_used || 'Roberta',
      status: batch.status || 'draft',
      notes: batch.notes || null,

      // Stage-based Status
      fermentation_status: batch.fermentation_status || 'not_started',
      distillation_status: batch.distillation_status || 'not_started',
      aging_status: batch.aging_status || 'not_started',
      bottling_status: batch.bottling_status || 'not_started',
      overall_status: batch.overall_status || 'draft',

      // Fermentation
      batch_name: batch.batch_name || null,
      fermentation_date: batch.fermentation_date || null,
      fermentation_day: ensureNumber(batch.fermentation_day),
      substrates: batch.substrates ?? [],
      water_volume_l: ensureNumber(batch.water_volume_l),

      // Dunder
      dunder_batch: batch.dunder_batch || null,
      dunder_volume_l: ensureNumber(batch.dunder_volume_l),
      dunder_ph: ensureNumber(batch.dunder_ph),

      // Initial Conditions
      initial_brix: ensureNumber(batch.initial_brix),
      initial_ph: ensureNumber(batch.initial_ph),
      initial_temperature_c: ensureNumber(batch.initial_temperature_c),
      temperature_control_settings: batch.temperature_control_settings || null,

      // Yeast
      yeast_type: batch.yeast_type || null,
      yeast_mass_g: ensureNumber(batch.yeast_mass_g),
      yeast_rehydration_temperature_c: ensureNumber(batch.yeast_rehydration_temperature_c),
      yeast_rehydration_time_min: ensureNumber(batch.yeast_rehydration_time_min),

      // Chemicals & Nutrients
      chems_added: batch.chems_added || null,
      nutrients_added: batch.nutrients_added || null,

      // Fermentation Monitoring
      fermentation_readings: batch.fermentation_readings ?? [],

      // Final Fermentation
      final_brix: ensureNumber(batch.final_brix),
      final_ph: ensureNumber(batch.final_ph),
      calculated_abv_percent: ensureNumber(batch.calculated_abv_percent),

      // Distillation
      distillation_date: batch.distillation_date || null,

      // Boiler
      boiler_volume_l: ensureNumber(batch.boiler_volume_l),
      boiler_abv_percent: ensureNumber(batch.boiler_abv_percent),
      boiler_lal: ensureNumber(batch.boiler_lal),

      // Heads Added to Boiler
      heads_added_volume_l: ensureNumber(batch.heads_added_volume_l),
      heads_added_abv_percent: ensureNumber(batch.heads_added_abv_percent),
      heads_added_lal: ensureNumber(batch.heads_added_lal),

      // Retorts
      retort1_content: batch.retort1_content || null,
      retort1_volume_l: ensureNumber(batch.retort1_volume_l),
      retort1_abv_percent: ensureNumber(batch.retort1_abv_percent),
      retort1_lal: ensureNumber(batch.retort1_lal),
      retort2_content: batch.retort2_content || null,
      retort2_volume_l: ensureNumber(batch.retort2_volume_l),
      retort2_abv_percent: ensureNumber(batch.retort2_abv_percent),
      retort2_lal: ensureNumber(batch.retort2_lal),

      // Power & Timing
      power_input_boiler_a: ensureNumber(batch.power_input_boiler_a),
      still_heat_starting_time: batch.still_heat_starting_time || null,
      power_input_r1_a: ensureNumber(batch.power_input_r1_a),
      r1_heat_starting_time: batch.r1_heat_starting_time || null,
      power_input_r2_a: ensureNumber(batch.power_input_r2_a),
      r2_heat_starting_time: batch.r2_heat_starting_time || null,

      // First Spirit
      first_spirit_pot_temperature_c: ensureNumber(batch.first_spirit_pot_temperature_c),
      r1_temperature_c: ensureNumber(batch.r1_temperature_c),
      r2_temperature_c: ensureNumber(batch.r2_temperature_c),
      first_spirit_time: batch.first_spirit_time || null,
      first_spirit_abv_percent: ensureNumber(batch.first_spirit_abv_percent),
      first_spirit_density: ensureNumber(batch.first_spirit_density),

      // Power Adjustments & Flow
      power_input_pot_a: ensureNumber(batch.power_input_pot_a),
      r1_power_input_a: ensureNumber(batch.r1_power_input_a),
      r2_power_input_a: ensureNumber(batch.r2_power_input_a),
      flow_l_per_h: ensureNumber(batch.flow_l_per_h),

      // Foreshots
      foreshots_volume_l: ensureNumber(batch.foreshots_volume_l),

      // Heads Cut
      heads_cut_time: batch.heads_cut_time || null,
      heads_cut_abv_percent: ensureNumber(batch.heads_cut_abv_percent),
      heads_cut_volume_l: ensureNumber(batch.heads_cut_volume_l),
      heads_cut_lal: ensureNumber(batch.heads_cut_lal),
      heads_cut_density: ensureNumber(batch.heads_cut_density),

      // Hearts Cut
      hearts_cut_time: batch.hearts_cut_time || null,
      hearts_cut_density: ensureNumber(batch.hearts_cut_density),
      hearts_cut_abv_percent: ensureNumber(batch.hearts_cut_abv_percent),
      hearts_volume_l: ensureNumber(batch.hearts_volume_l),
      hearts_abv_percent: ensureNumber(batch.hearts_abv_percent),
      hearts_lal: ensureNumber(batch.hearts_lal),
      hearts_density: ensureNumber(batch.hearts_density),
      power_input_changed_to: ensureNumber(batch.power_input_changed_to),

      // Early Tails
      early_tails_cut_time: batch.early_tails_cut_time || null,
      early_tails_cut_abv_percent: ensureNumber(batch.early_tails_cut_abv_percent),
      early_tails_total_abv_percent: ensureNumber(batch.early_tails_total_abv_percent),
      early_tails_volume_l: ensureNumber(batch.early_tails_volume_l),
      early_tails_lal: ensureNumber(batch.early_tails_lal),
      early_tails_density: ensureNumber(batch.early_tails_density),
      power_input_changed_to_2: ensureNumber(batch.power_input_changed_to_2),

      // Late Tails
      late_tails_cut_time: batch.late_tails_cut_time || null,
      late_tails_cut_abv_percent: ensureNumber(batch.late_tails_cut_abv_percent),
      late_tails_total_abv_percent: ensureNumber(batch.late_tails_total_abv_percent),
      late_tails_volume_l: ensureNumber(batch.late_tails_volume_l),
      late_tails_lal: ensureNumber(batch.late_tails_lal),
      late_tails_density: ensureNumber(batch.late_tails_density),

      // Dilution
      water_added_for_dilution_l: ensureNumber(batch.water_added_for_dilution_l),
      final_abv_after_dilution_percent: ensureNumber(batch.final_abv_after_dilution_percent),
      final_volume_after_dilution_l: ensureNumber(batch.final_volume_after_dilution_l),

      // Barrel Aging
      barrel_aging_batch_name: batch.barrel_aging_batch_name || null,
      fill_date: batch.fill_date || null,
      cask_number: batch.cask_number || null,
      cask_type: batch.cask_type || null,
      cask_size_l: ensureNumber(batch.cask_size_l),
      fill_abv_percent: ensureNumber(batch.fill_abv_percent),
      volume_filled_l: ensureNumber(batch.volume_filled_l),
      lal_filled: ensureNumber(batch.lal_filled),
      maturation_location: batch.maturation_location || null,
      expected_bottling_date: batch.expected_bottling_date || null,
      barrel_aging_notes: batch.barrel_aging_notes || null,

      // Timestamps
      created_at: batch.createdAt || new Date().toISOString(),
      updated_at: batch.lastEditedAt || new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('rum_production_runs')
      .insert(dbRecord)
      .select()
      .single()

    if (error) {
      console.error('Error creating rum batch:', error)
      console.error('Batch data being inserted:', JSON.stringify(dbRecord, null, 2))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/production/rum/batches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
