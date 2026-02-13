import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'

function getSupabase() {
  try {
    return createServiceRoleClient()
  } catch {
    return null
  }
}

/**
 * POST /api/production/runs
 * 
 * Actions:
 *   - create: Create a new production run (draft)
 *   - update_step: Update step_payload for a run
 *   - save_draft: Save all current wizard data as draft
 *   - finalize: Validate and finalize the run, creating a batches row
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase() || await createClient()
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create':
        return handleCreate(supabase, body)
      case 'update_step':
        return handleUpdateStep(supabase, body)
      case 'save_draft':
        return handleSaveDraft(supabase, body)
      case 'finalize':
        return handleFinalize(supabase, body)
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error in POST /api/production/runs:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/production/runs?id=xxx  — fetch a single run
 * GET /api/production/runs?status=draft — fetch all drafts
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase() || await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')

    if (id) {
      const { data, error } = await supabase
        .from('distillation_runs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      return NextResponse.json(data)
    }

    if (status) {
      const { data, error } = await supabase
        .from('distillation_runs')
        .select('*')
        .eq('status', status)
        .order('updated_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json(data || [])
    }

    return NextResponse.json({ error: 'Provide ?id= or ?status= parameter' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// ─── Action Handlers ───────────────────────────────────────────────

async function handleCreate(supabase: any, body: any) {
  const {
    batch_id,
    product_type = 'gin',
    product_name,
    recipe_id,
    date,
    still_used = 'Carrie',
    organization_id,
    step_payload = {},
  } = body

  if (!batch_id) {
    return NextResponse.json({ error: 'batch_id is required' }, { status: 400 })
  }

  const displayName = product_name || `${batch_id} (${product_type})`

  const { data, error } = await supabase
    .from('distillation_runs')
    .insert({
      batch_id,
      sku: batch_id,
      display_name: displayName,
      product_id: product_type,
      recipe_id: recipe_id || null,
      date: date || new Date().toISOString().split('T')[0],
      still_used,
      organization_id,
      status: 'draft',
      step_number: 0,
      step_payload,
      charge_components: [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating production run:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ run_id: data.id, batch_id: data.batch_id, ...data }, { status: 201 })
}

async function handleUpdateStep(supabase: any, body: any) {
  const { run_id, step_number, step_data } = body

  if (!run_id) {
    return NextResponse.json({ error: 'run_id is required' }, { status: 400 })
  }

  // Fetch current step_payload
  const { data: current, error: fetchError } = await supabase
    .from('distillation_runs')
    .select('step_payload')
    .eq('id', run_id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 })
  }

  const existingPayload = current.step_payload || {}
  const stepKey = `step_${step_number}`
  const updatedPayload = { ...existingPayload, [stepKey]: step_data }

  const { data, error } = await supabase
    .from('distillation_runs')
    .update({
      step_payload: updatedPayload,
      step_number: Math.max(step_number, current.step_number || 0),
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', run_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

async function handleSaveDraft(supabase: any, body: any) {
  const { run_id, step_payload, columns } = body

  if (!run_id) {
    return NextResponse.json({ error: 'run_id is required' }, { status: 400 })
  }

  // Build update object: always save step_payload, optionally save flattened columns
  const updateObj: any = {
    updated_at: new Date().toISOString(),
  }

  if (step_payload !== undefined) {
    updateObj.step_payload = step_payload
  }

  // Allow saving flattened columns directly (charge, cuts, dilution, etc.)
  if (columns && typeof columns === 'object') {
    const allowedColumns = [
      'batch_id', 'display_name', 'sku', 'product_id', 'recipe_id',
      'date', 'still_used', 'step_number',
      'charge_components', 'charge_total_volume_l', 'charge_total_abv_percent', 'charge_total_lal',
      'botanicals', 'steeping_start_time', 'steeping_end_time', 'steeping_temp_c',
      'boiler_on_time', 'power_setting', 'heating_elements', 'plates', 'deflegmator',
      'foreshots_volume_l', 'foreshots_abv_percent', 'foreshots_lal',
      'heads_volume_l', 'heads_abv_percent', 'heads_lal',
      'hearts_volume_l', 'hearts_abv_percent', 'hearts_lal',
      'tails_volume_l', 'tails_abv_percent', 'tails_lal',
      'hearts_segments', 'tails_segments',
      'dilution_steps', 'final_output_volume_l', 'final_output_abv_percent', 'final_output_lal',
      'notes',
    ]
    for (const key of allowedColumns) {
      if (columns[key] !== undefined) {
        updateObj[key] = columns[key]
      }
    }
  }

  const { data, error } = await supabase
    .from('distillation_runs')
    .update(updateObj)
    .eq('id', run_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

async function handleFinalize(supabase: any, body: any) {
  const { run_id, final_data } = body

  if (!run_id) {
    return NextResponse.json({ error: 'run_id is required' }, { status: 400 })
  }

  // Fetch the run
  const { data: run, error: fetchError } = await supabase
    .from('distillation_runs')
    .select('*')
    .eq('id', run_id)
    .single()

  if (fetchError || !run) {
    return NextResponse.json({ error: 'Production run not found' }, { status: 404 })
  }

  // Merge final_data columns into the run
  const finalColumns: any = {}
  if (final_data) {
    const allowedColumns = [
      'charge_components', 'charge_total_volume_l', 'charge_total_abv_percent', 'charge_total_lal',
      'botanicals', 'steeping_start_time', 'steeping_end_time', 'steeping_temp_c',
      'boiler_on_time', 'power_setting', 'heating_elements', 'plates', 'deflegmator',
      'foreshots_volume_l', 'foreshots_abv_percent', 'foreshots_lal',
      'heads_volume_l', 'heads_abv_percent', 'heads_lal',
      'hearts_volume_l', 'hearts_abv_percent', 'hearts_lal',
      'tails_volume_l', 'tails_abv_percent', 'tails_lal',
      'hearts_segments', 'tails_segments',
      'dilution_steps', 'final_output_volume_l', 'final_output_abv_percent', 'final_output_lal',
      'notes',
    ]
    for (const key of allowedColumns) {
      if (final_data[key] !== undefined) {
        finalColumns[key] = final_data[key]
      }
    }
  }

  // Validation: must have batch_id and some output data
  const errors: string[] = []
  const batchId = run.batch_id
  if (!batchId) errors.push('Missing batch_id')

  const finalVol = finalColumns.final_output_volume_l ?? run.final_output_volume_l
  const finalAbv = finalColumns.final_output_abv_percent ?? run.final_output_abv_percent
  const heartsVol = finalColumns.hearts_volume_l ?? run.hearts_volume_l

  if (!finalVol && !heartsVol) {
    errors.push('Missing final output volume or hearts volume')
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
  }

  // Calculate LAL if missing
  let finalLal = finalColumns.final_output_lal ?? run.final_output_lal
  if (!finalLal && finalVol && finalAbv) {
    finalLal = Number((finalVol * (finalAbv / 100)).toFixed(3))
    finalColumns.final_output_lal = finalLal
  }

  // Update the distillation_runs row to finalized
  const { error: updateError } = await supabase
    .from('distillation_runs')
    .update({
      ...finalColumns,
      status: 'finalized',
      updated_at: new Date().toISOString(),
    })
    .eq('id', run_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Determine final metrics for the batch
  const batchFinalVol = finalVol || heartsVol || 0
  const batchFinalAbv = finalAbv || (finalColumns.hearts_abv_percent ?? run.hearts_abv_percent) || 0
  const batchFinalLal = finalLal || (batchFinalVol * (batchFinalAbv / 100))

  // Calculate bottle count
  const bottleSizeMl = final_data?.bottle_size_ml || 700
  const bottleCount = batchFinalVol > 0 ? Math.floor((batchFinalVol * 1000) / bottleSizeMl) : null

  // Create or update the batches row
  const { data: existingBatch } = await supabase
    .from('batches')
    .select('id')
    .eq('production_run_id', run_id)
    .maybeSingle()

  const batchRecord = {
    organization_id: run.organization_id,
    production_run_id: run_id,
    batch_code: batchId,
    product_name: run.display_name || run.sku || batchId,
    product_type: run.product_id || 'gin',
    recipe_id: run.recipe_id || null,
    status: 'final',
    date: run.date || new Date().toISOString().split('T')[0],
    still_used: run.still_used,
    final_volume_l: batchFinalVol,
    final_abv_percent: batchFinalAbv,
    final_lal: Number(batchFinalLal.toFixed(3)),
    bottle_count: bottleCount,
    bottle_size_ml: bottleSizeMl,
    notes: finalColumns.notes ?? run.notes,
    updated_at: new Date().toISOString(),
  }

  let batchResult
  if (existingBatch?.id) {
    batchResult = await supabase
      .from('batches')
      .update(batchRecord)
      .eq('id', existingBatch.id)
      .select()
      .single()
  } else {
    batchResult = await supabase
      .from('batches')
      .insert(batchRecord)
      .select()
      .single()
  }

  if (batchResult.error) {
    console.error('Error creating/updating batch:', batchResult.error)
    return NextResponse.json({
      error: `Run finalized but batch creation failed: ${batchResult.error.message}`,
      run_id,
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    run_id,
    batch_id: batchResult.data.id,
    batch_code: batchId,
    final_volume_l: batchFinalVol,
    final_abv_percent: batchFinalAbv,
    final_lal: Number(batchFinalLal.toFixed(3)),
    bottle_count: bottleCount,
  })
}
