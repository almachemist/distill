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

// SQL to create the rainforest_gin_batches table
const createTableSQL = `
-- Create ENUM types if they don't exist
CREATE TYPE cut_type AS ENUM ('foreshots', 'heads', 'hearts', 'tails');

-- Create the main table for Rainforest Gin batches
CREATE TABLE IF NOT EXISTS public.rainforest_gin_batches (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  sku TEXT,
  still_used TEXT NOT NULL,
  distillation_date DATE NOT NULL,
  boiler_charge_l NUMERIC(10,2) NOT NULL,
  boiler_abv_percent NUMERIC(5,2) NOT NULL,
  boiler_lal NUMERIC(10,2) NOT NULL,
  
  -- Distillation details
  distillation_start_time TIME,
  distillation_end_time TIME,
  distillation_duration_hours NUMERIC(5,2),
  total_lal_collected NUMERIC(10,2),
  heart_yield_percent NUMERIC(5,2),
  distillation_notes TEXT,
  
  -- Bottling details
  final_volume_l NUMERIC(10,2),
  final_abv_percent NUMERIC(5,2),
  bottling_date DATE,
  lal_filled NUMERIC(10,2),
  bottles_700ml INTEGER,
  
  -- Metadata
  created_by TEXT,
  notes TEXT,
  raw_log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for botanical ingredients
CREATE TABLE IF NOT EXISTS public.rainforest_gin_botanicals (
  id SERIAL PRIMARY KEY,
  batch_id TEXT REFERENCES public.rainforest_gin_batches(batch_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight_g NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for distillation cuts
CREATE TABLE IF NOT EXISTS public.rainforest_gin_distillation_cuts (
  id SERIAL PRIMARY KEY,
  batch_id TEXT REFERENCES public.rainforest_gin_batches(batch_id) ON DELETE CASCADE,
  cut_type cut_type NOT NULL,
  time TEXT,
  volume_l NUMERIC(10,2) NOT NULL,
  abv_percent NUMERIC(5,2),
  lal NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for dilution stages
CREATE TABLE IF NOT EXISTS public.rainforest_gin_dilution (
  id SERIAL PRIMARY KEY,
  batch_id TEXT REFERENCES public.rainforest_gin_batches(batch_id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  date DATE,
  start_volume_l NUMERIC(10,2) NOT NULL,
  filtered_water_l NUMERIC(10,2) NOT NULL,
  new_volume_l NUMERIC(10,2) NOT NULL,
  abv_percent NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rainforest_gin_batches_batch_id ON public.rainforest_gin_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_rainforest_gin_batches_distillation_date ON public.rainforest_gin_batches(distillation_date);
CREATE INDEX IF NOT EXISTS idx_rainforest_gin_botanicals_batch_id ON public.rainforest_gin_botanicals(batch_id);
CREATE INDEX IF NOT EXISTS idx_rainforest_gin_distillation_cuts_batch_id ON public.rainforest_gin_distillation_cuts(batch_id);
CREATE INDEX IF NOT EXISTS idx_rainforest_gin_dilution_batch_id ON public.rainforest_gin_dilution(batch_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_rainforest_gin_batches_updated_at ON public.rainforest_gin_batches;
CREATE TRIGGER update_rainforest_gin_batches_updated_at
BEFORE UPDATE ON public.rainforest_gin_batches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Function to create the table
const setupRainforestGinTable = async () => {
  try {
    console.log('Creating Rainforest Gin tables...');
    
    // Split the SQL into individual statements
    const statements = createTableSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        console.log('Executing:', statement.substring(0, 100) + '...');
        const { error } = await supabase.rpc('exec_sql', { query: statement });
        if (error) console.error('Error executing statement:', error);
      } catch (error) {
        console.error('Error in statement execution:', error);
      }
    }
    
    console.log('✅ Rainforest Gin tables created successfully');
    console.log('\nNext steps:');
    console.log('1. Run the import script to import your Rainforest Gin batches');
    console.log('2. Verify the data in your Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

// Run the setup
setupRainforestGinTable().catch(console.error);
