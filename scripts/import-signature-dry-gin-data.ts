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

// Import Signature Dry Gin data from the complete backup file
const signatureDryGinData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'backups/signature-dry-gin-complete-backup-2025-11-07.json'), 'utf-8')
);

// Extract the gin runs from the data structure
const ginRuns = signatureDryGinData.data.gin_runs;
};

// Function to import a single batch
const importBatch = async (batch: any) => {
  try {
    console.log(`\nImporting batch ${batch.batch_id}...`);
    
    // Extract distillation cuts
    const { foreshots, heads, hearts, tails, ...distillationData } = batch.distillation;
    
    // Insert main batch data
    const { data: batchData, error: batchError } = await supabase
      .from('signature_dry_gin_batches')
      .upsert(
        {
          id: batch.id,
          batch_id: batch.batch_id,
          product_name: batch.product_name,
          product_type: batch.product_type || 'gin',
          sku: batch.sku,
          still_used: batch.still_used,
          distillation_date: batch.distillation_date,
          boiler_charge_l: batch.boiler_charge_l,
          boiler_abv_percent: batch.boiler_abv_percent,
          boiler_lal: batch.boiler_lal,
          distillation_start_time: distillationData.start_time,
          distillation_duration_hours: distillationData.duration_hours,
          total_lal_collected: distillationData.total_lal_collected,
          heart_yield_percent: distillationData.heart_yield_percent,
          distillation_notes: distillationData.notes,
          final_volume_l: batch.bottling.final_volume_l,
          final_abv_percent: batch.bottling.final_abv_percent,
          bottling_date: batch.bottling.bottling_date,
          lal_filled: batch.bottling.lal_filled,
          bottles_700ml: batch.bottling.bottles_700ml,
          created_by: batch.created_by,
          notes: batch.notes,
          raw_log: batch.raw_log
        },
        { onConflict: 'batch_id' }
      );
    
    if (batchError) throw batchError;
    
    // Insert botanicals
    const { error: botanicalsError } = await supabase
      .from('signature_dry_gin_botanicals')
      .delete()
      .eq('batch_id', batch.batch_id);
    
    if (botanicalsError) throw botanicalsError;
    
    const botanicalsToInsert = batch.botanicals
      .filter((b: any) => b.weight_g > 0 || b.weight_g === 0) // Include all botanicals, even if weight is 0
      .map((botanical: any) => ({
        batch_id: batch.batch_id,
        name: botanical.name,
        weight_g: botanical.weight_g
      }));
    
    if (botanicalsToInsert.length > 0) {
      const { error: insertBotanicalsError } = await supabase
        .from('signature_dry_gin_botanicals')
        .insert(botanicalsToInsert);
      
      if (insertBotanicalsError) throw insertBotanicalsError;
    }
    
    // Insert distillation cuts
    const { error: deleteCutsError } = await supabase
      .from('signature_dry_gin_distillation_cuts')
      .delete()
      .eq('batch_id', batch.batch_id);
    
    if (deleteCutsError) throw deleteCutsError;
    
    const cutsToInsert = [
      { type: 'foreshots', ...foreshots },
      { type: 'heads', ...heads },
      { type: 'hearts', ...hearts },
      { type: 'tails', ...tails }
    ].filter(cut => cut.volume_l !== undefined) // Include all cuts, even if volume is 0
     .map(cut => ({
        batch_id: batch.batch_id,
        cut_type: cut.type,
        time: cut.time,
        volume_l: cut.volume_l || 0,
        abv_percent: cut.abv_percent,
        lal: cut.lal,
        notes: cut.notes
      }));
    
    if (cutsToInsert.length > 0) {
      const { error: insertCutsError } = await supabase
        .from('signature_dry_gin_distillation_cuts')
        .insert(cutsToInsert);
      
      if (insertCutsError) throw insertCutsError;
    }
    
    // Insert dilution stages
    const { error: deleteDilutionError } = await supabase
      .from('signature_dry_gin_dilution')
      .delete()
      .eq('batch_id', batch.batch_id);
    
    if (deleteDilutionError) throw deleteDilutionError;
    
    if (batch.dilution && batch.dilution.length > 0) {
      const dilutionToInsert = batch.dilution.map((d: any, index: number) => ({
        batch_id: batch.batch_id,
        stage: d.stage || index + 1,
        date: d.date || batch.distillation_date,
        new_make_l: d.new_make_l || null,
        filtered_water_l: d.filtered_water_l,
        new_volume_l: d.new_volume_l,
        abv_percent: d.abv_percent,
        lal: d.lal
      }));
      
      const { error: insertDilutionError } = await supabase
        .from('signature_dry_gin_dilution')
        .insert(dilutionToInsert);
      
      if (insertDilutionError) throw insertDilutionError;
    }
    
    console.log(`✅ Successfully imported batch ${batch.batch_id}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error importing batch ${batch.batch_id}:`, error);
    return false;
  }
};

// Main function to run the import
const main = async () => {
  console.log('Starting Signature Dry Gin data import...');
  
  // Load the data
  const ginRuns = loadSignatureDryGinData();
  
  if (!ginRuns || ginRuns.length === 0) {
    console.log('No batches found to import.');
    return;
  }
  
  console.log(`Found ${ginRuns.length} Signature Dry Gin batches to import.`);
  
  // Import each batch
  let successCount = 0;
  for (const batch of ginRuns) {
    const success = await importBatch(batch);
    if (success) successCount++;
  }
  
  console.log(`\n🎉 Import completed!`);
  console.log(`✅ Successfully imported ${successCount} of ${ginRuns.length} batches`);
  
  if (successCount < ginRuns.length) {
    console.log(`❌ Failed to import ${ginRuns.length - successCount} batches`);
  }
};

// Run the import
main().catch(console.error);
