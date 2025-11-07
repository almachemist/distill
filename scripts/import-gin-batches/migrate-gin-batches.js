import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Path to the consolidated gin batches file
const GIN_BATCHES_PATH = join(
  __dirname,
  '../../src/modules/production/data/signature-gin-batches.ts'
);

// Extract the batches array from the TS file
async function loadGinBatches() {
  try {
    const content = await readFile(GIN_BATCHES_PATH, 'utf8');
    // Extract the array from the TS file (hacky but works for this case)
    const match = content.match(/export const signatureGinBatches = (\[.*?\]);/s);
    if (!match) throw new Error('Could not find batches array in file');
    
    // Use eval to parse the array (in a real app, consider a proper TS parser)
    const batches = eval(`(${match[1]})`);
    return batches;
  } catch (error) {
    console.error('Error loading gin batches:', error);
    process.exit(1);
  }
}

// Normalize batch data to match our schema
function normalizeBatch(batch) {
  const {
    id,
    date,
    stillUsed,
    chargeAdjustment,
    botanicals = [],
    runData = [],
    output = [],
    dilutions = [],
    notes = '',
    ...rest
  } = batch;

  // Normalize still name
  const normalizedStill = stillUsed?.toUpperCase() === 'ROBERTA' ? 'Carrie' : 'Carrie';

  return {
    id,
    date,
    still_used: normalizedStill,
    charge_components: chargeAdjustment?.components || [],
    charge_total_volume_l: chargeAdjustment?.total?.volume_L || null,
    charge_total_abv_percent: chargeAdjustment?.total?.abv_percent || null,
    charge_total_lal: chargeAdjustment?.total?.lal || null,
    botanicals: botanicals.map(b => ({
      name: b.name,
      weight_g: b.weight_g,
      ratio_percent: b.ratio_percent,
      notes: b.notes || ''
    })),
    run_data: runData.map(log => ({
      time: log.time,
      phase: log.phase,
      volume_l: log.volume_L,
      abv_percent: log.abv_percent,
      lal: log.lal,
      observations: log.observations || '',
      notes: log.notes || ''
    })),
    outputs: output.map(o => ({
      phase: o.phase,
      output: o.output,
      volume_l: o.volume_L,
      abv_percent: o.abv_percent,
      lal: o.lal,
      receiving_vessel: o.receivingVessel || ''
    })),
    dilution_steps: dilutions.map((d, i) => ({
      step_number: i + 1,
      date: d.date,
      new_make_volume_l: d.newMake_L,
      water_volume_l: d.waterVolume_L || d.filteredWater_L || 0,
      ethanol_volume_l: d.ethanolVolume_L || 0,
      final_volume_l: d.finalVolume_L || d.newVolume_L,
      initial_abv_percent: d.initialAbv_percent || null,
      final_abv_percent: d.finalAbv_percent || d.abv_percent,
      notes: d.notes || ''
    })),
    final_output_volume_l: batch.finalOutput?.totalVolume_L || null,
    final_output_abv_percent: batch.finalOutput?.abv_percent || null,
    final_output_lal: batch.finalOutput?.lal || null,
    notes: batch.notes || ''
  };
}

// Insert a batch with all related data in a transaction
async function insertBatchWithRelations(batch) {
  const {
    id,
    date,
    still_used,
    charge_components,
    charge_total_volume_l,
    charge_total_abv_percent,
    charge_total_lal,
    botanicals,
    run_data,
    outputs,
    dilution_steps,
    final_output_volume_l,
    final_output_abv_percent,
    final_output_lal,
    notes
  } = normalizeBatch(batch);

  console.log(`\nProcessing batch ${id} (${date})...`);

  try {
    // Start a transaction
    const { data, error } = await supabase.rpc('import_gin_batch', {
      p_batch_id: id,
      p_date: date,
      p_still_used: still_used,
      p_charge_components: charge_components,
      p_charge_total_volume_l: charge_total_volume_l,
      p_charge_total_abv_percent: charge_total_abv_percent,
      p_charge_total_lal: charge_total_lal,
      p_botanicals: botanicals,
      p_run_data: run_data,
      p_outputs: outputs,
      p_dilution_steps: dilution_steps,
      p_final_output_volume_l: final_output_volume_l,
      p_final_output_abv_percent: final_output_abv_percent,
      p_final_output_lal: final_output_lal,
      p_notes: notes
    });

    if (error) throw error;
    
    console.log(`✅ Successfully imported batch ${id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error importing batch ${id}:`, error.message);
    return false;
  }
}

// Main function to run the migration
async function migrateGinBatches() {
  try {
    console.log('Loading gin batches...');
    const batches = await loadGinBatches();
    console.log(`Found ${batches.length} batches to migrate`);

    let successCount = 0;
    for (const batch of batches) {
      const success = await insertBatchWithRelations(batch);
      if (success) successCount++;
      
      // Add a small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\nMigration complete!`);
    console.log(`✅ ${successCount} batches migrated successfully`);
    console.log(`❌ ${batches.length - successCount} batches failed`);
    
    if (successCount > 0) {
      console.log('\nVerifying data in Supabase...');
      await verifyData();
    }
  } catch (error) {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  }
}

// Verify the data was imported correctly
async function verifyData() {
  try {
    // Count batches
    const { count: batchCount, error: batchError } = await supabase
      .from('distillation_runs')
      .select('*', { count: 'exact', head: true });
    
    if (batchError) throw batchError;
    
    console.log(`\nVerification:`);
    console.log(`- Total batches in Supabase: ${batchCount}`);
    
    // Count botanicals
    const { count: botanicalsCount, error: botanicalsError } = await supabase
      .from('botanicals')
      .select('*', { count: 'exact', head: true });
    
    if (botanicalsError) throw botanicalsError;
    console.log(`- Total botanicals: ${botanicalsCount}`);
    
  } catch (error) {
    console.error('Verification error:', error.message);
  }
}

// Run the migration
migrateGinBatches();
