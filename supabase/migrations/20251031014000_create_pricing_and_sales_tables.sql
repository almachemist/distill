-- Create tables for pricing catalog and sales summaries

-- Product pricing catalog
CREATE TABLE public.product_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  variation TEXT NOT NULL DEFAULT '',
  volume_ml NUMERIC,
  abv NUMERIC,
  wholesale_ex_gst NUMERIC,
  rrp NUMERIC,
  moq TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales items summary table (supports monthly / annual aggregation)
CREATE TABLE public.sales_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_variation TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL DEFAULT '',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_granularity TEXT NOT NULL CHECK (period_granularity IN ('monthly', 'annual')),
  items_sold INTEGER,
  units_sold INTEGER,
  product_sales NUMERIC,
  refunds NUMERIC,
  discounts_and_comps NUMERIC,
  net_sales NUMERIC,
  tax NUMERIC,
  gross_sales NUMERIC,
  import_batch TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX product_pricing_org_category_idx
  ON public.product_pricing (organization_id, category, product_name);
CREATE UNIQUE INDEX product_pricing_unique_product
  ON public.product_pricing (organization_id, product_name, COALESCE(variation, ''), COALESCE(sku, ''));

CREATE INDEX sales_items_org_period_idx
  ON public.sales_items (organization_id, period_start, period_end);
CREATE INDEX sales_items_category_idx
  ON public.sales_items (organization_id, category);
CREATE UNIQUE INDEX sales_items_unique_entry
  ON public.sales_items (
    organization_id,
    period_start,
    period_end,
    category,
    item_name,
    COALESCE(item_variation, ''),
    COALESCE(sku, '')
  );

-- Ensure updated_at timestamps stay current
CREATE TRIGGER update_product_pricing_updated_at
  BEFORE UPDATE ON public.product_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sales_items_updated_at
  BEFORE UPDATE ON public.sales_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_pricing
CREATE POLICY "Users can view product pricing in their organization" ON public.product_pricing
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can upsert product pricing" ON public.product_pricing
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for sales_items
CREATE POLICY "Users can view sales items in their organization" ON public.sales_items
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert sales items" ON public.sales_items
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can update sales items" ON public.sales_items
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete sales items" ON public.sales_items
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
