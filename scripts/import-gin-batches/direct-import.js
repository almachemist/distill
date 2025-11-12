import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

// Directly set your credentials here (temporarily for testing)
const supabaseUrl = 'https://dscmknufpfhxjcanzdsr.supabase.co';
const supabaseKey = 'your_service_role_key_here'; // Replace with your actual key

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function testConnection() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('batches').select('*').limit(1);
  if (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('JWT')) {
      console.log('This looks like a JWT validation error. Please check:');
      console.log('1. Your Supabase URL is correct');
      console.log('2. You are using the service_role key (not anon key)');
      console.log('3. The key is correctly copied without extra spaces');
    }
    return false;
  }
  console.log('✅ Connection successful!');
  return true;
}

testConnection();
