-- Create ENUM type for cut types
CREATE TYPE cut_type AS ENUM ('foreshots', 'heads', 'hearts', 'tails');

-- Create the main Rainforest Gin batches table
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure we don't have duplicate botanicals for the same batch
  CONSTRAINT unique_botanical_per_batch UNIQUE (batch_id, name)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure we don't have duplicate cut types for the same batch
  CONSTRAINT unique_cut_type_per_batch UNIQUE (batch_id, cut_type)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure we don't have duplicate stages for the same batch
  CONSTRAINT unique_stage_per_batch UNIQUE (batch_id, stage)
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

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE public.rainforest_gin_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rainforest_gin_botanicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rainforest_gin_distillation_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rainforest_gin_dilution ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON public.rainforest_gin_batches
  FOR SELECT USING (true);
  
CREATE POLICY "Enable read access for all users" ON public.rainforest_gin_botanicals
  FOR SELECT USING (true);
  
CREATE POLICY "Enable read access for all users" ON public.rainforest_gin_distillation_cuts
  FOR SELECT USING (true);
  
CREATE POLICY "Enable read access for all users" ON public.rainforest_gin_dilution
  FOR SELECT USING (true);

-- Notify that the setup is complete
SELECT 'Rainforest Gin database setup completed successfully!' as message;
