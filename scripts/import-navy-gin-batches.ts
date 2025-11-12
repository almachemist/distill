import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local if it exists
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.+)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          envVars[key] = value;
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
} catch (error) {
  // Ignore errors loading .env.local
}

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase anon key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('You can set it in .env.local or as an environment variable');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load and parse Navy.json file (contains multiple JSON objects separated by blank lines)
const loadNavyGinData = (): any[] => {
  try {
    const dataPath = path.join(process.cwd(), 'src/modules/production/data/Navy.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    
    // Split by double newlines to get individual JSON objects
    const jsonStrings = rawData
      .split(/\n\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.startsWith('{'));
    
    const batches = jsonStrings.map((jsonStr, index) => {
      try {
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error(`Error parsing JSON object ${index + 1}:`, error);
        return null;
      }
    }).filter(batch => batch !== null);
    
    return batches;
  } catch (error) {
    console.error('Error loading Navy Gin data:', error);
    process.exit(1);
  }
};

// Transform Navy batch data to distillation_runs format
const transformBatch = (navyBatch: any) => {
  const batchId = navyBatch.run_id || navyBatch.batch_id;
  const sku = navyBatch.sku || 'Navy Strength Gin';
  const date = navyBatch.date || null;
  const stillUsed = navyBatch.still_used || null;
  
  // Extract charge data
  const chargeAdjustment = navyBatch.charge_adjustment || {};
  const chargeSources = chargeAdjustment.sources || [];
  const totalCharge = chargeAdjustment.total_charge || {};
  
  // Extract still setup
  const stillSetup = chargeAdjustment.still_setup || {};
  
  // Extract botanicals
  const botanicals = (navyBatch.botanicals || []).map((bot: any) => ({
    name: bot.name,
    weight_g: bot.weight_g || null,
    ratio_percent: bot.ratio_percent || null,
    notes: bot.notes || null,
    time: bot.time || null,
    phase: bot.phase || null,
    volume_l: bot.volume_l || null,
    abv_percent: bot.abv_percent || null,
    lal: bot.lal || null,
    observations: bot.observations || null
  }));
  
  // Extract totals
  const totals = navyBatch.totals || {};
  const totalOutput = totals.total_output || {};
  
  // Extract cuts
  const hearts = totalOutput.hearts || {};
  const foreshots = totalOutput.foreshots || {};
  const heads = totalOutput.heads || {};
  const tails = totalOutput.tails || {};
  
  // Handle multiple hearts (array case)
  let heartsSegments = null;
  let heartsVolumeL = null;
  let heartsAbvPercent = null;
  let heartsLal = null;
  
  if (Array.isArray(hearts)) {
    heartsSegments = hearts;
    // Sum up volumes for total
    heartsVolumeL = hearts.reduce((sum: number, h: any) => sum + (h.volume_l || 0), 0);
    heartsAbvPercent = hearts[0]?.abv_percent || null;
    heartsLal = hearts.reduce((sum: number, h: any) => sum + (h.lal || 0), 0);
  } else if (hearts && typeof hearts === 'object') {
    heartsVolumeL = hearts.volume_l || null;
    heartsAbvPercent = hearts.abv_percent || null;
    heartsLal = hearts.lal || null;
  }
  
  // Extract dilution steps
  const dilutionSteps = (navyBatch.dilution_steps || []).map((step: any) => ({
    step: step.step || null,
    date: step.date || null,
    date_added: step.date_added || null,
    new_make_l: step.new_make_l || null,
    filtered_water_l: step.filtered_water_l || null,
    new_volume_l: step.new_volume_l || null,
    abv_percent: step.abv_percent || step.final_abv_percent || null,
    lal: step.lal || null,
    notes: step.notes || null
  }));
  
  // Extract final output
  const finalOutput = navyBatch.final_output || {};
  
  // Build display name
  const displayName = `${sku} ${batchId}`;
  
  return {
    batch_id: batchId,
    sku: sku,
    display_name: displayName,
    date: date,
    still_used: stillUsed,
    
    // Charge data
    charge_components: chargeSources,
    charge_total_volume_l: totalCharge.volume_l || null,
    charge_total_abv_percent: totalCharge.abv_percent || null,
    charge_total_lal: totalCharge.lal || null,
    
    // Still setup
    heating_elements: stillSetup.elements || null,
    power_setting: null, // Not in Navy data
    plates: stillSetup.plates || null,
    deflegmator: stillSetup.options || null,
    steeping_start_time: null, // Could extract from still_setup.steeping if needed
    steeping_end_time: null,
    steeping_temp_c: null,
    
    // Botanicals
    botanicals: botanicals,
    
    // Boiler timing
    boiler_on_time: navyBatch.boiler_on_time || null,
    
    // Cuts
    foreshots_volume_l: foreshots.volume_l || null,
    foreshots_abv_percent: foreshots.abv_percent || null,
    foreshots_lal: foreshots.lal || null,
    
    heads_volume_l: heads.volume_l || null,
    heads_abv_percent: heads.abv_percent || null,
    heads_lal: heads.lal || null,
    
    hearts_volume_l: heartsVolumeL,
    hearts_abv_percent: heartsAbvPercent,
    hearts_lal: heartsLal,
    hearts_segments: heartsSegments,
    
    tails_volume_l: tails.volume_l || null,
    tails_abv_percent: tails.abv_percent || null,
    tails_lal: tails.lal || null,
    tails_segments: null, // Could be extracted if needed
    
    // Dilution
    dilution_steps: dilutionSteps,
    final_output_volume_l: finalOutput.volume_l || null,
    final_output_abv_percent: finalOutput.abv_percent || null,
    final_output_lal: finalOutput.lal || finalOutput.lal_estimated || null,
    
    // Notes
    notes: navyBatch.notes || null,
    created_by: 'system'
  };
};

// Function to import a single batch
const importBatch = async (navyBatch: any) => {
  try {
    const batchId = navyBatch.run_id || navyBatch.batch_id;
    console.log(`\nImporting batch ${batchId}...`);
    
    // Transform the batch data
    const transformedBatch = transformBatch(navyBatch);
    
    // Insert into distillation_runs table
    const { data, error } = await supabase
      .from('distillation_runs')
      .upsert(transformedBatch, { 
        onConflict: 'batch_id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error(`Error inserting batch ${batchId}:`, error);
      throw error;
    }
    
    console.log(`✅ Successfully imported batch ${batchId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error importing batch ${navyBatch.run_id || navyBatch.batch_id}:`, error);
    return false;
  }
};

// Main function to run the import
const main = async () => {
  console.log('Starting Navy Strength Gin data import...');
  
  // Load the data
  const batches = loadNavyGinData();
  
  if (!batches || batches.length === 0) {
    console.log('No batches found to import.');
    return;
  }
  
  console.log(`Found ${batches.length} Navy Strength Gin batches to import.`);
  
  // Import each batch
  let successCount = 0;
  for (const batch of batches) {
    const success = await importBatch(batch);
    if (success) successCount++;
  }
  
  console.log(`\n🎉 Import completed!`);
  console.log(`✅ Successfully imported ${successCount} of ${batches.length} batches`);
  
  if (successCount < batches.length) {
    console.log(`❌ Failed to import ${batches.length - successCount} batches`);
  }
};

// Run the import
main().catch(console.error);

