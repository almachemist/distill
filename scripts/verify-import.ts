import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase anon key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to verify the imported data
const verifyImport = async () => {
  try {
    console.log('Fetching imported batches...');
    
    // Get all batches
    const { data: batches, error } = await supabase
      .from('production_batches')
      .select('id, type, still, created_at')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    console.log(`\n✅ Found ${batches.length} batches in the database:`);
    console.table(batches);
    
    // Count by type
    const typeCounts = batches.reduce((acc, batch) => {
      acc[batch.type] = (acc[batch.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 Batch counts by type:');
    console.table(typeCounts);
    
  } catch (error) {
    console.error('❌ Error verifying import:', error);
  }
};

// Run the verification
verifyImport().catch(console.error);
