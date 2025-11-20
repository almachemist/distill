-- Create table for historical, pre-double-retort batches (Old Distillations – Roberta)
-- Keeps strict separation from modern rum logic. Multi-tenant via organization_id.

-- Table
CREATE TABLE IF NOT EXISTS public.old_roberta_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'Other', -- 'Rum' | 'Cane Spirit' | 'Other'
  fermentation_date DATE,
  distillation_date DATE,
  still_used TEXT,
  wash_volume_l NUMERIC(12,3),
  wash_abv_percent NUMERIC(5,2),
  charge_l NUMERIC(12,3),
  hearts_volume_l NUMERIC(12,3),
  hearts_abv_percent NUMERIC(5,2),
  hearts_lal NUMERIC(12,3),
  heads_volume_l NUMERIC(12,3),
  tails_volume_l NUMERIC(12,3),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT old_roberta_batches_unique UNIQUE (organization_id, batch_id)
);
-- Dev seed: ensure default dev org exists for local/testing flows
INSERT INTO public.organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Development Org')
ON CONFLICT (id) DO NOTHING;



-- Product type guardrail
DO $$ BEGIN
  ALTER TABLE public.old_roberta_batches
    ADD CONSTRAINT old_roberta_product_type_check
    CHECK (product_type IN ('Rum','Cane Spirit','Other'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_old_roberta_org ON public.old_roberta_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_old_roberta_date ON public.old_roberta_batches(distillation_date DESC);

-- RLS
ALTER TABLE public.old_roberta_batches ENABLE ROW LEVEL SECURITY;

-- Read policy: users can read batches in their organization
DO $$ BEGIN
  CREATE POLICY "Users can view old roberta batches in their organization" ON public.old_roberta_batches
    FOR SELECT USING (
      organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert policy: operators and above within org
DO $$ BEGIN
  CREATE POLICY "Users can insert old roberta batches in their organization" ON public.old_roberta_batches
    FOR INSERT WITH CHECK (
      organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      ) AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update policy: operators and above within org
DO $$ BEGIN
  CREATE POLICY "Users can update old roberta batches in their organization" ON public.old_roberta_batches
    FOR UPDATE USING (
      organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      ) AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Delete policy: admin only within org
DO $$ BEGIN
  CREATE POLICY "Only admins can delete old roberta batches" ON public.old_roberta_batches
    FOR DELETE USING (
      organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      ) AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at trigger
DO $$ BEGIN
  CREATE TRIGGER update_old_roberta_batches_updated_at
  BEFORE UPDATE ON public.old_roberta_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

