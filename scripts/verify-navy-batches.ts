import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkNavyBatches() {
  const { data, error } = await supabase
    .from('distillation_runs')
    .select('batch_id, sku, display_name, date')
    .or('sku.ilike.%Navy%,batch_id.ilike.%-NS-%')
    .order('date', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${data?.length || 0} Navy Strength batches:`);
    data?.forEach(b => console.log(`  - ${b.batch_id}: ${b.display_name} (${b.date})`));
  }
}

checkNavyBatches().catch(console.error);


