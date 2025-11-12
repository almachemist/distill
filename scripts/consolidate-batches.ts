import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Configuration
const BATCHES_DIR = path.join(__dirname, 'data/batches');
const OUTPUT_FILE = path.join(__dirname, 'data/consolidated/signature-dry-gin-complete.json');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Error: Missing Supabase anon key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface BatchData {
  recipe: string;
  runs: Array<{
    run_id: string;
    sku: string;
    date: string;
    still_used: string;
    boiler_start_time: string;
    charge: {
      ethanol_source: string;
      ethanol_volume_L: number;
      ethanol_abv_percent: number;
      ethanol_LAL: number;
      water_volume_L: number;
      other_volume_L: number;
      total_charge_L: number;
      charge_abv_percent: number;
      total_LAL: number;
    };
    still_setup: {
      elements: string;
      steeping: string;
      plates: string;
      options: string;
    };
    botanicals: Array<{
      name: string;
      notes?: string;
      weight_g?: number;
      ratio_percent: number;
    }>;
    distillation_log: Array<{
      time: string;
      phase: string;
      volume_L: number;
      abv_percent: number | null;
      ambient_temp_C?: number;
      head_temp_C?: number;
      condenser_temp_C?: number;
      power_V?: number;
    }>;
    outputs: Array<{
      phase: string;
      destination: string;
      volume_L: number;
      abv_percent: number | null;
      LAL: number;
    }>;
    dilution_steps: Array<{
      step: number;
      date: string;
      new_make_L: number;
      filtered_water_L: number;
      new_volume_L: number;
      abv_percent: number;
      LAL: number;
    }>;
    final_output_L: number;
    botanicals_per_LAL_g: number;
    total_LAL: number;
  }>;
}

// Read all batch files
const readBatchFiles = (): BatchData[] => {
  const files = fs.readdirSync(BATCHES_DIR)
    .filter(file => file.startsWith('signature-dry-gin-') && file.endsWith('.json'))
    .sort();

  return files.map(file => {
    const filePath = path.join(BATCHES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as BatchData;
  });
};

// Validate batch data
const validateBatch = (batch: BatchData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const run = batch.runs[0]; // Assuming one run per file

  // Basic validation
  if (!run.run_id) errors.push('Missing run_id');
  if (!run.date) errors.push('Missing date');
  if (!run.still_used) errors.push('Missing still_used');
  
  // Charge validation
  if (!run.charge) {
    errors.push('Missing charge data');
  } else {
    const { ethanol_volume_L, water_volume_L, total_charge_L } = run.charge;
    if (ethanol_volume_L + water_volume_L !== total_charge_L) {
      errors.push('Charge volumes do not add up');
    }
  }

  // Botanicals validation
  if (!run.botanicals || run.botanicals.length === 0) {
    errors.push('No botanicals specified');
  }

  // Output validation
  if (!run.outputs || run.outputs.length === 0) {
    errors.push('No output data');
  } else {
    const hearts = run.outputs.find(o => o.phase === 'Hearts');
    if (!hearts) {
      errors.push('No hearts cut in outputs');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Main function
const main = async () => {
  console.log('Starting batch consolidation...');
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read and validate all batches
  const allBatches = readBatchFiles();
  console.log(`Found ${allBatches.length} batch files`);

  const validatedBatches = allBatches.map(batch => {
    const validation = validateBatch(batch);
    if (!validation.valid) {
      console.warn(`Validation issues in ${batch.runs[0]?.run_id || 'unknown'}:`, validation.errors);
    }
    return {
      ...batch,
      _validation: validation
    };
  });

  // Group by recipe (though we're only handling Signature Dry Gin for now)
  const recipes: Record<string, any> = {};
  
  validatedBatches.forEach(batch => {
    if (!recipes[batch.recipe]) {
      recipes[batch.recipe] = [];
    }
    recipes[batch.recipe].push(...batch.runs);
  });

  // Create consolidated output
  const output = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_batches: validatedBatches.length,
      recipes: Object.keys(recipes)
    },
    data: recipes
  };

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Consolidated data written to ${OUTPUT_FILE}`);

  // Optionally upload to Supabase
  const uploadToSupabase = process.argv.includes('--upload');
  if (uploadToSupabase) {
    console.log('Uploading to Supabase...');
    await uploadBatchesToSupabase(validatedBatches);
  }
};

// Upload batches to Supabase
async function uploadBatchesToSupabase(batches: any[]) {
  console.log(`Preparing to upload ${batches.length} batches to Supabase...`);
  
  for (const batch of batches) {
    const run = batch.runs[0];
    console.log(`Processing ${run.run_id}...`);

    try {
      // Upload batch
      const { data: batchData, error: batchError } = await supabase
        .from('signature_dry_gin_batches')
        .upsert({
          run_id: run.run_id,
          date: run.date,
          still_used: run.still_used,
          charge_data: run.charge,
          still_setup: run.still_setup,
          outputs: run.outputs,
          final_output_liters: run.final_output_L,
          botanicals_per_lal: run.botanicals_per_LAL_g,
          total_lal: run.total_LAL,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'run_id'
        });

      if (batchError) throw batchError;

      // Upload botanicals
      for (const botanical of run.botanicals) {
        if (botanical.weight_g && botanical.weight_g > 0) {
          const { error: botError } = await supabase
            .from('signature_dry_gin_botanicals')
            .upsert({
              run_id: run.run_id,
              name: botanical.name,
              weight_g: botanical.weight_g,
              ratio_percent: botanical.ratio_percent,
              notes: botanical.notes || null
            }, {
              onConflict: 'run_id,name'
            });

          if (botError) throw botError;
        }
      }

      // Upload dilution steps
      for (const [index, step] of run.dilution_steps.entries()) {
        const { error: dilError } = await supabase
          .from('signature_dry_gin_dilution')
          .upsert({
            run_id: run.run_id,
            step: step.step,
            date: step.date,
            new_make_liters: step.new_make_L,
            filtered_water_liters: step.filtered_water_L,
            new_volume_liters: step.new_volume_L,
            abv_percent: step.abv_percent,
            lal: step.LAL
          }, {
            onConflict: 'run_id,step'
          });

        if (dilError) throw dilError;
      }

      console.log(`✅ Successfully uploaded ${run.run_id}`);
    } catch (error) {
      console.error(`❌ Error uploading ${run.run_id}:`, error);
    }
  }

  console.log('Batch upload complete!');
}

// Run the script
main().catch(console.error);
