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

// Load and parse rainforest.json file (contains multiple JSON objects separated by blank lines)
const loadRainforestGinData = (): any[] => {
  try {
    const dataPath = path.join(process.cwd(), 'src/modules/production/data/rainforest.json');
    let rawData = fs.readFileSync(dataPath, 'utf-8');
    
    // Replace non-breaking spaces (UTF-8 \u00A0) with regular spaces
    rawData = rawData.replace(/\u00A0/g, ' ');
    
    // Split by double newlines to get individual JSON objects
    // Also handle single newlines at the start
    const jsonStrings = rawData
      .split(/\n\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.startsWith('{'))
      .map(s => {
        // Remove any leading whitespace/newlines that might cause issues
        let cleaned = s.trim();
        // If it doesn't start with {, try to find the first {
        if (!cleaned.startsWith('{')) {
          const firstBrace = cleaned.indexOf('{');
          if (firstBrace > 0) {
            cleaned = cleaned.substring(firstBrace);
          }
        }
        return cleaned;
      });
    
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
    console.error('Error loading Rainforest Gin data:', error);
    process.exit(1);
  }
};

// Transform Rainforest batch data to distillation_runs format
const transformBatch = (rainforestBatch: any) => {
  const batchId = rainforestBatch.run_id || rainforestBatch.batch_id;
  const sku = rainforestBatch.sku || 'Rainforest Gin';
  const date = rainforestBatch.date || null;
  const stillUsed = rainforestBatch.still_used || null;
  
  // Extract charge data
  const chargeAdjustment = rainforestBatch.charge_adjustment || {};
  const chargeSources = chargeAdjustment.sources || [];
  const totalCharge = chargeAdjustment.total_charge || {};
  
  // Extract still setup
  const stillSetup = chargeAdjustment.still_setup || {};
  
  // Extract botanicals
  const botanicals = (rainforestBatch.botanicals || []).map((bot: any) => ({
    name: bot.name,
    weight_g: bot.weight_g || null,
    ratio_percent: bot.ratio_percent || null,
    notes: bot.notes || null,
    time: bot.time || null,
    phase: bot.phase || null,
    volume_l: bot.volume_l || null,
    abv_percent: bot.abv_percent || null,
    lal: bot.lal || null,
    observations: bot.observations || null,
    receiving_vessel: bot.receiving_vessel || null,
    ambient_temp_c: bot.ambient_temp_c || null,
    head_temp_c: bot.head_temp_c || null,
    condenser_temp_c: bot.condenser_temp_c || null
  }));
  
  // Extract totals
  const totals = rainforestBatch.totals || {};
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
  
  // Extract dilution steps (prefer dilution_steps, fallback to combined_dilution)
  let dilutionSteps = [];
  if (rainforestBatch.dilution_steps && rainforestBatch.dilution_steps.length > 0) {
    dilutionSteps = rainforestBatch.dilution_steps.map((step: any) => ({
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
  } else if (rainforestBatch.combined_dilution) {
    // Use combined_dilution as a single step if no dilution_steps
    const combined = rainforestBatch.combined_dilution;
    dilutionSteps = [{
      step: 1,
      date: null,
      date_added: null,
      new_make_l: combined.new_make_l || null,
      filtered_water_l: combined.filtered_water_l || null,
      new_volume_l: combined.new_volume_l || null,
      abv_percent: combined.abv_percent || null,
      lal: combined.lal || null,
      notes: 'Combined dilution'
    }];
  }
  
  // Extract final output
  const finalOutput = rainforestBatch.final_output || {};
  
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
    power_setting: null, // Not in Rainforest data
    plates: stillSetup.plates || null,
    deflegmator: stillSetup.options || null,
    steeping_start_time: null, // Could extract from still_setup.steeping if needed
    steeping_end_time: null,
    steeping_temp_c: null,
    
    // Botanicals
    botanicals: botanicals,
    
    // Boiler timing (Rainforest uses boiler_start_time)
    boiler_on_time: rainforestBatch.boiler_start_time || rainforestBatch.boiler_on_time || null,
    
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
    final_output_lal: finalOutput.lal || null,
    
    // Notes
    notes: rainforestBatch.notes || null,
    created_by: 'system'
  };
};

// Function to import a single batch
const importBatch = async (rainforestBatch: any) => {
  try {
    const batchId = rainforestBatch.run_id || rainforestBatch.batch_id;
    console.log(`\nImporting batch ${batchId}...`);
    
    // Skip if date is missing (required field)
    if (!rainforestBatch.date) {
      console.log(`⚠️  Skipping batch ${batchId} - missing date`);
      return false;
    }
    
    // Transform the batch data
    const transformedBatch = transformBatch(rainforestBatch);
    
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
    console.error(`❌ Error importing batch ${rainforestBatch.run_id || rainforestBatch.batch_id}:`, error);
    return false;
  }
};

// Main function to run the import
const main = async () => {
  console.log('Starting Rainforest Gin data import...');
  
  // Load the data
  const batches = loadRainforestGinData();
  
  if (!batches || batches.length === 0) {
    console.log('No batches found to import.');
    return;
  }
  
  console.log(`Found ${batches.length} Rainforest Gin batches to import.`);
  
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

