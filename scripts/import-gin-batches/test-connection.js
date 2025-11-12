import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  'https://dscmknufpfhxjcanzdsr.supabase.co',
  process.env.SUPABASE_KEY,
  { auth: { persistSession: false } }
);

async function test() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('batches').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Connection successful!');
    console.log('First batch:', data[0]?.run_id || 'No batches found');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nDouble check:');
    console.log('1. The key in .env is correct and complete');
    console.log('2. The key has service_role permissions');
    console.log('3. Your IP is allowed in Supabase dashboard');
  }
}

test();
