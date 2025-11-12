#!/usr/bin/env tsx
/**
 * Migrate Production Batches from production_batches.json
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Remote Supabase configuration
const SUPABASE_URL = 'https://dscmknufpfhxjcanzdsr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzY21rbnVmcGZoeGpjYW56ZHNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3NTgzOSwiZXhwIjoyMDc3OTUxODM5fQ.NanLP7UThboH3JUeFqkwy5dovfzxJotf2yljsTQs7rY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('🚀 Migrating Production Batches');
  console.log(`📍 Target: ${SUPABASE_URL}\n`);
  
  const filePath = path.join(process.cwd(), 'src/modules/production/data/production_batches.json');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const batches = data.batches || [];
  
  console.log(`Found ${batches.length} batches to migrate\n`);
  
  let success = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];
  
  for (const batch of batches) {
    const batchId = batch.batch_id;
    
    try {
      // Check if batch already exists
      const { data: existing } = await supabase
        .from('production_batches')
        .select('id')
        .eq('id', batchId)
        .single();
      
      if (existing) {
        console.log(`⏭️  Skipped ${batchId} (already exists)`);
        skipped++;
        continue;
      }
      
      // Determine type and still based on batch_id
      let type = 'other';
      let still = 'Carrie';
      
      if (batchId.startsWith('RUM-')) {
        type = 'rum';
      } else if (batchId.startsWith('CS-')) {
        type = 'cane_spirit';
      }
      
      // Create record
      const record = {
        id: batchId,
        data: batch, // Store entire batch as JSONB
        type: type,
        still: still,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('production_batches')
        .insert(record);
      
      if (error) {
        console.log(`❌ Failed to import ${batchId}: ${error.message}`);
        failed++;
        errors.push(`${batchId}: ${error.message}`);
      } else {
        console.log(`✅ Imported ${batchId}`);
        success++;
      }
    } catch (error: any) {
      console.log(`❌ Error processing ${batchId}: ${error.message}`);
      failed++;
      errors.push(`${batchId}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total: ${batches.length}`);
  console.log(`✅ Success: ${success}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  console.log('='.repeat(80) + '\n');
  
  // Show final count
  const { count } = await supabase
    .from('production_batches')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total production batches in database: ${count}`);
  console.log('\n✅ Migration complete!');
}

main();

