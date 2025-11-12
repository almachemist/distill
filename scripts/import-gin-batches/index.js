import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Path to the batches directory
const BATCHES_DIR = join(__dirname, '../data/batches');

// Helper function to handle errors
function handleError(error, message) {
  console.error(`❌ ${message}:`, error);
  return null;
}

// Import a single batch
async function importBatch(batchFile) {
  try {
    const filePath = join(BATCHES_DIR, batchFile);
    const fileContent = await readFile(filePath, 'utf-8');
    const batchData = JSON.parse(fileContent);
    
    if (!batchData.runs || !batchData.runs[0]) {
      console.error(`Invalid batch format in ${batchFile}`);
      return null;
    }

    const run = batchData.runs[0];
    console.log(`\n📦 Processing batch: ${run.run_id}`);

    // 1. Insert batch
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert({
        run_id: run.run_id,
        recipe: batchData.recipe,
        sku: run.sku || null,
        date: run.date,
        boiler_start_time: run.boiler_start_time || null,
        still_used: run.still_used || 'CARRIE', // Default to CARRIE if missing
        location: run.location || null
      })
      .select()
      .single();

    if (batchError) {
      // If batch already exists, skip it
      if (batchError.code === '23505') { // Unique violation
        console.log(`ℹ️ Batch ${run.run_id} already exists, skipping...`);
        return null;
      }
      throw batchError;
    }

    // 2. Insert charge data
    if (run.charge) {
      const { error: chargeError } = await supabase
        .from('batch_charges')
        .insert({
          batch_id: batch.id,
          ethanol_source: run.charge.ethanol_source || null,
          ethanol_volume_l: run.charge.ethanol_volume_L || null,
          ethanol_abv_percent: run.charge.ethanol_abv_percent || null,
          ethanol_lal: run.charge.ethanol_LAL || null,
          water_volume_l: run.charge.water_volume_L || null,
          other_source: run.charge.other_source || null,
          other_volume_l: run.charge.other_volume_L || null,
          other_abv_percent: run.charge.other_abv_percent || null,
          other_lal: run.charge.other_LAL || null,
          total_charge_l: run.charge.total_charge_L || null,
          charge_abv_percent: run.charge.charge_abv_percent || null,
          total_lal: run.charge.total_LAL || null
        });
      
      if (chargeError) throw chargeError;
    }

    // 3. Insert still setup
    if (run.still_setup) {
      const { error: setupError } = await supabase
        .from('still_setups')
        .insert({
          batch_id: batch.id,
          elements: run.still_setup.elements || null,
          steeping: run.still_setup.steeping || null,
          plates: run.still_setup.plates || null,
          options: run.still_setup.options || null
        });
      
      if (setupError) throw setupError;
    }

    // 4. Insert botanicals
    if (run.botanicals && run.botanicals.length > 0) {
      const botanicalsData = run.botanicals.map(b => ({
        batch_id: batch.id,
        name: b.name,
        notes: b.notes || null,
        weight_g: b.weight_g || null,
        ratio_percent: b.ratio_percent || null
      }));

      const { error: botanicalsError } = await supabase
        .from('botanicals')
        .insert(botanicalsData);
      
      if (botanicalsError) throw botanicalsError;
    }

    // 5. Insert distillation logs
    if (run.distillation_log && run.distillation_log.length > 0) {
      const logsData = run.distillation_log.map(log => ({
        batch_id: batch.id,
        time: log.time || null,
        phase: log.phase || null,
        volume_l: log.volume_L || null,
        abv_percent: log.abv_percent || null,
        ambient_temp_c: log.ambient_temp_C || null,
        head_temp_c: log.head_temp_C || null,
        condenser_temp_c: log.condenser_temp_C || null,
        lal: log.LAL || null,
        power_notes: log.power_notes || null
      }));

      const { error: logsError } = await supabase
        .from('distillation_logs')
        .insert(logsData);
      
      if (logsError) throw logsError;
    }

    // 6. Insert outputs
    if (run.outputs && run.outputs.length > 0) {
      const outputsData = run.outputs.map(output => ({
        batch_id: batch.id,
        phase: output.phase || null,
        destination: output.destination || null,
        volume_l: output.volume_L || null,
        abv_percent: output.abv_percent || null,
        lal: output.LAL || null,
        notes: output.notes || null
      }));

      const { error: outputsError } = await supabase
        .from('outputs')
        .insert(outputsData);
      
      if (outputsError) throw outputsError;
    }

    // 7. Insert run totals
    if (run.run_totals) {
      const { error: totalsError } = await supabase
        .from('run_totals')
        .insert({
          batch_id: batch.id,
          total_collected_l: run.run_totals.total_collected_L || null,
          hearts_percent_of_run: run.run_totals.hearts_percent_of_run || null,
          total_run_percent: run.run_totals.total_run_percent || null,
          total_lal_out: run.run_totals.total_LAL_out || null,
          botanicals_g_per_lal: run.run_totals.botanicals_g_per_LAL || null
        });
      
      if (totalsError) throw totalsError;
    }

    // 8. Insert dilution steps
    if (run.dilution_steps && run.dilution_steps.length > 0) {
      const stepsData = run.dilution_steps.map((step, index) => ({
        batch_id: batch.id,
        step: index + 1,
        date_added: step.date_added || null,
        new_make_l: step.new_make_L || null,
        filtered_water_l: step.filtered_water_L || null,
        new_volume_l: step.new_volume_L || null,
        abv_percent: step.abv_percent || null,
        lal: step.LAL || null,
        notes: step.notes || null
      }));

      const { error: stepsError } = await supabase
        .from('dilution_steps')
        .insert(stepsData);
      
      if (stepsError) throw stepsError;
    }

    // 9. Insert combined dilution
    if (run.combined_dilution) {
      const { error: dilutionError } = await supabase
        .from('combined_dilutions')
        .insert({
          batch_id: batch.id,
          new_make_l: run.combined_dilution.new_make_L || null,
          filtered_water_l: run.combined_dilution.filtered_water_L || null,
          new_volume_l: run.combined_dilution.new_volume_L || null,
          abv_percent: run.combined_dilution.abv_percent || null,
          lal: run.combined_dilution.LAL || null,
          final_output_volume_l: run.combined_dilution.final_output_volume_L || null
        });
      
      if (dilutionError) throw dilutionError;
    }

    console.log(`✅ Successfully imported ${run.run_id}`);
    return batch;
  } catch (error) {
    return handleError(error, `Error importing batch ${batchFile}`);
  }
}

// Main function to import all batches
async function importAllBatches() {
  try {
    console.log('🚀 Starting batch import process...');
    
    // Get list of batch files
    const batchFiles = (await readdir(BATCHES_DIR))
      .filter(file => file.startsWith('signature-dry-gin-') && file.endsWith('.json'))
      .sort((a, b) => {
        // Sort by batch number (e.g., 0001, 0002, etc.)
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });

    console.log(`Found ${batchFiles.length} batch files to process`);
    
    let successCount = 0;
    const failedBatches = [];
    
    // Process each batch file
    for (const batchFile of batchFiles) {
      const result = await importBatch(batchFile);
      if (result) {
        successCount++;
      } else {
        failedBatches.push(batchFile);
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} batches`);
    
    if (failedBatches.length > 0) {
      console.log('❌ Failed to import:');
      failedBatches.forEach(file => console.log(`  - ${file}`));
    }
    
    console.log('\n✨ Batch import process completed!');
  } catch (error) {
    handleError(error, 'Fatal error during batch import');
    process.exit(1);
  }
}

// Run the import
importAllBatches();
