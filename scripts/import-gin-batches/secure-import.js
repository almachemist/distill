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
    batchesDir: join(process.cwd(), 'scripts/data/batches'),
    filePredicate: (filename) => (/^(signature-dry-gin-|rainforest-gin-)/i).test(filename) && filename.endsWith('.json'),
    table: 'distillation_runs'
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

    if (!run) {
      console.warn(`⚠️ No runs found in ${batchFile}`);
      return false;
    }

    const runId = run.run_id || run.batch_id || null;
    if (!runId) {
      console.warn(`⚠️ Skipping ${batchFile}: missing run_id/batch_id`);
      return false;
    }

    console.log(`\n📦 Processing ${runId}...`);

    // Normalize still name to CARRIE for Supabase record
    const stillUsed = 'CARRIE';
    if (run.still_used && run.still_used.toUpperCase() !== 'CARRIE') {
      console.log(`   Normalized still from ${run.still_used} to CARRIE`);
    }

    const charge = run.charge || (run.charge_adjustment ? {
      components: run.charge_adjustment.sources,
      total: run.charge_adjustment.total_charge
    } : {});
    const cuts = (run.distillation && run.distillation.cuts) || run.cuts || {};
    const hearts = cuts.hearts || {};
    const heads = cuts.heads || {};
    const foreshots = cuts.foreshots || {};
    const tailsSegments = cuts.tails_segments || run.tails_segments || [];
    const chargeTotals = charge.total || run.charge_adjustment?.total_charge || {};
    const dilution = run.dilution || {};
    const totals = run.totals?.total_output || {};

    const numericOrNull = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };

    const buildLegacyChargeComponents = () => {
      const legacy = run.charge || {};
      const components = [];

      if (
        legacy.ethanol_source ||
        legacy.ethanol_volume_L !== undefined
      ) {
        components.push({
          source: legacy.ethanol_source || 'Ethanol',
          type: 'Ethanol',
          volume_l: numericOrNull(legacy.ethanol_volume_L),
          abv_percent: numericOrNull(legacy.ethanol_abv_percent),
          lal: numericOrNull(legacy.ethanol_LAL)
        });
      }

      if (legacy.water_volume_L !== undefined) {
        components.push({
          source: 'Filtered Water',
          type: 'Water',
          volume_l: numericOrNull(legacy.water_volume_L),
          abv_percent: numericOrNull(legacy.water_abv_percent),
          lal: numericOrNull(legacy.water_LAL)
        });
      }

      if (legacy.other_volume_L !== undefined && numericOrNull(legacy.other_volume_L) !== null) {
        components.push({
          source: 'Other',
          type: 'Other',
          volume_l: numericOrNull(legacy.other_volume_L),
          abv_percent: null,
          lal: null
        });
      }

      if (!components.length) {
        components.push({
          source: 'Charge',
          type: 'Unknown',
          volume_l: numericOrNull(legacy.total_charge_L),
          abv_percent: numericOrNull(legacy.charge_abv_percent),
          lal: numericOrNull(legacy.total_LAL)
        });
      }

      return components;
    };

    const chargeComponents = Array.isArray(charge.components) && charge.components.length
      ? charge.components
      : buildLegacyChargeComponents();

    const resolvedHearts = Object.keys(hearts).length ? hearts : totals.hearts || {};
    const resolvedHeads = Object.keys(heads).length ? heads : totals.heads || {};
    const resolvedForeshots = Object.keys(foreshots).length ? foreshots : totals.foreshots || {};
    const resolvedTails = totals.tails || {};

    const record = {
      batch_id: runId,
      sku: recipe || run.recipe || run.product || null,
      display_name: run.display_name || recipe || run.product || `Cane Spirit ${runId}`,
      still_used: stillUsed,
      date: run.date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      charge_components: chargeComponents,
      charge_total_volume_l: chargeTotals.volume_l ?? charge.total_volume_l ?? numericOrNull(run.charge?.total_charge_L) ?? null,
      charge_total_abv_percent: chargeTotals.abv_percent ?? charge.total_abv_percent ?? numericOrNull(run.charge?.charge_abv_percent) ?? null,
      charge_total_lal: chargeTotals.lal ?? charge.total_lal ?? numericOrNull(run.charge?.total_LAL) ?? null,

      boiler_on_time: run.boiler_on_time || charge.boiler_on_time || null,
      heating_elements: run.heating_elements || charge.heating_elements || null,
      power_setting: run.power_setting || null,

      foreshots_volume_l: resolvedForeshots.volume_l ?? foreshots.volume_l ?? null,
      foreshots_abv_percent: resolvedForeshots.abv_percent ?? foreshots.abv_percent ?? null,
      foreshots_lal: resolvedForeshots.lal ?? foreshots.lal ?? null,

      heads_volume_l: resolvedHeads.volume_l ?? heads.volume_l ?? null,
      heads_abv_percent: resolvedHeads.abv_percent ?? heads.abv_percent ?? null,
      heads_lal: resolvedHeads.lal ?? heads.lal ?? null,

      hearts_volume_l: resolvedHearts.volume_l ?? hearts.volume_l ?? null,
      hearts_abv_percent: resolvedHearts.abv_percent ?? hearts.abv_percent ?? null,
      hearts_lal: resolvedHearts.lal ?? hearts.lal ?? null,

      tails_volume_l: run.tails_volume_l ?? resolvedTails.volume_l ?? null,
      tails_abv_percent: run.tails_abv_percent ?? resolvedTails.abv_percent ?? null,
      tails_lal: run.tails_lal ?? resolvedTails.lal ?? null,
      tails_segments: Array.isArray(tailsSegments) && tailsSegments.length > 0
        ? tailsSegments
        : (Array.isArray(run.totals?.tail_segments) ? run.totals.tail_segments : null),

      dilution_steps: Array.isArray(dilution.steps) ? dilution.steps : null,
      final_output_volume_l: dilution.final_output_volume_l ?? dilution.final_volume_l ?? null,
      final_output_abv_percent: dilution.final_output_abv_percent ?? null,
      final_output_lal: dilution.final_output_lal ?? null,

      notes: run.notes || (run.distillation && run.distillation.notes) || null,
    };

    const { error } = await supabase
      .from(CONFIG.gin.table)
      .upsert(record, { onConflict: 'batch_id' });

    if (error) throw error;
    console.log(`✅ ${runId} - ${record.display_name || record.sku || 'Cane Spirit'} (${record.date || 'no date'})`);
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

  const batchId = record.batch_id || record.batchId || record.id || 'UNKNOWN';

  const fermentation = record.fermentation ?? {};
  const distillationRuns = Array.isArray(record.distillation_runs)
    ? record.distillation_runs.filter(Boolean)
    : [];
  const distillation = (distillationRuns[0]) ?? (record.distillation ?? {});

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

  let heartsVolume = numericOrNull(heartsCut?.volume_l);
  let heartsAbv = numericOrNull(heartsCut?.abv_percent);
  let heartsLal = numericOrNull(heartsCut?.lal);
  let usedCombinedHearts = false;

  const aggregateHeartsFromRuns = (runs) => {
    if (!Array.isArray(runs) || runs.length === 0) {
      return { volume: null, abv: null, lal: null, validRuns: 0, runCount: 0, latestIso: null };
    }

    let totalVolume = 0;
    let totalLal = 0;
    let validRuns = 0;
    let latest = null;

    for (const run of runs) {
      const heartData = extractHearts(run);
      if (!heartData) continue;

      validRuns++;

      if (heartData.volume !== null) {
        totalVolume += heartData.volume;
      }

      if (heartData.lal !== null) {
        totalLal += heartData.lal;
      }

      if (heartData.isoDate) {
        const ts = Date.parse(heartData.isoDate);
        if (!Number.isNaN(ts) && (!latest || ts > latest.ts)) {
          latest = { iso: heartData.isoDate, ts };
        }
      }
    }

    if (validRuns === 0) {
      return { volume: null, abv: null, lal: null, validRuns: 0, runCount: runs.length, latestIso: null };
    }

    const volumeFinal = totalVolume > 0 ? Number(totalVolume.toFixed(3)) : null;
    const lalFinal = totalLal > 0 ? Number(totalLal.toFixed(3)) : null;
    const abvFinal = (volumeFinal !== null && lalFinal !== null && volumeFinal > 0)
      ? Number(((lalFinal / volumeFinal) * 100).toFixed(3))
      : null;

    return {
      volume: volumeFinal,
      abv: abvFinal,
      lal: lalFinal,
      validRuns,
      runCount: runs.length,
      latestIso: latest ? latest.iso : null
    };
  };

  const aggregatedHearts = aggregateHeartsFromRuns(distillationRuns);

  if (aggregatedHearts.validRuns > 0) {
    if (aggregatedHearts.volume !== null) {
      heartsVolume = aggregatedHearts.volume;
    }
    if (aggregatedHearts.lal !== null) {
      heartsLal = aggregatedHearts.lal;
    }
    if (aggregatedHearts.abv !== null) {
      heartsAbv = aggregatedHearts.abv;
    } else if (heartsVolume !== null && heartsLal !== null && heartsVolume > 0) {
      heartsAbv = Number(((heartsLal / heartsVolume) * 100).toFixed(3));
    }
  }

  const combinedHearts = distillation.hearts || {};
  if (combinedHearts && (combinedHearts.volume_l !== undefined || combinedHearts.lal !== undefined)) {
    const combinedVolume = numericOrNull(combinedHearts.volume_l ?? combinedHearts.volume ?? combinedHearts.total_volume_l);
    const combinedLal = numericOrNull(combinedHearts.lal ?? combinedHearts.total_lal);
    const combinedAbv = numericOrNull(combinedHearts.abv_percent ?? combinedHearts.abv ?? combinedHearts.avg_abv_percent);

    if (combinedVolume !== null) heartsVolume = combinedVolume;

    if (combinedLal !== null) heartsLal = combinedLal;

    if (combinedAbv !== null) heartsAbv = combinedAbv;

    usedCombinedHearts = true;
  }

  if (aggregatedHearts.validRuns > 0) {
    const logLabel = usedCombinedHearts
      ? 'Applied combined hearts summary'
      : `Aggregated hearts across ${aggregatedHearts.validRuns}/${aggregatedHearts.runCount} distillations`;
    console.log(`   ↳ ${logLabel} -> ${heartsVolume ?? '—'} L (${heartsLal ?? '—'} LAL @ ${heartsAbv ?? '—'}% ABV)`);
  }

  const distillationDateFromRuns = (() => {
    if (aggregatedHearts.latestIso) return aggregatedHearts.latestIso;
    const isoDates = [];
    for (const run of distillationRuns) {
      const iso = isoOrNull(run?.date ?? run?.distillation_date);
      if (iso) isoDates.push(iso);
    }
    if (isoDates.length === 0) return null;
    return isoDates.reduce((latest, iso) => {
      const ts = Date.parse(iso);
      if (Number.isNaN(ts)) return latest;
      if (!latest || ts > latest.ts) {
        return { iso, ts };
      }
      return latest;
    }, null)?.iso ?? null;
  })();

  const distillationDateFinal = distillationDateFromRuns
    ?? isoOrNull(distillation.date)
    ?? isoOrNull(record.distillation_date);

  return {
    batch_id: batchId,
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

    distillation_date: distillationDateFinal,
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
    hearts_volume_l: heartsVolume,
    hearts_abv_percent: heartsAbv,
    hearts_lal: heartsLal,
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

    output_product_name: record.product ?? null,
    fill_date: isoOrNull(record.fill_date),
    cask_number: record.cask_number ?? record.number ?? null,
    cask_origin: record.origin ?? record.cask_info ?? null,
    cask_type: record.type ?? null,
    cask_size_l: numericOrNull(record.size_l ?? record.volume_filled_l ?? record.volume_L),
    fill_abv_percent: numericOrNull(record.fill_abv_percent),
    volume_filled_l: numericOrNull(record.volume_filled_l ?? record.volume_L),
    lal_filled: numericOrNull(record.lal_filled),

    maturation_location: record.maturation_location ?? null,
    expected_bottling_date: isoOrNull(record.expected_bottling_date),

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

    const cloneRecord = (value) => {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return value;
      }
    };

    const dedupeRuns = (runs) => {
      if (!Array.isArray(runs)) return [];
      const seen = new Set();
      const result = [];
      for (const run of runs) {
        if (!run || typeof run !== 'object') continue;
        const keyParts = [];
        if (run.run_id) keyParts.push(`id:${run.run_id}`);
        if (run.run_number !== undefined) keyParts.push(`num:${run.run_number}`);
        if (run.date) keyParts.push(`date:${run.date}`);
        const key = keyParts.length ? keyParts.join('|') : JSON.stringify(run);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(run);
      }
      return result;
    };

    const mergeRumRecords = (base, incoming) => {
      const merged = cloneRecord(base);
      for (const key of Object.keys(incoming)) {
        const value = incoming[key];
        if (value === undefined || value === null) continue;

        if (key === 'distillation_runs') {
          const baseRuns = Array.isArray(merged.distillation_runs) ? merged.distillation_runs : [];
          const incomingRuns = Array.isArray(value) ? value : [];
          merged.distillation_runs = dedupeRuns([...baseRuns, ...incomingRuns]);
          continue;
        }

        if (Array.isArray(value)) {
          merged[key] = value;
          continue;
        }

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const baseValue = merged[key];
          merged[key] = (baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue))
            ? { ...baseValue, ...value }
            : { ...value };
          continue;
        }

        merged[key] = value;
      }
      return merged;
    };

    const mergeRecordsByBatchId = (list) => {
      if (!Array.isArray(list)) return [];
      const mergedMap = new Map();
      const anonymous = [];
      for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const key = item.batch_id || item.batchId || item.id || null;
        if (!key) {
          anonymous.push(item);
          continue;
        }
        if (!mergedMap.has(key)) {
          mergedMap.set(key, cloneRecord(item));
        } else {
          const combined = mergeRumRecords(mergedMap.get(key), item);
          mergedMap.set(key, combined);
        }
      }
      return [...mergedMap.values(), ...anonymous];
    };

    const originalCount = Array.isArray(records) ? records.length : 0;
    records = mergeRecordsByBatchId(records);
    if (records.length !== originalCount) {
      console.log(`🔁 Consolidated ${originalCount} entries into ${records.length} unique batch records`);
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
