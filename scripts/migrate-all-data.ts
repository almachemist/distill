#!/usr/bin/env tsx
/**
 * Complete Data Migration Script
 * Migrates all static JSON data to remote Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Remote Supabase configuration
const SUPABASE_URL = 'https://dscmknufpfhxjcanzdsr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzY21rbnVmcGZoeGpjYW56ZHNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3NTgzOSwiZXhwIjoyMDc3OTUxODM5fQ.NanLP7UThboH3JUeFqkwy5dovfzxJotf2yljsTQs7rY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Organization ID (from remote database)
const ORG_ID = '00000000-0000-0000-0000-000000000001';

interface MigrationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

const stats: Record<string, MigrationStats> = {};

function initStats(name: string): MigrationStats {
  stats[name] = { total: 0, success: 0, failed: 0, skipped: 0, errors: [] };
  return stats[name];
}

function printStats() {
  console.log('\n' + '='.repeat(80));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(80));
  
  for (const [name, stat] of Object.entries(stats)) {
    console.log(`\n${name}:`);
    console.log(`  Total: ${stat.total}`);
    console.log(`  ✅ Success: ${stat.success}`);
    console.log(`  ⏭️  Skipped: ${stat.skipped}`);
    console.log(`  ❌ Failed: ${stat.failed}`);
    if (stat.errors.length > 0) {
      console.log(`  Errors:`);
      stat.errors.forEach(err => console.log(`    - ${err}`));
    }
  }
  
  const totalSuccess = Object.values(stats).reduce((sum, s) => sum + s.success, 0);
  const totalFailed = Object.values(stats).reduce((sum, s) => sum + s.failed, 0);
  
  console.log('\n' + '='.repeat(80));
  console.log(`OVERALL: ${totalSuccess} succeeded, ${totalFailed} failed`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Migrate Signature Dry Gin batches to distillation_runs table
 */
async function migrateSignatureDryGin() {
  console.log('\n📦 Migrating Signature Dry Gin batches...');
  const stat = initStats('Signature Dry Gin');
  
  const batchDir = path.join(process.cwd(), 'scripts/data/batches');
  const files = fs.readdirSync(batchDir).filter(f => f.startsWith('signature-dry-gin-') && f.endsWith('.json'));
  
  stat.total = files.length;
  console.log(`Found ${files.length} batch files`);
  
  for (const file of files) {
    const filePath = path.join(batchDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!data.runs || data.runs.length === 0) {
      console.log(`⚠️  No runs in ${file}`);
      stat.skipped++;
      continue;
    }
    
    const run = data.runs[0]; // Each file has one run
    
    try {
      // Transform data to match distillation_runs schema
      const record = {
        batch_id: run.run_id,
        sku: run.sku || 'Signature Dry Gin',
        display_name: data.recipe || 'Signature Dry Gin',
        date: run.date,
        still_used: run.still_used === 'Roberta' ? 'Carrie' : run.still_used, // Normalize still name
        
        // Charge components as JSONB
        charge_components: run.charge ? [{
          source: run.charge.ethanol_source,
          volume_l: run.charge.ethanol_volume_L,
          abv_percent: run.charge.ethanol_abv_percent,
          type: 'ethanol'
        }, {
          source: 'Water',
          volume_l: run.charge.water_volume_L,
          type: 'water'
        }] : [],
        
        charge_total_volume_l: run.charge?.total_charge_L,
        charge_total_abv_percent: run.charge?.charge_abv_percent,
        charge_total_lal: run.charge?.total_LAL,
        
        // Botanicals as JSONB
        botanicals: run.botanicals?.filter((b: any) => b.weight_g && b.weight_g > 0).map((b: any) => ({
          name: b.name,
          weight_g: b.weight_g,
          notes: b.notes,
          ratio_percent: b.ratio_percent
        })),
        
        // Still setup
        heating_elements: run.still_setup?.elements,
        plates: run.still_setup?.plates,
        
        // Extract cuts from outputs
        foreshots_volume_l: run.outputs?.find((o: any) => o.phase === 'Foreshots' || o.phase === 'Heads')?.volume_L,
        foreshots_abv_percent: run.outputs?.find((o: any) => o.phase === 'Foreshots' || o.phase === 'Heads')?.abv_percent,
        foreshots_lal: run.outputs?.find((o: any) => o.phase === 'Foreshots' || o.phase === 'Heads')?.LAL,
        
        hearts_volume_l: run.outputs?.find((o: any) => o.phase === 'Hearts')?.volume_L,
        hearts_abv_percent: run.outputs?.find((o: any) => o.phase === 'Hearts')?.abv_percent,
        hearts_lal: run.outputs?.find((o: any) => o.phase === 'Hearts')?.LAL,
        
        tails_volume_l: run.outputs?.find((o: any) => o.phase === 'Tails')?.volume_L,
        tails_abv_percent: run.outputs?.find((o: any) => o.phase === 'Tails')?.abv_percent,
        tails_lal: run.outputs?.find((o: any) => o.phase === 'Tails')?.LAL,
        
        // Dilution steps as JSONB
        dilution_steps: run.dilution_steps,
        
        final_output_volume_l: run.final_output_L,
        final_output_abv_percent: run.dilution_steps?.[run.dilution_steps.length - 1]?.abv_percent,
        final_output_lal: run.dilution_steps?.[run.dilution_steps.length - 1]?.LAL,
        
        notes: run.notes || `Botanicals per LAL: ${run.botanicals_per_LAL_g}g`,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'migration-script'
      };
      
      // Upsert (insert or update if exists)
      const { error } = await supabase
        .from('distillation_runs')
        .upsert(record, { onConflict: 'batch_id' });
      
      if (error) {
        console.log(`❌ Failed to import ${run.run_id}: ${error.message}`);
        stat.failed++;
        stat.errors.push(`${run.run_id}: ${error.message}`);
      } else {
        console.log(`✅ Imported ${run.run_id}`);
        stat.success++;
      }
    } catch (error: any) {
      console.log(`❌ Error processing ${file}: ${error.message}`);
      stat.failed++;
      stat.errors.push(`${file}: ${error.message}`);
    }
  }
}

/**
 * Migrate Rainforest Gin batches
 */
async function migrateRainforestGin() {
  console.log('\n📦 Migrating Rainforest Gin batches...');
  const stat = initStats('Rainforest Gin');

  const filePath = path.join(process.cwd(), 'scripts/rainforest-gin-data.json');

  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Rainforest gin data file not found');
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  // The file has a "gin_runs" array
  const batches = data.gin_runs || [];

  stat.total = batches.length;
  
  for (const batch of batches) {
    try {
      const record = {
        batch_id: batch.batch_id || batch.id,
        sku: batch.sku || 'Rainforest Gin',
        display_name: batch.product_name || 'Rainforest Gin',
        date: batch.distillation_date,
        still_used: batch.still_used === 'Roberta' ? 'Carrie' : batch.still_used,
        
        charge_components: [{
          source: 'Boiler Charge',
          volume_l: batch.boiler_charge_l,
          abv_percent: batch.boiler_abv_percent,
          type: 'wash'
        }],
        
        charge_total_volume_l: batch.boiler_charge_l,
        charge_total_abv_percent: batch.boiler_abv_percent,
        
        botanicals: batch.botanicals,
        
        foreshots_volume_l: batch.distillation?.foreshots?.volume_l,
        foreshots_abv_percent: batch.distillation?.foreshots?.abv_percent,
        
        heads_volume_l: batch.distillation?.heads?.volume_l,
        heads_abv_percent: batch.distillation?.heads?.abv_percent,
        
        hearts_volume_l: batch.distillation?.hearts?.volume_l,
        hearts_abv_percent: batch.distillation?.hearts?.abv_percent,
        
        tails_volume_l: batch.distillation?.tails?.volume_l,
        tails_abv_percent: batch.distillation?.tails?.abv_percent,
        
        dilution_steps: batch.dilution,
        
        final_output_volume_l: batch.bottling?.final_volume_l,
        final_output_abv_percent: batch.bottling?.final_abv_percent,
        
        notes: batch.notes,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'migration-script'
      };
      
      const { error } = await supabase
        .from('distillation_runs')
        .upsert(record, { onConflict: 'batch_id' });
      
      if (error) {
        console.log(`❌ Failed to import ${batch.batch_id}: ${error.message}`);
        stat.failed++;
        stat.errors.push(`${batch.batch_id}: ${error.message}`);
      } else {
        console.log(`✅ Imported ${batch.batch_id}`);
        stat.success++;
      }
    } catch (error: any) {
      console.log(`❌ Error processing batch: ${error.message}`);
      stat.failed++;
      stat.errors.push(`${error.message}`);
    }
  }
}

/**
 * Migrate pricing catalogue
 */
async function migratePricingCatalogue() {
  console.log('\n📦 Migrating Pricing Catalogue...');
  const stat = initStats('Pricing Catalogue');

  const filePath = path.join(process.cwd(), 'data/pricing_catalogue_2025.json');

  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Pricing catalogue file not found');
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Flatten the nested structure
  const products: any[] = [];
  for (const [category, items] of Object.entries(data)) {
    for (const [productName, details] of Object.entries(items as any)) {
      // Ensure details is an object before spreading
      const detailsObj = details && typeof details === 'object' && !Array.isArray(details) ? details : {};
      products.push({
        category,
        product_name: productName,
        ...detailsObj
      });
    }
  }

  stat.total = products.length;
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    try {
      const record = {
        organization_id: ORG_ID,
        product_name: product.product_name,
        category: product.category,
        sku: product.product_name, // Use product name as SKU if not provided
        variation: 'Standard',
        wholesale_ex_gst: product.wholesale_ex_gst,
        rrp: product.rrp,
        volume_ml: product.volume_ml,
        abv: product.abv,
        moq: product.moq,
        metadata: product.metadata || {},
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('product_pricing')
        .insert(record);

      if (error) {
        console.log(`❌ Failed to import ${product.product_name}: ${error.message}`);
        stat.failed++;
        stat.errors.push(`${product.product_name}: ${error.message}`);
      } else {
        console.log(`✅ Imported ${product.product_name}`);
        stat.success++;
      }
    } catch (error: any) {
      console.log(`❌ Error processing ${product.product_name}: ${error.message}`);
      stat.failed++;
      stat.errors.push(`${product.product_name}: ${error.message}`);
    }
  }
}

async function migrateCaneSpiritCS25() {
  const stat = initStats('Cane Spirit CS-25');
  const sessions = [
    {
      id: 'CS-25-1-A',
      sku: 'Cane Spirit — CS-25-1',
      date: '2025-10-17',
      still: 'Carrie',
      chargeVolumeL: 900,
      chargeABV: 9.5,
      chargeLAL: 85.5,
      outputs: [
        { name: 'Heads', volumeL: 15.0, abv: 84.6, lal: 12.69, vessel: 'Hearts batch', observations: 'Corte às 12:50' },
        { name: 'Tails', volumeL: 10.5, abv: 42.5, lal: 4.4625, vessel: 'Early tails', observations: 'Separado' },
        { name: 'Tails', volumeL: 10.5, abv: 42.5, lal: 4.4625, vessel: 'Late tails', observations: 'Separado' }
      ],
      powerA: 35,
      elementsKW: 32
    },
    {
      id: 'CS-25-1-B',
      sku: 'Cane Spirit — CS-25-1',
      date: '2025-10-17',
      still: 'Carrie',
      chargeVolumeL: 900,
      chargeABV: 9.5,
      chargeLAL: 85.5,
      outputs: [
        { name: 'Tails', volumeL: 10.5, abv: 42.5, lal: 4.4625, vessel: 'Early tails', observations: 'Separado' },
        { name: 'Tails', volumeL: 10.5, abv: 42.5, lal: 4.4625, vessel: 'Late tails', observations: 'Separado' }
      ],
      powerA: 35,
      elementsKW: 32
    },
    {
      id: 'CS-25-2-A',
      sku: 'Cane Spirit — CS-25-2',
      date: '2025-10-31',
      still: 'Carrie',
      chargeVolumeL: 1100,
      chargeABV: 7.5,
      chargeLAL: 67.5,
      outputs: [
        { name: 'Heads', volumeL: 18.0, abv: 84.3, lal: 15.138, vessel: 'Hearts batch', observations: 'Corte às 12:15' },
        { name: 'Hearts', volumeL: 81.8, abv: 80.6, lal: 67.894, vessel: 'VC-1000', observations: 'Corte às 15:30' },
        { name: 'Tails', volumeL: 79.0, abv: 43.0, lal: 33.97, vessel: 'Early tails', observations: 'Separado' },
        { name: 'Tails', volumeL: 71.0, abv: 65.6, lal: 46.576, vessel: 'Late tails', observations: 'Separado' }
      ],
      powerA: 33,
      elementsKW: 32
    },
    {
      id: 'CS-25-2-B',
      sku: 'Cane Spirit — CS-25-2',
      date: '2025-11-15',
      still: 'Carrie',
      chargeVolumeL: 900,
      chargeABV: 7.5,
      chargeLAL: 67.5,
      outputs: [
        { name: 'Tails', volumeL: 68.5, abv: 53.0, lal: 28.538, vessel: 'Early tails', observations: 'Corte 15:00' },
        { name: 'Tails', volumeL: 61.0, abv: 30.0, lal: 18.3, vessel: 'Late tails', observations: 'Corte 11:25' }
      ],
      powerA: 33,
      elementsKW: 32
    }
  ];
  stat.total = sessions.length;
  for (const s of sessions) {
    try {
      const heads = s.outputs.find(o => o.name === 'Heads');
      const hearts = s.outputs.find(o => o.name === 'Hearts');
      const tailsSegments = s.outputs.filter(o => o.name === 'Tails').map(o => ({
        label: o.vessel,
        volume_l: o.volumeL,
        abv_percent: o.abv,
        lal: o.lal
      }));
      const tailsVolume = tailsSegments.reduce((sum, t) => sum + (t.volume_l || 0), 0);
      const tailsAbvNumerator = tailsSegments.reduce((sum, t) => sum + ((t.volume_l || 0) * (t.abv_percent || 0)), 0);
      const tailsAbv = tailsVolume > 0 ? parseFloat((tailsAbvNumerator / tailsVolume).toFixed(2)) : null;
      const tailsLal = tailsSegments.reduce((sum, t) => sum + (t.lal || 0), 0);
      const record = {
        batch_id: s.id,
        sku: s.sku,
        display_name: s.sku,
        date: s.date,
        still_used: s.still,
        charge_components: [{
          source: 'Boiler Charge',
          volume_l: s.chargeVolumeL,
          abv_percent: s.chargeABV,
          type: 'wash'
        }],
        charge_total_volume_l: s.chargeVolumeL,
        charge_total_abv_percent: s.chargeABV,
        charge_total_lal: s.chargeLAL,
        power_setting: s.powerA ? `${s.powerA}A` : null,
        heating_elements: s.elementsKW ? `${s.elementsKW}kW` : null,
        heads_volume_l: heads?.volumeL ?? null,
        heads_abv_percent: heads?.abv ?? null,
        heads_lal: heads?.lal ?? null,
        hearts_volume_l: hearts?.volumeL ?? null,
        hearts_abv_percent: hearts?.abv ?? null,
        hearts_lal: hearts?.lal ?? null,
        tails_volume_l: tailsVolume || null,
        tails_abv_percent: tailsAbv,
        tails_lal: tailsLal || null,
        tails_segments: tailsSegments,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'migration-script'
      };
      const { error } = await supabase
        .from('distillation_runs')
        .upsert(record, { onConflict: 'batch_id' });
      if (error) {
        stat.failed++;
        stat.errors.push(`${s.id}: ${error.message}`);
      } else {
        stat.success++;
      }
    } catch (e: any) {
      stat.failed++;
      stat.errors.push(`${s.id}: ${e.message}`);
    }
  }
}

async function migrateRumProductionRuns(dryRun: boolean = false) {
  console.log('\n📦 Migrating Rum Production Runs...');
  const stat = initStats('Rum Production Runs');
  const filePath = path.join(process.cwd(), 'src', 'app', 'rum', 'rum_production_data.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Rum production data file not found:', filePath);
    return;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const batches: any[] = JSON.parse(raw);
  stat.total = batches.length;
  const toNumber = (v: any): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return v;
    const s = String(v).trim();
    if (!s || s === '-' || s.toLowerCase() === 'null') return null;
    const n = parseFloat(s.replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : null;
  };
  const toSqlValue = (v: any): string => {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
    return `'${String(v).replace(/'/g, "''")}'`;
  };
  for (const b of batches) {
    try {
      const ferm = b.fermentation || {};
      const runs = Array.isArray(b.distillation_runs) ? b.distillation_runs : [];
      const firstRun = runs[0] || {};
      const lastRun = runs[runs.length - 1] || {};
      const pickCut = (run: any, phase: string) => {
        const arr = Array.isArray(run.cut_points) ? run.cut_points : [];
        return arr.find((c: any) => (c.phase || '').toLowerCase() === phase.toLowerCase());
      };
      const headsCut = pickCut(firstRun, 'Heads') || pickCut(lastRun, 'Heads');
      const heartsCut = pickCut(firstRun, 'Hearts') || pickCut(lastRun, 'Hearts');
      const summary = firstRun.summary || lastRun.summary || {};
      const tailsSegments = Array.isArray(firstRun.segments) ? firstRun.segments.map((s: any) => ({
        time: s.time || null,
        volume_l: null,
        abv_percent: toNumber(s.abv),
        lal: null
      })) : null;
      const cask = b.cask || {};
      const record = {
        batch_id: b.batch_id,
        product_name: b.product || 'Rum',
        product_type: 'rum',
        still_used: 'Roberta',
        fermentation_start_date: ferm.date_start || b.date || null,
        substrate_type: ferm.substrate || null,
        substrate_batch: ferm.substrate_batch || null,
        substrate_mass_kg: toNumber(ferm.substrate_mass_kg),
        water_mass_kg: toNumber(ferm.water_mass_kg),
        initial_brix: toNumber(ferm.brix_initial ?? ferm.actual_starting_brix),
        initial_ph: toNumber(ferm.ph_initial),
        dunder_added: !!ferm.dunder && ferm.dunder !== '-',
        dunder_type: typeof ferm.dunder === 'string' ? ferm.dunder : null,
        dunder_volume_l: toNumber(ferm.dunder_volume_l),
        dunder_ph: toNumber(ferm.dunder_ph),
        anti_foam_ml: toNumber(ferm.antifoam_ml),
        fermaid_g: toNumber(ferm.fermaid_g),
        dap_g: toNumber(ferm.dap_g),
        calcium_carbonate_g: toNumber(ferm.calcium_carbonate_g),
        additional_nutrients: ferm.additional_nutrients || null,
        yeast_type: ferm.yeast_type || null,
        yeast_mass_g: toNumber(ferm.yeast_mass_g),
        yeast_rehydration_temp_c: toNumber(ferm.yeast_rehydration_temp_c),
        yeast_rehydration_time_min: toNumber(ferm.yeast_rehydration_time_min),
        temperature_curve: ferm.temperature_profile || null,
        brix_curve: ferm.brix_profile || null,
        ph_curve: ferm.ph_profile || null,
        fermentation_duration_hours: toNumber(ferm.duration_days) ? Number(toNumber(ferm.duration_days)) * 24 : null,
        final_brix: toNumber(ferm.final_brix),
        final_ph: toNumber(ferm.final_ph),
        final_abv_percent: toNumber(ferm.final_abv_percent),
        fermentation_notes: ferm.notes || null,
        distillation_date: firstRun.date || lastRun.date || null,
        boiler_volume_l: toNumber(firstRun.boiler_volume_l ?? lastRun.boiler_volume_l),
        boiler_abv_percent: toNumber(firstRun.boiler_abv_percent ?? lastRun.boiler_abv_percent),
        boiler_lal: toNumber(firstRun.boiler_lal ?? lastRun.boiler_lal),
        retort1_content: firstRun.retort_1?.content || lastRun.retort_1?.content || null,
        retort1_volume_l: toNumber(firstRun.retort_1?.volume_l ?? lastRun.retort_1?.volume_l),
        retort1_abv_percent: toNumber(firstRun.retort_1?.abv_percent ?? lastRun.retort_1?.abv_percent),
        retort1_lal: toNumber(firstRun.retort_1?.lal ?? lastRun.retort_1?.lal),
        retort2_content: firstRun.retort_2?.content || lastRun.retort_2?.content || null,
        retort2_volume_l: toNumber(firstRun.retort_2?.volume_l ?? lastRun.retort_2?.volume_l),
        retort2_abv_percent: toNumber(firstRun.retort_2?.abv_percent ?? lastRun.retort_2?.abv_percent),
        retort2_lal: toNumber(firstRun.retort_2?.lal ?? lastRun.retort_2?.lal),
        boiler_elements: firstRun.heating?.boiler_elements || lastRun.heating?.boiler_elements || null,
        retort1_elements: firstRun.heating?.retort_1_elements || lastRun.heating?.retort_1_elements || null,
        retort2_elements: firstRun.heating?.retort_2_elements || lastRun.heating?.retort_2_elements || null,
        distillation_start_time: firstRun.heating?.boiler_start_time || lastRun.heating?.boiler_start_time || null,
        foreshots_time: null,
        foreshots_abv_percent: null,
        foreshots_notes: null,
        heads_time: headsCut?.time || null,
        heads_volume_l: toNumber(headsCut?.volume_l),
        heads_abv_percent: toNumber(headsCut?.abv_percent),
        heads_lal: toNumber(headsCut?.lal),
        heads_notes: headsCut?.notes || null,
        hearts_time: heartsCut?.time || null,
        hearts_volume_l: toNumber(heartsCut?.volume_l),
        hearts_abv_percent: toNumber(heartsCut?.abv_percent),
        hearts_lal: toNumber(heartsCut?.lal),
        hearts_notes: heartsCut?.notes || null,
        tails_segments: tailsSegments,
        total_lal_start: toNumber(summary.lal_in),
        total_lal_end: toNumber(summary.lal_out),
        lal_loss: (toNumber(summary.lal_in) !== null && toNumber(summary.lal_out) !== null)
          ? Number(toNumber(summary.lal_in)) - Number(toNumber(summary.lal_out))
          : null,
        heart_yield_percent: toNumber(summary.heart_yield_percent),
        distillation_notes: firstRun.notes || lastRun.notes || null,
        output_product_name: b.product || 'Rum',
        fill_date: cask.fill_date || null,
        cask_number: cask.cask_number || cask.number || null,
        cask_origin: cask.origin || null,
        cask_type: cask.type || null,
        cask_size_l: toNumber(cask.size_l),
        fill_abv_percent: toNumber(cask.fill_abv_percent),
        volume_filled_l: toNumber(cask.volume_filled_l),
        lal_filled: toNumber(cask.lal_filled),
        maturation_location: cask.maturation_location || null,
        expected_bottling_date: cask.expected_bottling_date || null,
        notes: b.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'migration-script'
      };
      if (dryRun) {
        const cols = Object.keys(record);
        const values = cols.map(k => toSqlValue((record as any)[k]));
        const updates = cols.filter(k => k !== 'batch_id' && k !== 'created_at').map(k => `${k} = EXCLUDED.${k}`);
        const sql = `INSERT INTO public.rum_production_runs (${cols.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (batch_id) DO UPDATE SET ${updates.join(', ')};`;
        console.log(sql);
        stat.success++;
      } else {
        const { error } = await supabase
          .from('rum_production_runs')
          .upsert(record, { onConflict: 'batch_id' });
        if (error) {
          console.log(`❌ Failed to import rum batch ${b.batch_id}: ${error.message}`);
          stat.failed++;
          stat.errors.push(`${b.batch_id}: ${error.message}`);
        } else {
          console.log(`✅ Imported rum batch ${b.batch_id}`);
          stat.success++;
        }
      }
    } catch (e: any) {
      console.log(`❌ Error processing rum batch ${b?.batch_id || 'unknown'}: ${e.message}`);
      stat.failed++;
      stat.errors.push(`${b?.batch_id || 'unknown'}: ${e.message}`);
    }
  }
}

/**
 * Migrate sales data
 */
async function migrateSalesData() {
  console.log('\n📦 Migrating Sales Data...');
  const stat = initStats('Sales Data');

  const filePath = path.join(process.cwd(), 'data/sales_summary_2025.json');

  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Sales data file not found');
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Flatten the nested structure
  const salesItems: any[] = [];
  for (const [category, items] of Object.entries(data)) {
    if (Array.isArray(items)) {
      items.forEach(item => {
        salesItems.push({
          category,
          ...item
        });
      });
    }
  }

  stat.total = salesItems.length;
  console.log(`Found ${salesItems.length} sales items`);

  for (const item of salesItems) {
    try {
      const record = {
        organization_id: ORG_ID,
        category: item.category,
        item_name: item.item_name,
        item_variation: item.item_variation || 'Regular',
        sku: item.sku || item.item_name, // Use item_name as SKU if not provided
        period_start: '2025-01-01', // Default period - adjust as needed
        period_end: '2025-12-31',
        period_granularity: 'annual', // Changed from 'year' to 'annual'
        items_sold: item.items_sold,
        units_sold: item.units_sold,
        product_sales: item.product_sales,
        refunds: item.refunds,
        discounts_and_comps: item.discounts_and_comps,
        net_sales: item.net_sales,
        tax: item.tax,
        gross_sales: item.gross_sales,
        import_batch: 'migration-2025-11-07',
        raw_payload: item,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('sales_items')
        .insert(record);

      if (error) {
        console.log(`❌ Failed to import ${item.item_name}: ${error.message}`);
        stat.failed++;
        stat.errors.push(`${item.item_name}: ${error.message}`);
      } else {
        console.log(`✅ Imported ${item.item_name}`);
        stat.success++;
      }
    } catch (error: any) {
      console.log(`❌ Error processing item: ${error.message}`);
      stat.failed++;
      stat.errors.push(`${error.message}`);
    }
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting Data Migration to Remote Supabase');
  console.log(`📍 Target: ${SUPABASE_URL}`);
  console.log(`🏢 Organization: ${ORG_ID}`);

  try {
    const dryRun = process.argv.includes('--dry-run');
    let orgName: string | undefined = undefined;
    if (!dryRun) {
      const { data, error } = await supabase.from('organizations').select('id, name').limit(1);
      if (error) {
        console.error('❌ Failed to connect to Supabase:', error.message);
        process.exit(1);
      }
      orgName = data?.[0]?.name;
      console.log('✅ Connected to Supabase');
      console.log(`   Organization: ${orgName}`);
    } else {
      console.log('⚠️  Dry-run ativo: gerando SQL sem conexão');
    }

    const onlyCs25 = process.argv.includes('--only-cs25');
    const onlyRum = process.argv.includes('--only-rum');
    if (onlyCs25) {
      await migrateCaneSpiritCS25();
      printStats();
      console.log('\n✅ Migration complete!');
      return;
    }
    if (onlyRum) {
      await migrateRumProductionRuns(dryRun);
      printStats();
      console.log('\n✅ Migration complete!');
      return;
    }
    if (dryRun) {
      await migrateRumProductionRuns(true);
      printStats();
      console.log('\n✅ Dry-run complete!');
      return;
    }
    await migrateSignatureDryGin();
    await migrateRainforestGin();
    await migrateCaneSpiritCS25();
    await migrateRumProductionRuns(false);
    await migratePricingCatalogue();
    await migrateSalesData();

    // Print summary
    printStats();

    console.log('\n✅ Migration complete!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
