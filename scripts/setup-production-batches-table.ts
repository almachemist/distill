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

// SQL to create the production_batches table
const createTableSQL = `
  -- Create production_batches table
  CREATE TABLE IF NOT EXISTS public.production_batches (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    type TEXT NOT NULL,
    still TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Add indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_production_batches_type ON public.production_batches (type);
  CREATE INDEX IF NOT EXISTS idx_production_batches_still ON public.production_batches (still);
  CREATE INDEX IF NOT EXISTS idx_production_batches_created_at ON public.production_batches (created_at);
`;

// Function to create the table
const setupProductionBatchesTable = async () => {
  try {
    console.log('Creating production_batches table...');
    
    const { data, error } = await supabase.rpc('exec_sql', { query: createTableSQL });
    
    if (error) {
      // If the exec_sql function doesn't exist, try a different approach
      if (error.message.includes('function exec_sql(text) does not exist')) {
        console.log('Using alternative method to create table...');
        await createTableAlternative();
        return;
      }
      throw error;
    }
    
    console.log('✅ Successfully created production_batches table');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
};

// Alternative method to create the table using raw SQL
const createTableAlternative = async () => {
  try {
    // Split the SQL into individual statements
    const statements = createTableSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement);
      const { error } = await supabase.rpc('exec_sql', { query: statement });
      if (error) throw error;
    }
    
    console.log('✅ Successfully created production_batches table using alternative method');
  } catch (error) {
    console.error('❌ Error in alternative table creation:', error);
  }
};

// Run the setup
setupProductionBatchesTable().catch(console.error);
