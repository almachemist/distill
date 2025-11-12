import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RumCaneSpiritBatch } from '@/types/production-schemas'

// GET - List all rum batches
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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
    const supabase = await createClient()
    const batch: RumCaneSpiritBatch = await request.json()

    // Map TypeScript interface to database columns
    const dbRecord = {
      // Basic Info
      batch_id: batch.id,
      batch_name: batch.batch_name,
      product_name: batch.product_name ?? batch.batch_name,
      product_type: batch.productType,
      still_used: batch.still_used ?? 'Roberta',
      status: batch.status ?? 'draft',
      notes: batch.notes,
      
      // Fermentation
      fermentation_date: batch.fermentation_date,
      fermentation_day: batch.fermentation_day,
      substrates: batch.substrates ?? [],
      water_volume_l: batch.water_volume_l,
      
      // Dunder
      dunder_batch: batch.dunder_batch,
      dunder_volume_l: batch.dunder_volume_l,
      dunder_ph: batch.dunder_ph,
      
      // Initial Conditions
      initial_brix: batch.initial_brix,
      initial_ph: batch.initial_ph,
      initial_temperature_c: batch.initial_temperature_c,
      temperature_control_settings: batch.temperature_control_settings,
      
      // Yeast
      yeast_type: batch.yeast_type,
      yeast_mass_g: batch.yeast_mass_g,
      yeast_rehydration_temperature_c: batch.yeast_rehydration_temperature_c,
      yeast_rehydration_time_min: batch.yeast_rehydration_time_min,
      
      // Chemicals & Nutrients
      chems_added: batch.chems_added,
      nutrients_added: batch.nutrients_added,
      
      // Fermentation Monitoring
      fermentation_readings: batch.fermentation_readings ?? [],
      
      // Final Fermentation
      final_brix: batch.final_brix,
      final_ph: batch.final_ph,
      calculated_abv_percent: batch.calculated_abv_percent,
      
      // Distillation
      distillation_date: batch.distillation_date,
      
      // Boiler
      boiler_volume_l: batch.boiler_volume_l,
      boiler_abv_percent: batch.boiler_abv_percent,
      boiler_lal: batch.boiler_lal,
      
      // Heads Added to Boiler
      heads_added_volume_l: batch.heads_added_volume_l,
      heads_added_abv_percent: batch.heads_added_abv_percent,
      heads_added_lal: batch.heads_added_lal,
      
      // Retorts
      retort1_content: batch.retort1_content,
      retort1_volume_l: batch.retort1_volume_l,
      retort1_abv_percent: batch.retort1_abv_percent,
      retort1_lal: batch.retort1_lal,
      retort2_content: batch.retort2_content,
      retort2_volume_l: batch.retort2_volume_l,
      retort2_abv_percent: batch.retort2_abv_percent,
      retort2_lal: batch.retort2_lal,
      
      // Power & Timing
      power_input_boiler_a: batch.power_input_boiler_a,
      still_heat_starting_time: batch.still_heat_starting_time,
      power_input_r1_a: batch.power_input_r1_a,
      r1_heat_starting_time: batch.r1_heat_starting_time,
      power_input_r2_a: batch.power_input_r2_a,
      r2_heat_starting_time: batch.r2_heat_starting_time,
      
      // First Spirit
      first_spirit_pot_temperature_c: batch.first_spirit_pot_temperature_c,
      r1_temperature_c: batch.r1_temperature_c,
      r2_temperature_c: batch.r2_temperature_c,
      first_spirit_time: batch.first_spirit_time,
      first_spirit_abv_percent: batch.first_spirit_abv_percent,
      first_spirit_density: batch.first_spirit_density,
      
      // Power Adjustments & Flow
      power_input_pot_a: batch.power_input_pot_a,
      r1_power_input_a: batch.r1_power_input_a,
      r2_power_input_a: batch.r2_power_input_a,
      flow_l_per_h: batch.flow_l_per_h,
      
      // Foreshots
      foreshots_volume_l: batch.foreshots_volume_l,
      
      // Heads Cut
      heads_cut_time: batch.heads_cut_time,
      heads_cut_abv_percent: batch.heads_cut_abv_percent,
      heads_cut_volume_l: batch.heads_cut_volume_l,
      heads_cut_lal: batch.heads_cut_lal,
      heads_cut_density: batch.heads_cut_density,
      
      // Hearts Cut
      hearts_cut_time: batch.hearts_cut_time,
      hearts_cut_density: batch.hearts_cut_density,
      hearts_cut_abv_percent: batch.hearts_cut_abv_percent,
      hearts_volume_l: batch.hearts_volume_l,
      hearts_abv_percent: batch.hearts_abv_percent,
      hearts_lal: batch.hearts_lal,
      hearts_density: batch.hearts_density,
      power_input_changed_to: batch.power_input_changed_to,
      
      // Early Tails
      early_tails_cut_time: batch.early_tails_cut_time,
      early_tails_cut_abv_percent: batch.early_tails_cut_abv_percent,
      early_tails_total_abv_percent: batch.early_tails_total_abv_percent,
      early_tails_volume_l: batch.early_tails_volume_l,
      early_tails_lal: batch.early_tails_lal,
      early_tails_density: batch.early_tails_density,
      power_input_changed_to_2: batch.power_input_changed_to_2,
      
      // Late Tails
      late_tails_cut_time: batch.late_tails_cut_time,
      late_tails_cut_abv_percent: batch.late_tails_cut_abv_percent,
      late_tails_total_abv_percent: batch.late_tails_total_abv_percent,
      late_tails_volume_l: batch.late_tails_volume_l,
      late_tails_lal: batch.late_tails_lal,
      late_tails_density: batch.late_tails_density,
      
      // Dilution
      water_added_for_dilution_l: batch.water_added_for_dilution_l,
      final_abv_after_dilution_percent: batch.final_abv_after_dilution_percent,
      final_volume_after_dilution_l: batch.final_volume_after_dilution_l,
      
      // Barrel Aging
      barrel_aging_batch_name: batch.barrel_aging_batch_name,
      fill_date: batch.fill_date,
      cask_number: batch.cask_number,
      cask_type: batch.cask_type,
      cask_size_l: batch.cask_size_l,
      fill_abv_percent: batch.fill_abv_percent,
      volume_filled_l: batch.volume_filled_l,
      lal_filled: batch.lal_filled,
      maturation_location: batch.maturation_location,
      expected_bottling_date: batch.expected_bottling_date,
      barrel_aging_notes: batch.barrel_aging_notes,
      
      // Timestamps
      created_at: batch.createdAt,
      updated_at: batch.updatedAt,
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

