import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'fs/promises';
import { join, isAbsolute } from 'path';
import 'dotenv/config';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Determine which dataset to import
const requestedDataset = process.argv[2]?.toLowerCase();
const MODE = requestedDataset === 'rum' ? 'rum' : 'gin';
const datasetArg = process.argv[3];
const RUM_DATASET_OVERRIDE = process.env.RUM_DATASET_PATH || datasetArg || '';
const FILL_ZEROS = (process.env.FILL_ZEROS === '1' || process.env.FILL_ZEROS === 'true');
const DRY_RUN = (process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true');

// Load .env.local if present (before reading env into CONFIG)
try {
  const envLocalPath = join(process.cwd(), '.env.local');
  if (existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  }
} catch {}

// Configuration shared between datasets
const CONFIG = {
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co',
  supabaseKey: process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
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

// Allow overriding rum dataset path via env or CLI arg
if (RUM_DATASET_OVERRIDE) {
  CONFIG.rum.datasetPath = isAbsolute(RUM_DATASET_OVERRIDE)
    ? RUM_DATASET_OVERRIDE
    : join(process.cwd(), RUM_DATASET_OVERRIDE);
}

if (!CONFIG.supabaseKey && !DRY_RUN) {
  console.error('❌ Error: SUPABASE_KEY environment variable is not set');
  console.log('Please set it in your .env file or run:');
  console.log('export SUPABASE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = (!DRY_RUN)
  ? createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth: { persistSession: false } })
  : null;

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  try {
    if (DRY_RUN) {
      console.log('✅ Dry run mode: skipping connection test');
      return true;
    }
    const tableToTest = MODE === 'rum' ? CONFIG.rum.table : CONFIG.gin.table;
    const { data, error } = await supabase.from(tableToTest).select('*').limit(1);
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
    if (value === null || value === undefined || value === '-' || value === '') return FILL_ZEROS ? 0 : null;
    const num = Number(value);
    return Number.isNaN(num) ? (FILL_ZEROS ? 0 : null) : num;
  };

  const mapCurve = (curve) => {
    if (!curve || typeof curve !== 'object') return null;
    return curve;
  };

  const fermentation = record.fermentation ?? {};
  const distillation = (record.distillation_runs && record.distillation_runs[0]) ?? (record.distillation ?? {});
  const cask = record.cask ?? (record.maturation ?? {});

  // Merge substrate info if present at root-level
  const substrate = record.substrate ?? fermentation.substrate ?? fermentation?.substrate?.material ?? null;
  const substrateBatch = (record.substrate && (record.substrate.batch_number || record.substrate.batch))
    ?? fermentation.substrate_batch
    ?? fermentation?.substrate?.batch
    ?? null;
  const substrateMassKg = (record.substrate && record.substrate.mass_kg)
    ?? fermentation.substrate_mass_kg
    ?? fermentation?.substrate?.mass_kg;
  const waterMassKg = (record.substrate && record.substrate.water_mass_kg)
    ?? fermentation.water_mass_kg
    ?? fermentation?.substrate?.water_mass_kg;

  const tailsSegmentsFromCutPoints = distillation.cut_points?.filter((cut) => (cut.phase || '').toLowerCase() === 'tails')
    .map((segment) => ({
      time: segment.time ?? null,
      volume_l: numericOrNull(segment.volume_l),
      abv_percent: numericOrNull(segment.abv_percent),
      lal: numericOrNull(segment.lal),
      notes: segment.notes ?? null
    })) ?? [];

  // Support cuts provided as object: { foreshots, heads, hearts, early_tails, late_tails }
  const cutsObj = distillation.cuts || {};
  const earlyTails = cutsObj.early_tails ? {
    time: cutsObj.early_tails.time ?? null,
    volume_l: numericOrNull(cutsObj.early_tails.volume_L ?? cutsObj.early_tails.volume_l),
    abv_percent: numericOrNull(cutsObj.early_tails.abv_percent),
    lal: numericOrNull(cutsObj.early_tails.lal),
    notes: cutsObj.early_tails.notes ?? null,
    segment: 'early'
  } : null;
  const lateTails = cutsObj.late_tails ? {
    time: cutsObj.late_tails.time ?? null,
    volume_l: numericOrNull(cutsObj.late_tails.volume_L ?? cutsObj.late_tails.volume_l),
    abv_percent: numericOrNull(cutsObj.late_tails.abv_percent),
    lal: numericOrNull(cutsObj.late_tails.lal),
    notes: cutsObj.late_tails.notes ?? null,
    segment: 'late'
  } : null;
  const tailsSegments = [
    ...tailsSegmentsFromCutPoints,
    ...(earlyTails ? [{ time: earlyTails.time, volume_l: earlyTails.volume_l, abv_percent: earlyTails.abv_percent, lal: earlyTails.lal, notes: earlyTails.notes }] : []),
    ...(lateTails ? [{ time: lateTails.time, volume_l: lateTails.volume_l, abv_percent: lateTails.abv_percent, lal: lateTails.lal, notes: lateTails.notes }] : [])
  ];

  const heartsCut = distillation.cut_points?.find((cut) => (cut.phase || '').toLowerCase() === 'hearts')
    || (cutsObj.hearts ? {
      time: cutsObj.hearts.time ?? null,
      volume_l: cutsObj.hearts.volume_L ?? cutsObj.hearts.volume_l,
      abv_percent: cutsObj.hearts.abv_percent,
      lal: cutsObj.hearts.lal,
      notes: cutsObj.hearts.notes ?? null
    } : null);
  const headsCut = distillation.cut_points?.find((cut) => (cut.phase || '').toLowerCase() === 'heads')
    || (cutsObj.heads ? {
      time: cutsObj.heads.time ?? null,
      volume_l: cutsObj.heads.volume_L ?? cutsObj.heads.volume_l,
      abv_percent: cutsObj.heads.abv_percent,
      lal: cutsObj.heads.lal,
      notes: cutsObj.heads.notes ?? null
    } : null);

  // Helper to get retorts from different shapes
  const getRetortByIndex = (d, idx) => {
    const direct = idx === 0 ? d.retort_1 : d.retort_2;
    if (direct) return direct;
    const r = d.retorts;
    if (Array.isArray(r)) return r[idx] || null;
    if (r && typeof r === 'object') {
      if (idx === 0) return r.retort_1 || r.retort1 || r['1'] || null;
      if (idx === 1) return r.retort_2 || r.retort2 || r['2'] || null;
    }
    return null;
  };
  const rt1 = getRetortByIndex(distillation, 0) || {};
  const rt2 = getRetortByIndex(distillation, 1) || {};

  return {
    batch_id: record.batch_id,
    product_name: record.product ?? record.product_name ?? 'Rum',
    product_type: (record.product_variant?.includes('cane') ? 'cane_spirit' : 'rum'),
    still_used: 'Roberta',

    fermentation_start_date: isoOrNull(fermentation.start_date ?? record.date),
    substrate_type: substrate,
    substrate_batch: substrateBatch,
    substrate_mass_kg: numericOrNull(substrateMassKg),
    water_mass_kg: numericOrNull(waterMassKg),
    initial_brix: numericOrNull(fermentation.brix_initial ?? fermentation?.substrate?.initial_brix ?? record.substrate?.initial_brix ?? record.substrate?.starting_brix),
    initial_ph: numericOrNull(fermentation.ph_initial ?? fermentation?.substrate?.initial_ph ?? record.substrate?.initial_pH ?? fermentation.starting_pH),

    dunder_added: (record.substrate?.dunder_added ?? (fermentation.dunder ? fermentation.dunder !== '-' : null)),
    dunder_type: fermentation.dunder_type ?? fermentation.dunder ?? null,
    dunder_volume_l: numericOrNull(fermentation.dunder_volume_l ?? fermentation?.dunder?.volume_l),
    dunder_ph: numericOrNull(fermentation.dunder_ph ?? fermentation?.dunder?.ph ?? record.substrate?.dunder_pH),

    anti_foam_ml: numericOrNull(fermentation.antifoam_ml ?? fermentation?.additives?.anti_foam_ml),
    citric_acid_g: numericOrNull(fermentation.citric_acid_g ?? fermentation?.additives?.citric_acid_g),
    fermaid_g: numericOrNull(fermentation.fermaid_g ?? fermentation?.additives?.fermaid_g),
    dap_g: numericOrNull(fermentation.dap_g ?? fermentation?.additives?.dap_g),
    calcium_carbonate_g: numericOrNull(fermentation.calcium_carbonate_g ?? fermentation?.additives?.calcium_carbonate_g),
    additional_nutrients: fermentation.additional_nutrients ?? null,

    yeast_type: fermentation.yeast_type ?? fermentation?.yeast?.strain ?? null,
    yeast_mass_g: numericOrNull(fermentation.yeast_mass_g ?? fermentation?.yeast?.mass_g),
    yeast_rehydration_temp_c: numericOrNull(fermentation.yeast_rehydration_temp_c ?? fermentation?.yeast?.rehydration_temp_c ?? fermentation.rehydration_temp_C),
    yeast_rehydration_time_min: numericOrNull(fermentation.yeast_rehydration_time_min ?? fermentation?.yeast?.rehydration_time_min ?? fermentation.rehydration_time_min),

    temperature_curve: mapCurve(fermentation.temperature_profile ?? fermentation.temperature_curve ?? fermentation.measurements),
    brix_curve: mapCurve(fermentation.brix_profile ?? fermentation.brix_curve ?? null),
    ph_curve: mapCurve(fermentation.ph_profile ?? fermentation.ph_curve ?? null),

    fermentation_duration_hours: numericOrNull(fermentation.duration_hours),
    final_brix: numericOrNull(fermentation.final_brix),
    final_ph: numericOrNull(fermentation.final_ph),
    final_abv_percent: numericOrNull(fermentation.final_abv_percent ?? record.fermentation?.final_abv_percent),
    fermentation_notes: fermentation.notes ?? record.notes ?? null,

    distillation_date: isoOrNull(distillation.date),
    boiler_volume_l: numericOrNull(distillation.boiler_volume_l ?? distillation.boiler?.volume_L ?? distillation.boiler?.volume_l),
    boiler_abv_percent: numericOrNull(distillation.boiler_abv_percent ?? distillation.boiler?.abv_percent),
    boiler_lal: numericOrNull(distillation.boiler_lal ?? distillation.boiler?.lal),

    retort1_content: rt1?.content ?? null,
    retort1_volume_l: numericOrNull(rt1?.volume_L ?? rt1?.volume_l),
    retort1_abv_percent: numericOrNull(rt1?.abv_percent),
    retort1_lal: numericOrNull(rt1?.lal),

    retort2_content: rt2?.content ?? null,
    retort2_volume_l: numericOrNull(rt2?.volume_L ?? rt2?.volume_l),
    retort2_abv_percent: numericOrNull(rt2?.abv_percent),
    retort2_lal: numericOrNull(rt2?.lal),

    boiler_elements: distillation.heating?.boiler_elements ?? distillation.heating?.elements_boiler ?? distillation.heat_profile?.boiler_elements ?? null,
    retort1_elements: distillation.heating?.retort_1_elements ?? distillation.heating?.r1_elements ?? distillation.heat_profile?.retort1_elements ?? null,
    retort2_elements: distillation.heating?.retort_2_elements ?? distillation.heating?.r2_elements ?? distillation.heat_profile?.retort2_elements ?? null,
    distillation_start_time: distillation.heating?.boiler_start_time ?? distillation.heat_profile?.start_time ?? null,

    foreshots_time: distillation.first_spirit?.time ?? distillation.heating?.first_spirit_time ?? distillation.cuts?.foreshots?.time ?? null,
    foreshots_abv_percent: numericOrNull(distillation.first_spirit?.abv_percent ?? distillation.heating?.first_spirit_abv_percent ?? distillation.cuts?.foreshots?.abv_percent),
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

    total_lal_start: numericOrNull(distillation.summary?.lal_in ?? distillation.yield?.total_lal_start ?? distillation.totals?.lal_start),
    total_lal_end: numericOrNull(distillation.summary?.lal_out ?? distillation.yield?.total_lal_end ?? distillation.totals?.lal_end),
    lal_loss: numericOrNull(
      (distillation.summary?.lal_out && distillation.summary?.lal_in)
        ? distillation.summary.lal_in - distillation.summary.lal_out
        : (distillation.yield?.lal_loss ?? distillation.totals?.loss_LAL)
    ),
    heart_yield_percent: numericOrNull(distillation.summary?.heart_yield_percent ?? distillation.yield?.heart_fraction_percent),
    distillation_notes: distillation.notes ?? null,

    output_product_name: cask.product_name ?? record.product ?? null,
    fill_date: isoOrNull(cask.fill_date),
    cask_number: cask.cask_number ?? cask.number ?? null,
    cask_origin: cask.origin ?? cask.cask_info ?? null,
    cask_type: cask.type ?? null,
    cask_size_l: numericOrNull(cask.size_l ?? cask.volume_filled_l ?? cask.volume_L),
    fill_abv_percent: numericOrNull(cask.fill_abv_percent ?? cask.fill_abv_percent),
    volume_filled_l: numericOrNull(cask.volume_filled_l ?? cask.volume_L),
    lal_filled: numericOrNull(cask.lal_filled),

    maturation_location: cask.maturation_location ?? null,
    expected_bottling_date: isoOrNull(cask.expected_bottling_date),

    notes: record.notes ?? null
  };
}

async function importRumBatches() {
  try {
    const fileContent = await readFile(CONFIG.rum.datasetPath, 'utf8');
    let records;
    try {
      records = JSON.parse(fileContent);
    } catch {
      records = null;
    }
    // If not an array, attempt robust extraction of concatenated JSON objects
    if (!Array.isArray(records)) {
      const chunks = [];
      let inString = false, escape = false, depth = 0, start = -1;
      for (let i = 0; i < fileContent.length; i++) {
        const ch = fileContent[i];
        if (inString) {
          if (escape) escape = false;
          else if (ch === '\\') escape = true;
          else if (ch === '"') inString = false;
        } else {
          if (ch === '"') inString = true;
          else if (ch === '{') { if (depth === 0) start = i; depth++; }
          else if (ch === '}') { if (depth > 0 && --depth === 0 && start >= 0) { chunks.push(fileContent.slice(start, i + 1)); start = -1; } }
        }
      }
      const parsed = [];
      for (const c of chunks) {
        try { parsed.push(JSON.parse(c)); } catch { /* ignore */ }
      }
      records = parsed;
    }

    console.log(`Found ${records.length} rum records to process`);

    let success = 0;
    const normalizedOut = [];
    for (const record of records) {
      const normalized = normalizeRumRecord(record);
      const batchId = normalized.batch_id;
      console.log(`\n🥃 Processing ${batchId}...`);

      if (DRY_RUN) {
        normalizedOut.push(normalized);
        console.log(`✅ (dry) ${batchId}`);
        success++;
      } else {
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
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (DRY_RUN) {
      const inPath = CONFIG.rum.datasetPath;
      const base = (typeof inPath === 'string') ? inPath.split(/[/\\]/).pop() : 'dataset.json';
      const stem = base.replace(/\.json$/i, '');
      const outPath = join(process.cwd(), 'scripts', 'check', `${stem}.normalized.json`);
      await (await import('fs')).promises.writeFile(outPath, JSON.stringify(normalizedOut, null, 2), 'utf-8');
      console.log(`\n📝 Dry run output written to ${outPath}`);
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
