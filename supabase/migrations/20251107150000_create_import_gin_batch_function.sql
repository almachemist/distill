-- Create a function to import a gin batch with all related data in a transaction
CREATE OR REPLACE FUNCTION public.import_gin_batch(
  p_batch_id TEXT,
  p_date DATE,
  p_still_used TEXT,
  p_charge_components JSONB,
  p_charge_total_volume_l NUMERIC,
  p_charge_total_abv_percent NUMERIC,
  p_charge_total_lal NUMERIC,
  p_botanicals JSONB,
  p_run_data JSONB,
  p_outputs JSONB,
  p_dilution_steps JSONB,
  p_final_output_volume_l NUMERIC,
  p_final_output_abv_percent NUMERIC,
  p_final_output_lal NUMERIC,
  p_notes TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_batch_id UUID;
  v_result JSONB;
BEGIN
  -- Start a transaction
  BEGIN
    -- Insert or update the main batch record
    INSERT INTO public.distillation_runs (
      batch_id,
      sku,
      display_name,
      date,
      still_used,
      charge_components,
      charge_total_volume_l,
      charge_total_abv_percent,
      charge_total_lal,
      botanicals,
      final_output_volume_l,
      final_output_abv_percent,
      final_output_lal,
      notes
    )
    VALUES (
      p_batch_id,
      'GIN-' || p_batch_id, -- Generate SKU from batch ID
      'Signature Dry Gin ' || p_batch_id, -- Display name
      p_date,
      p_still_used,
      p_charge_components,
      p_charge_total_volume_l,
      p_charge_total_abv_percent,
      p_charge_total_lal,
      p_botanicals,
      p_final_output_volume_l,
      p_final_output_abv_percent,
      p_final_output_lal,
      p_notes
    )
    ON CONFLICT (batch_id) 
    DO UPDATE SET
      date = EXCLUDED.date,
      still_used = EXCLUDED.still_used,
      charge_components = EXCLUDED.charge_components,
      charge_total_volume_l = EXCLUDED.charge_total_volume_l,
      charge_total_abv_percent = EXCLUDED.charge_total_abv_percent,
      charge_total_lal = EXCLUDED.charge_total_lal,
      botanicals = EXCLUDED.botanicals,
      final_output_volume_l = EXCLUDED.final_output_volume_l,
      final_output_abv_percent = EXCLUDED.final_output_abv_percent,
      final_output_lal = EXCLUDED.final_output_lal,
      notes = EXCLUDED.notes,
      updated_at = NOW()
    RETURNING id INTO v_batch_id;

    -- Insert/update the production_batches record with full JSON data
    INSERT INTO public.production_batches (
      id,
      data
    )
    VALUES (
      p_batch_id,
      jsonb_build_object(
        'batch_id', p_batch_id,
        'date', p_date,
        'still_used', p_still_used,
        'product_group', 'GIN',
        'charge_components', p_charge_components,
        'botanicals', p_botanicals,
        'run_data', p_run_data,
        'outputs', p_outputs,
        'dilution_steps', p_dilution_steps,
        'final_output', jsonb_build_object(
          'volume_l', p_final_output_volume_l,
          'abv_percent', p_final_output_abv_percent,
          'lal', p_final_output_lal
        ),
        'notes', p_notes
      )
    )
    ON CONFLICT (id) 
    DO UPDATE SET
      data = EXCLUDED.data,
      updated_at = NOW();

    -- Return success with batch ID
    RETURN jsonb_build_object(
      'success', true,
      'batch_id', p_batch_id,
      'message', 'Batch imported successfully'
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'batch_id', p_batch_id,
      'error', SQLERRM,
      'context', SQLSTATE
    );
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.import_gin_batch(
  TEXT, DATE, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, 
  JSONB, JSONB, JSONB, JSONB, NUMERIC, NUMERIC, NUMERIC, TEXT
) TO authenticated;

-- Add a comment for the function
COMMENT ON FUNCTION public.import_gin_batch IS 'Imports a gin batch with all related data in a transaction';

-- Create a function to verify the import
CREATE OR REPLACE FUNCTION public.verify_gin_batch_import(p_batch_id TEXT)
RETURNS TABLE (
  table_name TEXT,
  record_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 'distillation_runs'::TEXT, COUNT(*) 
  FROM public.distillation_runs 
  WHERE batch_id = p_batch_id
  
  UNION ALL
  
  SELECT 'production_batches'::TEXT, COUNT(*)
  FROM public.production_batches
  WHERE id = p_batch_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_gin_batch_import(TEXT) TO authenticated;
