-- Create rum_production_runs table for complete fermentation → distillation → cask cycle

CREATE TABLE IF NOT EXISTS public.rum_production_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL UNIQUE,
    product_name TEXT NOT NULL,
    product_type TEXT DEFAULT 'rum', -- 'rum' or 'cane_spirit'
    still_used TEXT DEFAULT 'Roberta', -- Double Retort still
    
    -- === FERMENTATION STAGE ===
    fermentation_start_date DATE,
    
    -- Substrate
    substrate_type TEXT, -- 'C Molasses', 'Blackstrap', etc.
    substrate_batch TEXT,
    substrate_mass_kg NUMERIC(10,2),
    water_mass_kg NUMERIC(10,2),
    initial_brix NUMERIC(5,2),
    initial_ph NUMERIC(4,2),
    
    -- Dunder
    dunder_added BOOLEAN DEFAULT false,
    dunder_type TEXT,
    dunder_volume_l NUMERIC(10,2),
    dunder_ph NUMERIC(4,2),
    
    -- Additives
    anti_foam_ml NUMERIC(10,2),
    citric_acid_g NUMERIC(10,2),
    fermaid_g NUMERIC(10,2),
    dap_g NUMERIC(10,2),
    calcium_carbonate_g NUMERIC(10,2),
    additional_nutrients TEXT,
    
    -- Yeast
    yeast_type TEXT,
    yeast_mass_g NUMERIC(10,2),
    yeast_rehydration_temp_c NUMERIC(5,2),
    yeast_rehydration_time_min INTEGER,
    
    -- Fermentation curves (stored as JSONB for flexibility)
    temperature_curve JSONB, -- {"0h": 24.2, "24h": 29.3, "48h": 29.8, ...}
    brix_curve JSONB,         -- {"0h": 26.6, "24h": 14.9, "48h": 10.8, ...}
    ph_curve JSONB,           -- {"0h": 5.14, "24h": 4.92, "48h": 4.89, ...}
    
    fermentation_duration_hours INTEGER,
    final_brix NUMERIC(5,2),
    final_ph NUMERIC(4,2),
    final_abv_percent NUMERIC(5,2),
    fermentation_notes TEXT,
    
    -- === DISTILLATION STAGE (Double Retort) ===
    distillation_date DATE,
    
    -- Boiler
    boiler_volume_l NUMERIC(10,2),
    boiler_abv_percent NUMERIC(5,2),
    boiler_lal NUMERIC(10,2),
    
    -- Retort 1 (Late tails)
    retort1_content TEXT,
    retort1_volume_l NUMERIC(10,2),
    retort1_abv_percent NUMERIC(5,2),
    retort1_lal NUMERIC(10,2),
    
    -- Retort 2 (Early tails)
    retort2_content TEXT,
    retort2_volume_l NUMERIC(10,2),
    retort2_abv_percent NUMERIC(5,2),
    retort2_lal NUMERIC(10,2),
    
    -- Heat profile
    boiler_elements TEXT, -- '5 × 5750 W'
    retort1_elements TEXT, -- '2200 W'
    retort2_elements TEXT, -- '2400 W'
    distillation_start_time TIME,
    
    -- Cuts (similar to spirits but with retort context)
    foreshots_time TIME,
    foreshots_abv_percent NUMERIC(5,2),
    foreshots_notes TEXT,
    
    heads_time TIME,
    heads_volume_l NUMERIC(10,2),
    heads_abv_percent NUMERIC(5,2),
    heads_lal NUMERIC(10,2),
    heads_notes TEXT,
    
    hearts_time TIME,
    hearts_volume_l NUMERIC(10,2),
    hearts_abv_percent NUMERIC(5,2),
    hearts_lal NUMERIC(10,2),
    hearts_notes TEXT,
    
    -- Tails (multi-part, stored as JSONB)
    tails_segments JSONB, -- [{"time": "15:10", "volume_l": 105, "abv": 79.6, "lal": 83.58}, ...]
    
    -- Yield metrics
    total_lal_start NUMERIC(10,2),
    total_lal_end NUMERIC(10,2),
    lal_loss NUMERIC(10,2),
    heart_yield_percent NUMERIC(5,2),
    
    distillation_notes TEXT,
    
    -- === CASK FILLING / BOTTLING ===
    output_product_name TEXT,
    fill_date DATE,
    cask_number TEXT,
    cask_origin TEXT, -- 'Heaven Hill Distillery', 'ex-bourbon', etc.
    cask_type TEXT, -- 'American Oak', 'French Oak', etc.
    cask_size_l NUMERIC(10,2),
    fill_abv_percent NUMERIC(5,2),
    volume_filled_l NUMERIC(10,2),
    lal_filled NUMERIC(10,2),
    
    -- Future: Maturation tracking
    maturation_location TEXT,
    expected_bottling_date DATE,
    
    -- === METADATA ===
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    
    -- General notes
    notes TEXT,
    
    CONSTRAINT valid_rum_batch_id CHECK (batch_id != '')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rum_batch_id ON public.rum_production_runs(batch_id);
CREATE INDEX IF NOT EXISTS idx_rum_fermentation_date ON public.rum_production_runs(fermentation_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_rum_distillation_date ON public.rum_production_runs(distillation_date DESC);
CREATE INDEX IF NOT EXISTS idx_rum_cask_number ON public.rum_production_runs(cask_number);
CREATE INDEX IF NOT EXISTS idx_rum_product_type ON public.rum_production_runs(product_type);

-- Enable RLS
ALTER TABLE public.rum_production_runs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
CREATE POLICY "Allow all operations on rum_production_runs"
ON public.rum_production_runs
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.rum_production_runs IS 'Complete rum production cycle: fermentation → double retort distillation → cask filling';


