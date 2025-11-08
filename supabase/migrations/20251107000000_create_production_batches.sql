-- Create production_batches table
CREATE TABLE IF NOT EXISTS public.production_batches (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Add indexes for common query patterns
  batch_id TEXT GENERATED ALWAYS AS (data->>'batch_id') STORED,
  product_group TEXT GENERATED ALWAYS AS (data->>'product_group') STORED,
  date DATE GENERATED ALWAYS AS ((data->>'date')::date) STORED,
  still_used TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN data->>'batch_id' LIKE 'RUM%' OR data->>'batch_id' LIKE 'CS%' THEN 'Roberta'
      WHEN data->>'batch_id' LIKE 'GIN%' OR data->>'batch_id' LIKE 'VODKA%' THEN 'Carrie'
      ELSE NULL
    END
  ) STORED
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_production_batches_batch_id ON public.production_batches (batch_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_product_group ON public.production_batches (product_group);
CREATE INDEX IF NOT EXISTS idx_production_batches_date ON public.production_batches (date);
CREATE INDEX IF NOT EXISTS idx_production_batches_still_used ON public.production_batches (still_used);

-- Add GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_production_batches_data_gin ON public.production_batches USING GIN (data);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_production_batches_updated_at
BEFORE UPDATE ON public.production_batches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.production_batches IS 'Stores all production batches with their complete data';
COMMENT ON COLUMN public.production_batches.id IS 'Primary key, matches the batch_id from the JSON data';
COMMENT ON COLUMN public.production_batches.data IS 'Complete batch data in JSONB format';
COMMENT ON COLUMN public.production_batches.batch_id IS 'Generated column for direct access to batch_id';
COMMENT ON COLUMN public.production_batches.product_group IS 'Generated column for direct access to product_group';
COMMENT ON COLUMN public.production_batches.date IS 'Generated column for direct access to date';
COMMENT ON COLUMN public.production_batches.still_used IS 'Generated column indicating which still was used (Roberta or Carrie)';

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;

-- Example policy (adjust based on your security requirements)
CREATE POLICY "Enable read access for all users"
ON public.production_batches
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON public.production_batches
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON public.production_batches
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
