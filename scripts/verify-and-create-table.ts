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

// Function to check if table exists
const checkTableExists = async () => {
  try {
    console.log('Checking if production_batches table exists...');
    
    // Try to select from the table
    const { data, error } = await supabase
      .from('production_batches')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log('Table does not exist. Please create it using the SQL below in your Supabase SQL Editor:');
        console.log(`
          CREATE TABLE public.production_batches (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            type TEXT NOT NULL,
            still TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          
          -- Add indexes for better query performance
          CREATE INDEX idx_production_batches_type ON public.production_batches (type);
          CREATE INDEX idx_production_batches_still ON public.production_batches (still);
          CREATE INDEX idx_production_batches_created_at ON public.production_batches (created_at);
        `);
        return false;
      }
      throw error;
    }
    
    console.log('✅ production_batches table exists');
    return true;
  } catch (error) {
    console.error('Error checking table:', error);
    return false;
  }
};

// Run the check
checkTableExists().then(exists => {
  if (exists) {
    console.log('You can now run the import script:');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here npx tsx scripts/import-carrie-batches.ts');
  }
});
