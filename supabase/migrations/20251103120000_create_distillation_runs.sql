-- Create distillation_runs table
CREATE TABLE IF NOT EXISTS public.distillation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL,
    display_name TEXT NOT NULL,
    product_id TEXT,
    recipe_id UUID,
    date DATE NOT NULL,
    still_used TEXT NOT NULL,
    
    -- Charge data
    charge_components JSONB NOT NULL DEFAULT '[]'::jsonb,
    charge_total_volume_l NUMERIC(10,2),
    charge_total_abv_percent NUMERIC(5,2),
    charge_total_lal NUMERIC(10,2),
    
    -- Botanicals (optional, for gin)
    botanicals JSONB,
    steeping_start_time TIME,
    steeping_end_time TIME,
    steeping_temp_c NUMERIC(5,2),
    
    -- Heating
    boiler_on_time TIME,
    power_setting TEXT,
    heating_elements TEXT,
    plates TEXT,
    deflegmator TEXT,
    
    -- Cuts data
    foreshots_volume_l NUMERIC(10,2),
    foreshots_abv_percent NUMERIC(5,2),
    foreshots_lal NUMERIC(10,2),
    
    heads_volume_l NUMERIC(10,2),
    heads_abv_percent NUMERIC(5,2),
    heads_lal NUMERIC(10,2),
    
    hearts_volume_l NUMERIC(10,2),
    hearts_abv_percent NUMERIC(5,2),
    hearts_lal NUMERIC(10,2),
    
    tails_volume_l NUMERIC(10,2),
    tails_abv_percent NUMERIC(5,2),
    tails_lal NUMERIC(10,2),
    
    -- Multi-part hearts/tails
    hearts_segments JSONB,
    tails_segments JSONB,
    
    -- Dilution
    dilution_steps JSONB,
    final_output_volume_l NUMERIC(10,2),
    final_output_abv_percent NUMERIC(5,2),
    final_output_lal NUMERIC(10,2),
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    
    CONSTRAINT valid_batch_id CHECK (batch_id != '')
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_distillation_runs_batch_id ON public.distillation_runs(batch_id);
CREATE INDEX IF NOT EXISTS idx_distillation_runs_date ON public.distillation_runs(date DESC);
CREATE INDEX IF NOT EXISTS idx_distillation_runs_recipe_id ON public.distillation_runs(recipe_id);

-- Enable RLS
ALTER TABLE public.distillation_runs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
CREATE POLICY "Allow all operations on distillation_runs"
ON public.distillation_runs
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.distillation_runs IS 'Stores complete distillation run data including charge, cuts, and final output';

