import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { buildRumBatchFallback } from '@/modules/production/services/batch-fallback.service'

export const runtime = 'nodejs'

// Helper to check if string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// GET - Get single rum batch by ID (can be id or batch_id)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const flag = (process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase()
    const useStaticOverride = flag === '1' || flag === 'true' || flag === 'yes'
    if (useStaticOverride) {
      const { id } = await context.params
      const fallbackBatches = buildRumBatchFallback()
      const fallbackBatch = fallbackBatches.find((b: any) => b.batch_id === id || b.id === id)
      if (fallbackBatch) return NextResponse.json(fallbackBatch)
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }
    const supabase = await createClient()
    const { id } = await context.params

    let data = null
    let error = null

    // Try to find by id first (only if it's a valid UUID)
    if (isValidUUID(id)) {
      const result = await supabase
        .from('rum_production_runs')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      data = result.data
      error = result.error
    }

    // If not found by id, try by batch_id
    if (!data && !error) {
      const result = await supabase
        .from('rum_production_runs')
        .select('*')
        .eq('batch_id', id)
        .maybeSingle()

      data = result.data
      error = result.error
    }

    // If found in database, return it
    if (data && !error) {
      return NextResponse.json(data)
    }

    // If not found in database, try fallback data
    const fallbackBatches = buildRumBatchFallback()
    const fallbackBatch = fallbackBatches.find((b: any) => b.batch_id === id || b.id === id)

    if (fallbackBatch) {
      return NextResponse.json(fallbackBatch)
    }

    // Not found anywhere
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  } catch (error) {
    console.error('Error in GET /api/production/rum/batches/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update rum batch
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    const batch: RumCaneSpiritBatch = await request.json()

    // Helper to ensure numeric values are actually numbers or null
    const ensureNumber = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null
      const num = typeof value === 'string' ? parseFloat(value) : value
      return isNaN(num) ? null : num
    }

    // Map TypeScript interface to database columns
    const dbRecord = {
      // Basic Info
      batch_id: batch.batch_name || id, // Use batch_name or the URL id parameter
      batch_name: batch.batch_name,
      product_name: batch.product_name ?? batch.batch_name,
      product_type: batch.productType,
      still_used: batch.still_used ?? 'Roberta',
      status: batch.status ?? 'draft',
      notes: batch.notes,

      // Stage-based Status
      fermentation_status: batch.fermentation_status ?? 'not_started',
      distillation_status: batch.distillation_status ?? 'not_started',
      aging_status: batch.aging_status ?? 'not_started',
      bottling_status: batch.bottling_status ?? 'not_started',
      overall_status: batch.overall_status ?? 'draft',

      // Fermentation
      fermentation_date: batch.fermentation_date,
      fermentation_day: ensureNumber(batch.fermentation_day),
      substrates: batch.substrates ?? [],
      water_volume_l: ensureNumber(batch.water_volume_l),

      // Dunder
      dunder_batch: batch.dunder_batch,
      dunder_volume_l: ensureNumber(batch.dunder_volume_l),
      dunder_ph: ensureNumber(batch.dunder_ph),

      // Initial Conditions
      initial_brix: ensureNumber(batch.initial_brix),
      initial_ph: ensureNumber(batch.initial_ph),
      initial_temperature_c: ensureNumber(batch.initial_temperature_c),
      temperature_control_settings: batch.temperature_control_settings,

      // Yeast
      yeast_type: batch.yeast_type,
      yeast_mass_g: ensureNumber(batch.yeast_mass_g),
      yeast_rehydration_temperature_c: ensureNumber(batch.yeast_rehydration_temperature_c),
      yeast_rehydration_time_min: ensureNumber(batch.yeast_rehydration_time_min),

      // Chemicals & Nutrients
      chems_added: batch.chems_added,
      nutrients_added: batch.nutrients_added,

      // Fermentation Monitoring
      fermentation_readings: batch.fermentation_readings ?? [],

      // Final Fermentation
      final_brix: ensureNumber(batch.final_brix),
      final_ph: ensureNumber(batch.final_ph),
      calculated_abv_percent: ensureNumber(batch.calculated_abv_percent),
      
      // Distillation
      distillation_date: batch.distillation_date,

      // Boiler
      boiler_volume_l: ensureNumber(batch.boiler_volume_l),
      boiler_abv_percent: ensureNumber(batch.boiler_abv_percent),
      boiler_lal: ensureNumber(batch.boiler_lal),

      // Heads Added to Boiler
      heads_added_volume_l: ensureNumber(batch.heads_added_volume_l),
      heads_added_abv_percent: ensureNumber(batch.heads_added_abv_percent),
      heads_added_lal: ensureNumber(batch.heads_added_lal),

      // Retorts
      retort1_content: batch.retort1_content,
      retort1_volume_l: ensureNumber(batch.retort1_volume_l),
      retort1_abv_percent: ensureNumber(batch.retort1_abv_percent),
      retort1_lal: ensureNumber(batch.retort1_lal),
      retort2_content: batch.retort2_content,
      retort2_volume_l: ensureNumber(batch.retort2_volume_l),
      retort2_abv_percent: ensureNumber(batch.retort2_abv_percent),
      retort2_lal: ensureNumber(batch.retort2_lal),
      
      // Power & Timing
      power_input_boiler_a: ensureNumber(batch.power_input_boiler_a),
      still_heat_starting_time: batch.still_heat_starting_time,
      power_input_r1_a: ensureNumber(batch.power_input_r1_a),
      r1_heat_starting_time: batch.r1_heat_starting_time,
      power_input_r2_a: ensureNumber(batch.power_input_r2_a),
      r2_heat_starting_time: batch.r2_heat_starting_time,

      // First Spirit
      first_spirit_pot_temperature_c: ensureNumber(batch.first_spirit_pot_temperature_c),
      r1_temperature_c: ensureNumber(batch.r1_temperature_c),
      r2_temperature_c: ensureNumber(batch.r2_temperature_c),
      first_spirit_time: batch.first_spirit_time,
      first_spirit_abv_percent: ensureNumber(batch.first_spirit_abv_percent),
      first_spirit_density: ensureNumber(batch.first_spirit_density),

      // Power Adjustments & Flow
      power_input_pot_a: ensureNumber(batch.power_input_pot_a),
      r1_power_input_a: ensureNumber(batch.r1_power_input_a),
      r2_power_input_a: ensureNumber(batch.r2_power_input_a),
      flow_l_per_h: ensureNumber(batch.flow_l_per_h),

      // Foreshots
      foreshots_volume_l: ensureNumber(batch.foreshots_volume_l),
      foreshots_abv_percent: ensureNumber(batch.foreshots_abv_percent),

      // Heads Cut
      heads_cut_time: batch.heads_cut_time,
      heads_cut_abv_percent: ensureNumber(batch.heads_cut_abv_percent),
      heads_cut_volume_l: ensureNumber(batch.heads_cut_volume_l),
      heads_cut_lal: ensureNumber(batch.heads_cut_lal),
      heads_cut_density: ensureNumber(batch.heads_cut_density),

      // Hearts Cut
      hearts_cut_time: batch.hearts_cut_time,
      hearts_cut_density: ensureNumber(batch.hearts_cut_density),
      hearts_cut_abv_percent: ensureNumber(batch.hearts_cut_abv_percent),
      hearts_volume_l: ensureNumber(batch.hearts_volume_l),
      hearts_abv_percent: ensureNumber(batch.hearts_abv_percent),
      hearts_lal: ensureNumber(batch.hearts_lal),
      hearts_density: ensureNumber(batch.hearts_density),
      power_input_changed_to: ensureNumber(batch.power_input_changed_to),

      // Early Tails
      early_tails_cut_time: batch.early_tails_cut_time,
      early_tails_cut_abv_percent: ensureNumber(batch.early_tails_cut_abv_percent),
      early_tails_total_abv_percent: ensureNumber(batch.early_tails_total_abv_percent),
      early_tails_volume_l: ensureNumber(batch.early_tails_volume_l),
      early_tails_lal: ensureNumber(batch.early_tails_lal),
      early_tails_density: ensureNumber(batch.early_tails_density),
      power_input_changed_to_2: ensureNumber(batch.power_input_changed_to_2),

      // Late Tails
      late_tails_cut_time: batch.late_tails_cut_time,
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
      barrel_aging_batch_name: batch.barrel_aging_batch_name,
      fill_date: batch.fill_date,
      cask_number: batch.cask_number,
      cask_type: batch.cask_type,
      cask_size_l: ensureNumber(batch.cask_size_l),
      fill_abv_percent: ensureNumber(batch.fill_abv_percent),
      volume_filled_l: ensureNumber(batch.volume_filled_l),
      lal_filled: ensureNumber(batch.lal_filled),
      maturation_location: batch.maturation_location,
      expected_bottling_date: batch.expected_bottling_date,
      barrel_aging_notes: batch.barrel_aging_notes,

      // Timestamps
      updated_at: new Date().toISOString(),
    }

    console.log('📝 Mapped dbRecord:', JSON.stringify(dbRecord, null, 2))

    let data = null
    let error = null

    console.log('🔍 PUT request for id:', id, 'isValidUUID:', isValidUUID(id))

    // Try to update existing record by id (only if it's a valid UUID)
    if (isValidUUID(id)) {
      console.log('  → Trying to update by id (UUID)...')
      const result = await supabase
        .from('rum_production_runs')
        .update(dbRecord)
        .eq('id', id)
        .select()
        .maybeSingle()

      data = result.data
      error = result.error
      console.log('  → Result:', data ? 'Updated successfully' : 'Not found', error ? `Error: ${error.message}` : '')

      // If there's an error updating by UUID, return the error immediately
      if (error) {
        console.error('Error updating rum batch by UUID:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // If UUID is valid but record not found, return 404
      if (!data) {
        console.error('Batch not found by UUID:', id)
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
      }
    } else {
      // If not a UUID, try by batch_id
      console.log('  → Trying to update by batch_id...')
      const result = await supabase
        .from('rum_production_runs')
        .update(dbRecord)
        .eq('batch_id', id)
        .select()
        .maybeSingle()

      data = result.data
      error = result.error
      console.log('  → Result:', data ? 'Updated successfully' : 'Not found', error ? `Error: ${error.message}` : '')

      // If there's an error, return it
      if (error) {
        console.error('Error updating rum batch by batch_id:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // If record doesn't exist, insert it (for fallback batches only - when id is not a UUID)
      if (!data) {
        console.log('  → Record not found, inserting new record...')
        const insertRecord = {
          ...dbRecord,
          // Don't set id - let Supabase generate a UUID
          // The batch_id field will contain the user-friendly ID
          created_at: new Date().toISOString(),
        }

        console.log('  → Insert record batch_id:', insertRecord.batch_id)

        const insertResult = await supabase
          .from('rum_production_runs')
          .insert(insertRecord)
          .select()
          .single()

        data = insertResult.data
        error = insertResult.error
        console.log('  → Insert result:', data ? 'Success' : 'Failed', error ? `Error: ${error.message}` : '')

        if (error) {
          console.error('Error inserting rum batch:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
    }

    // If we got here, data should be set
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/production/rum/batches/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete rum batch (by id or batch_id)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    console.log('🗑️ DELETE request for id:', id, 'isValidUUID:', isValidUUID(id))

    let error = null

    // Try to delete by id first (only if it's a valid UUID)
    if (isValidUUID(id)) {
      console.log('  → Trying to delete by id (UUID)...')
      const result = await supabase
        .from('rum_production_runs')
        .delete()
        .eq('id', id)

      error = result.error

      if (!error) {
        console.log('  → Deleted successfully by id')
        return NextResponse.json({ success: true })
      }
    }

    // If not deleted by id, try by batch_id
    console.log('  → Trying to delete by batch_id...')
    const result = await supabase
      .from('rum_production_runs')
      .delete()
      .eq('batch_id', id)

    error = result.error

    if (error) {
      console.error('Error deleting rum batch:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('  → Deleted successfully by batch_id')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/production/rum/batches/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
