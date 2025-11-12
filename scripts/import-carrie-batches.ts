import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Import all session files
import { spiritGinNS018BulletproofData } from '../src/modules/production/sessions/spirit-gin-ns018-distillation.session';
import { spiritGinDry2024BulletproofData } from '../src/modules/production/sessions/spirit-gin-dry2024-distillation.session';
import { merchantMaeGinDistillation } from '../src/modules/production/sessions/merchant-mae-gin-distillation.session';
import { merchantMaeGin001Distillation } from '../src/modules/production/sessions/merchant-mae-gin-001-distillation.session';
import { merchantMaeGin003Distillation } from '../src/modules/production/sessions/merchant-mae-gin-003-distillation.session';
import { vodka003Distillation } from '../src/modules/production/sessions/vodka-003-distillation.session';
import { rainforestGinRF30 } from '../src/modules/production/sessions/rainforest-gin-rf30-distillation.session';
// Temporarily excluding rainforest-gin-rf29 as it has export issues

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase anon key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Collect all Carrie batches (gin and vodka)
const carrieBatches = [
  spiritGinNS018BulletproofData,
  spiritGinDry2024BulletproofData,
  merchantMaeGinDistillation,
  merchantMaeGin001Distillation,
  merchantMaeGin003Distillation,
  vodka003Distillation,
  rainforestGinRF30
].filter(Boolean); // Remove any undefined entries

// Helper to get batch ID
const getBatchId = (batch: any): string => {
  if (batch.spiritRunId) return batch.spiritRunId;
  if (batch.id) return batch.id;
  if (batch.sku) return batch.sku;
  return `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Helper to get batch type
const getBatchType = (batch: any): string => {
  if (batch.spiritRunId?.includes('GIN')) return 'gin';
  if (batch.spiritRunId?.includes('VODKA')) return 'vodka';
  if (batch.sku?.includes('GIN')) return 'gin';
  if (batch.sku?.includes('VODKA')) return 'vodka';
  return 'other';
};

// Main import function
const importBatches = async () => {
  console.log(`Starting import of ${carrieBatches.length} Carrie batches...`);
  
  for (const [index, batch] of carrieBatches.entries()) {
    try {
      const batchId = getBatchId(batch);
      const batchType = getBatchType(batch);
      
      console.log(`\nProcessing batch ${index + 1}/${carrieBatches.length}: ${batchId} (${batchType})`);
      
      const { data, error } = await supabase
        .from('production_batches')
        .upsert({
          id: batchId,
          data: batch,
          type: batchType,
          still: 'Carrie',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) throw error;
      console.log(`✅ Successfully imported ${batchId}`);
      
    } catch (error) {
      console.error(`❌ Error importing batch:`, error);
    }
  }
  
  console.log('\nImport completed!');};

// Run the import
importBatches().catch(console.error);
