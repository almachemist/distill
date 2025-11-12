import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import 'dotenv/config';

// Determine which dataset to import
const requestedDataset = process.argv[2]?.toLowerCase();
const MODE = requestedDataset === 'rum' ? 'rum' : 'gin';

// Configuration shared between datasets
const CONFIG = {
  supabaseUrl: 'https://dscmknufpfhxjcanzdsr.supabase.co',
  supabaseKey: process.env.SUPABASE_KEY,
  gin: {
    batchesDir: join(process.cwd(), '../data/batches'),
    filePredicate: (filename) => filename.startsWith('signature-dry-gin-') && filename.endsWith('.json'),
    table: 'batches'
  },
  rum: {
    datasetPath: join(process.cwd(), '../../src/app/rum/rum_production_data.json'),
    table: 'rum_production_runs'
  }
};

if (!CONFIG.supabaseKey) {
  console.error('❌ Error: SUPABASE_KEY environment variable is not set');
  console.log('Please set it in your .env file or run:');
  console.log('export SUPABASE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
  auth: { persistSession: false }
});

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('batches').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your service role key is correct');
    console.log('2. Check if your IP is allowed in Supabase dashboard');
    console.log('3. The key should start with "eyJ" and be very long');
    return false;
  }
}

async function importGinBatch(batchFile) {
  try {
    const filePath = join(CONFIG.gin.batchesDir, batchFile);
    const fileContent = await readFile(filePath, 'utf8');
    const { runs, recipe } = JSON.parse(fileContent);
    const run = runs[0];

    console.log(`\n📦 Processing ${run.run_id}...`);

    // Normalize still name to CARRIE
    const stillUsed = 'CARRIE';
    if (run.still_used && run.still_used.toUpperCase() !== 'CARRIE') {
      console.log(`   Normalized still from ${run.still_used} to CARRIE`);
    }

    const { data, error } = await supabase
      .from(CONFIG.gin.table)
      .upsert({
        run_id: run.run_id,
        recipe,
        date: run.date,
        still_used: stillUsed,
        location: run.location,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'run_id'
      })
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ ${run.run_id} - ${recipe} (${run.date})`);
    return true;
  } catch (error) {
    console.error(`❌ Error in ${batchFile}:`, error.message);
    return false;
  }
}

function normalizeRumRecord(record) {
  const isoOrNull = (value) => {
    if (!value || value === '-' || value === '') return null;
    try {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  const numericOrNull = (value) => {
    if (value === null || value === undefined || value === '-' || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const mapCurve = (curve) => {
    if (!curve || typeof curve !== 'object') return null;
    return curve;
  };

  const fermentation = record.fermentation ?? {};
  const distillation = (record.distillation_runs && record.distillation_runs[0]) ?? {};
  const cask = record.cask ?? {};

  const tailsSegments = distillation.cut_points?.filter((cut) => cut.phase?.toLowerCase() === 'tails')
    .map((segment) => ({
      time: segment.time ?? null,
      volume_l: numericOrNull(segment.volume_l),
      abv_percent: numericOrNull(segment.abv_percent),
      lal: numericOrNull(segment.lal),
      notes: segment.notes ?? null
    })) ?? null;

  const heartsCut = distillation.cut_points?.find((cut) => cut.phase?.toLowerCase() === 'hearts');
  const headsCut = distillation.cut_points?.find((cut) => cut.phase?.toLowerCase() === 'heads');

  return {
    batch_id: record.batch_id,
    product_name: record.product ?? record.product_name ?? 'Rum',
    product_type: (record.product_variant?.includes('cane') ? 'cane_spirit' : 'rum'),
    still_used: 'Roberta',

    fermentation_start_date: isoOrNull(fermentation.start_date ?? record.date),
    substrate_type: fermentation.substrate ?? fermentation?.substrate?.material ?? null,
    substrate_batch: fermentation.substrate_batch ?? fermentation?.substrate?.batch ?? null,
    substrate_mass_kg: numericOrNull(fermentation.substrate_mass_kg ?? fermentation?.substrate?.mass_kg),
    water_mass_kg: numericOrNull(fermentation.water_mass_kg ?? fermentation?.substrate?.water_mass_kg),
    initial_brix: numericOrNull(fermentation.brix_initial ?? fermentation?.substrate?.initial_brix),
    initial_ph: numericOrNull(fermentation.ph_initial ?? fermentation?.substrate?.initial_ph),

    dunder_added: fermentation.dunder ? fermentation.dunder !== '-' : null,
    dunder_type: fermentation.dunder_type ?? fermentation.dunder ?? null,
    dunder_volume_l: numericOrNull(fermentation.dunder_volume_l ?? fermentation?.dunder?.volume_l),
    dunder_ph: numericOrNull(fermentation.dunder_ph ?? fermentation?.dunder?.ph),

    anti_foam_ml: numericOrNull(fermentation.antifoam_ml ?? fermentation?.additives?.anti_foam_ml),
    citric_acid_g: numericOrNull(fermentation.citric_acid_g ?? fermentation?.additives?.citric_acid_g),
    fermaid_g: numericOrNull(fermentation.fermaid_g ?? fermentation?.additives?.fermaid_g),
    dap_g: numericOrNull(fermentation.dap_g ?? fermentation?.additives?.dap_g),
    calcium_carbonate_g: numericOrNull(fermentation.calcium_carbonate_g ?? fermentation?.additives?.calcium_carbonate_g),
    additional_nutrients: fermentation.additional_nutrients ?? null,

    yeast_type: fermentation.yeast_type ?? fermentation?.yeast?.strain ?? null,
    yeast_mass_g: numericOrNull(fermentation.yeast_mass_g ?? fermentation?.yeast?.mass_g),
    yeast_rehydration_temp_c: numericOrNull(fermentation.yeast_rehydration_temp_c ?? fermentation?.yeast?.rehydration_temp_c),
    yeast_rehydration_time_min: numericOrNull(fermentation.yeast_rehydration_time_min ?? fermentation?.yeast?.rehydration_time_min),

    temperature_curve: mapCurve(fermentation.temperature_profile ?? fermentation.temperature_curve),
    brix_curve: mapCurve(fermentation.brix_profile ?? fermentation.brix_curve),
    ph_curve: mapCurve(fermentation.ph_profile ?? fermentation.ph_curve),

    fermentation_duration_hours: numericOrNull(fermentation.duration_hours),
    final_brix: numericOrNull(fermentation.final_brix),
    final_ph: numericOrNull(fermentation.final_ph),
    final_abv_percent: numericOrNull(fermentation.final_abv_percent),
    fermentation_notes: fermentation.notes ?? record.notes ?? null,

    distillation_date: isoOrNull(distillation.date),
    boiler_volume_l: numericOrNull(distillation.boiler_volume_l ?? distillation.boiler?.volume_l),
    boiler_abv_percent: numericOrNull(distillation.boiler_abv_percent ?? distillation.boiler?.abv_percent),
    boiler_lal: numericOrNull(distillation.boiler_lal ?? distillation.boiler?.lal),

    retort1_content: distillation.retort_1?.content ?? (distillation.retorts?.[0]?.content ?? null),
    retort1_volume_l: numericOrNull(distillation.retort_1?.volume_l ?? distillation.retorts?.[0]?.volume_l),
    retort1_abv_percent: numericOrNull(distillation.retort_1?.abv_percent ?? distillation.retorts?.[0]?.abv_percent),
    retort1_lal: numericOrNull(distillation.retort_1?.lal ?? distillation.retorts?.[0]?.lal),

    retort2_content: distillation.retort_2?.content ?? (distillation.retorts?.[1]?.content ?? null),
    retort2_volume_l: numericOrNull(distillation.retort_2?.volume_l ?? distillation.retorts?.[1]?.volume_l),
    retort2_abv_percent: numericOrNull(distillation.retort_2?.abv_percent ?? distillation.retorts?.[1]?.abv_percent),
    retort2_lal: numericOrNull(distillation.retort_2?.lal ?? distillation.retorts?.[1]?.lal),

    boiler_elements: distillation.heating?.boiler_elements ?? distillation.heat_profile?.boiler_elements ?? null,
    retort1_elements: distillation.heating?.retort_1_elements ?? distillation.heat_profile?.retort1_elements ?? null,
    retort2_elements: distillation.heating?.retort_2_elements ?? distillation.heat_profile?.retort2_elements ?? null,
    distillation_start_time: distillation.heating?.boiler_start_time ?? distillation.heat_profile?.start_time ?? null,

    foreshots_time: distillation.first_spirit?.time ?? distillation.cuts?.foreshots?.time ?? null,
    foreshots_abv_percent: numericOrNull(distillation.first_spirit?.abv_percent ?? distillation.cuts?.foreshots?.abv_percent),
    foreshots_notes: distillation.cuts?.foreshots?.notes ?? null,

    heads_time: headsCut?.time ?? null,
    heads_volume_l: numericOrNull(headsCut?.volume_l),
    heads_abv_percent: numericOrNull(headsCut?.abv_percent),
    heads_lal: numericOrNull(headsCut?.lal),
    heads_notes: headsCut?.notes ?? null,

    hearts_time: heartsCut?.time ?? null,
    hearts_volume_l: numericOrNull(heartsCut?.volume_l),
    hearts_abv_percent: numericOrNull(heartsCut?.abv_percent),
    hearts_lal: numericOrNull(heartsCut?.lal),
    hearts_notes: heartsCut?.notes ?? null,

    tails_segments: tailsSegments,

    total_lal_start: numericOrNull(distillation.summary?.lal_in ?? distillation.yield?.total_lal_start),
    total_lal_end: numericOrNull(distillation.summary?.lal_out ?? distillation.yield?.total_lal_end),
    lal_loss: numericOrNull(distillation.summary?.lal_out && distillation.summary?.lal_in
      ? distillation.summary.lal_in - distillation.summary.lal_out
      : distillation.yield?.lal_loss),
    heart_yield_percent: numericOrNull(distillation.summary?.heart_yield_percent ?? distillation.yield?.heart_fraction_percent),
    distillation_notes: distillation.notes ?? null,

    output_product_name: cask.product_name ?? record.product ?? null,
    fill_date: isoOrNull(cask.fill_date),
    cask_number: cask.cask_number ?? cask.number ?? null,
    cask_origin: cask.origin ?? null,
    cask_type: cask.type ?? null,
    cask_size_l: numericOrNull(cask.size_l ?? cask.volume_filled_l),
    fill_abv_percent: numericOrNull(cask.fill_abv_percent),
    volume_filled_l: numericOrNull(cask.volume_filled_l),
    lal_filled: numericOrNull(cask.lal_filled),

    maturation_location: cask.maturation_location ?? null,
    expected_bottling_date: isoOrNull(cask.expected_bottling_date),

    notes: record.notes ?? null
  };
}

async function importRumBatches() {
  try {
    const fileContent = await readFile(CONFIG.rum.datasetPath, 'utf8');
    const records = JSON.parse(fileContent);

    if (!Array.isArray(records)) {
      throw new Error('Rum dataset is not an array');
    }

    console.log(`Found ${records.length} rum records to process`);

    let success = 0;
    for (const record of records) {
      const normalized = normalizeRumRecord(record);
      const batchId = normalized.batch_id;
      console.log(`\n🥃 Processing ${batchId}...`);

      const { error } = await supabase
        .from(CONFIG.rum.table)
        .upsert({
          ...normalized,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'batch_id'
        });

      if (error) {
        console.error(`❌ Error for ${batchId}:`, error.message);
      } else {
        console.log(`✅ ${batchId}`);
        success++;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log(`\n✨ Rum import complete: ${success}/${records.length} successful`);
    return success === records.length;
  } catch (error) {
    console.error('Fatal error during rum import:', error.message ?? error);
    return false;
  }
}

async function main() {
  if (!await testConnection()) {
    console.log('\n❌ Cannot proceed without a valid connection');
    process.exit(1);
  }

  try {
    if (MODE === 'rum') {
      await importRumBatches();
      return;
    }

    const files = await readdir(CONFIG.gin.batchesDir);
    const batchFiles = files.filter(CONFIG.gin.filePredicate).sort();

    console.log(`\nFound ${batchFiles.length} gin batch files to process`);

    let success = 0;
    for (const file of batchFiles) {
      const result = await importGinBatch(file);
      if (result) success++;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log(`\n✨ Gin import complete: ${success}/${batchFiles.length} successful`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
