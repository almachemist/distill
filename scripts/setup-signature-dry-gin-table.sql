-- Create the main Signature Dry Gin batches table
CREATE TABLE IF NOT EXISTS public.signature_dry_gin_batches (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  product_type TEXT DEFAULT 'gin',
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
CREATE TABLE IF NOT EXISTS public.signature_dry_gin_botanicals (
  id SERIAL PRIMARY KEY,
  batch_id TEXT REFERENCES public.signature_dry_gin_batches(batch_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight_g NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure we don't have duplicate botanicals for the same batch
  CONSTRAINT unique_sigdry_botanical_per_batch UNIQUE (batch_id, name)
);

-- Create table for distillation cuts
CREATE TABLE IF NOT EXISTS public.signature_dry_gin_distillation_cuts (
  id SERIAL PRIMARY KEY,
  batch_id TEXT REFERENCES public.signature_dry_gin_batches(batch_id) ON DELETE CASCADE,
  cut_type TEXT NOT NULL CHECK (cut_type IN ('foreshots', 'heads', 'hearts', 'tails')),
  time TEXT,
  volume_l NUMERIC(10,2) NOT NULL,
  abv_percent NUMERIC(5,2),
  lal NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for dilution stages
CREATE TABLE IF NOT EXISTS public.signature_dry_gin_dilution (
  id SERIAL PRIMARY KEY,
  batch_id TEXT REFERENCES public.signature_dry_gin_batches(batch_id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  date DATE,
  new_make_l NUMERIC(10,2),
  filtered_water_l NUMERIC(10,2) NOT NULL,
  new_volume_l NUMERIC(10,2) NOT NULL,
  abv_percent NUMERIC(5,2),
  lal NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure we don't have duplicate stages for the same batch
  CONSTRAINT unique_sigdry_stage_per_batch UNIQUE (batch_id, stage)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sigdry_gin_batches_batch_id ON public.signature_dry_gin_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_sigdry_gin_batches_distillation_date ON public.signature_dry_gin_batches(distillation_date);
CREATE INDEX IF NOT EXISTS idx_sigdry_gin_botanicals_batch_id ON public.signature_dry_gin_botanicals(batch_id);
CREATE INDEX IF NOT EXISTS idx_sigdry_gin_distillation_cuts_batch_id ON public.signature_dry_gin_distillation_cuts(batch_id);
CREATE INDEX IF NOT EXISTS idx_sigdry_gin_dilution_batch_id ON public.signature_dry_gin_dilution(batch_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_signature_dry_gin_batches_updated_at ON public.signature_dry_gin_batches;
CREATE TRIGGER update_signature_dry_gin_batches_updated_at
BEFORE UPDATE ON public.signature_dry_gin_batches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE public.signature_dry_gin_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_dry_gin_botanicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_dry_gin_distillation_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_dry_gin_dilution ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON public.signature_dry_gin_batches
  FOR SELECT USING (true);
  
CREATE POLICY "Enable read access for all users" ON public.signature_dry_gin_botanicals
  FOR SELECT USING (true);
  
CREATE POLICY "Enable read access for all users" ON public.signature_dry_gin_distillation_cuts
  FOR SELECT USING (true);
  
CREATE POLICY "Enable read access for all users" ON public.signature_dry_gin_dilution
  FOR SELECT USING (true);

-- Notify that the setup is complete
SELECT 'Signature Dry Gin database setup completed successfully!' as message;
