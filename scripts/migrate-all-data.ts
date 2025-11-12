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
      products.push({
        category,
        product_name: productName,
        ...details
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
    // Test connection
    const { data, error } = await supabase.from('organizations').select('id, name').limit(1);
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      process.exit(1);
    }
    console.log('✅ Connected to Supabase');
    console.log(`   Organization: ${data?.[0]?.name}`);

    // Run migrations
    await migrateSignatureDryGin();
    await migrateRainforestGin();
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

