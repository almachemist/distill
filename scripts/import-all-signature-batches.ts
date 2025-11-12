import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase anon key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to load all batch data
const loadAllBatches = () => {
  try {
    // Load the complete history file
    const historyPath = path.join(__dirname, 'backups/signature-dry-gin-full-history-2025-11-07.json');
    const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    
    console.log(`Loaded ${historyData.data.gin_runs.length} batches from historical data`);
    return historyData.data.gin_runs;
  } catch (error) {
    console.error('Error loading batch data:', error);
    process.exit(1);
  }
};

// Function to save a batch to Supabase
const saveBatch = async (batch: any) => {
  const batchData = {
    id: batch.id,
    batch_id: batch.batch_id,
    sku: batch.sku,
    still_used: batch.still_used,
    distillation_date: batch.distillation_date,
    boiler_charge_l: batch.boiler_charge_l,
    boiler_abv_percent: batch.boiler_abv_percent,
    boiler_lal: batch.boiler_lal,
    distillation_data: batch.distillation,
    dilution_data: batch.dilution,
    bottling_data: batch.bottling,
    botanicals: batch.botanicals,
    notes: batch.notes,
    created_by: batch.created_by || 'system',
    raw_log: batch.raw_log,
    is_trial_batch: batch.is_trial_batch || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Save to main batches table
  const { data, error } = await supabase
    .from('signature_dry_gin_batches')
    .upsert(batchData, { onConflict: 'id' });

  if (error) {
    console.error(`Error saving batch ${batch.batch_id}:`, error);
    return false;
  }

  return true;
};

// Main function to process all batches
const processAllBatches = async () => {
  const batches = loadAllBatches();
  console.log(`\nStarting import of ${batches.length} Signature Dry Gin batches...`);

  const results = {
    total: batches.length,
    success: 0,
    failed: 0,
    failedBatches: [] as string[]
  };

  // Process each batch
  for (const batch of batches) {
    console.log(`\nProcessing batch ${batch.batch_id} (${batch.distillation_date})...`);
    
    try {
      const success = await saveBatch(batch);
      
      if (success) {
        console.log(`✅ Successfully saved ${batch.batch_id}`);
        results.success++;
      } else {
        console.error(`❌ Failed to save ${batch.batch_id}`);
        results.failed++;
        results.failedBatches.push(batch.batch_id);
      }
    } catch (error) {
      console.error(`❌ Error processing ${batch.batch_id}:`, error);
      results.failed++;
      results.failedBatches.push(batch.batch_id);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n=== Import Summary ===');
  console.log(`Total batches: ${results.total}`);
  console.log(`Successfully imported: ${results.success}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\nFailed batches:');
    console.log(results.failedBatches.join(', '));
  }

  return results;
};

// Run the import
processAllBatches()
  .then(() => {
    console.log('\nImport process completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error during import:', error);
    process.exit(1);
  });
