import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const BATCHES_DIR = join(process.cwd(), '../data/batches');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function importBatch(batchFile) {
  try {
    const filePath = join(BATCHES_DIR, batchFile);
    const fileContent = await readFile(filePath, 'utf8');
    const { runs, recipe } = JSON.parse(fileContent);
    const run = runs[0];
    
    console.log(`Importing ${run.run_id}...`);
    
    // Insert batch
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert({
        run_id: run.run_id,
        recipe,
        date: run.date,
        still_used: run.still_used || 'CARRIE',
        location: run.location
      })
      .select()
      .single();
    
    if (batchError) {
      if (batchError.code === '23505') {
        console.log(`Skipping ${run.run_id} - already exists`);
        return;
      }
      throw batchError;
    }

    // Insert botanicals if they exist
    if (run.botanicals?.length) {
      const botanicals = run.botanicals.map(b => ({
        batch_id: batch.id,
        name: b.name,
        weight_g: b.weight_g,
        ratio_percent: b.ratio_percent,
        notes: b.notes || null
      }));
      
      await supabase.from('botanicals').insert(botanicals);
    }

    console.log(`✅ Successfully imported ${run.run_id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error importing ${batchFile}:`, error.message);
    return false;
  }
}

async function importAllBatches() {
  try {
    const batchFiles = (await readdir(BATCHES_DIR))
      .filter(f => f.startsWith('signature-dry-gin-') && f.endsWith('.json'))
      .sort();
    
    console.log(`Found ${batchFiles.length} batch files to import`);
    
    let success = 0;
    for (const file of batchFiles) {
      const result = await importBatch(file);
      if (result) success++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }
    
    console.log(`\nImport complete: ${success}/${batchFiles.length} batches imported successfully`);
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

importAllBatches();
