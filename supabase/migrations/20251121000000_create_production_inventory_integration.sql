-- Production-Inventory Integration Schema
-- Links production batches to inventory items for full traceability and costing

-- 1. Batch Materials (Ethanol, Water, etc.)
CREATE TABLE IF NOT EXISTS public.batch_materials (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    batch_id uuid NOT NULL,
    batch_type text NOT NULL CHECK (batch_type IN ('gin', 'vodka', 'rum', 'cane_spirit')),
    material_type text NOT NULL CHECK (material_type IN ('ethanol', 'water', 'other')),
    inventory_item_id uuid REFERENCES public.items(id),
    item_name text NOT NULL,
    quantity_l numeric(12,2) NOT NULL,
    abv numeric(5,2),
    cost_per_unit numeric(12,2),
    total_cost numeric(12,2),
    supplier text,
    invoice_reference text,
    lot_number text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Batch Botanicals
CREATE TABLE IF NOT EXISTS public.batch_botanicals (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    batch_id uuid NOT NULL,
    batch_type text NOT NULL CHECK (batch_type IN ('gin', 'vodka', 'rum', 'cane_spirit')),
    inventory_item_id uuid REFERENCES public.items(id),
    botanical_name text NOT NULL,
    quantity_g numeric(12,2) NOT NULL,
    cost_per_kg numeric(12,2),
    total_cost numeric(12,2),
    supplier text,
    invoice_reference text,
    lot_number text,
    expiry_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Batch Packaging
CREATE TABLE IF NOT EXISTS public.batch_packaging (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    batch_id uuid NOT NULL,
    batch_type text NOT NULL CHECK (batch_type IN ('gin', 'vodka', 'rum', 'cane_spirit')),
    packaging_type text NOT NULL CHECK (packaging_type IN ('bottle', 'closure', 'label', 'carton', 'gift_box', 'other')),
    inventory_item_id uuid REFERENCES public.items(id),
    item_name text NOT NULL,
    quantity_used integer NOT NULL,
    cost_per_unit numeric(12,2),
    total_cost numeric(12,2),
    supplier text,
    invoice_reference text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Inventory Movements (tracks all stock changes)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    item_id uuid NOT NULL REFERENCES public.items(id),
    movement_type text NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity_change numeric(12,2) NOT NULL,
    unit text NOT NULL,
    reference_type text CHECK (reference_type IN ('batch', 'purchase', 'adjustment', 'waste', 'other')),
    reference_id uuid,
    batch_type text CHECK (batch_type IN ('gin', 'vodka', 'rum', 'cane_spirit')),
    cost_per_unit numeric(12,2),
    total_cost numeric(12,2),
    supplier text,
    invoice_reference text,
    notes text,
    created_by text,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Batch Costs Summary (calculated totals)
CREATE TABLE IF NOT EXISTS public.batch_costs (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    batch_id uuid NOT NULL,
    batch_type text NOT NULL CHECK (batch_type IN ('gin', 'vodka', 'rum', 'cane_spirit')),
    ethanol_cost numeric(12,2) DEFAULT 0,
    botanical_cost numeric(12,2) DEFAULT 0,
    packaging_cost numeric(12,2) DEFAULT 0,
    other_materials_cost numeric(12,2) DEFAULT 0,
    total_cost numeric(12,2) DEFAULT 0,
    cost_per_liter numeric(12,2),
    cost_per_bottle numeric(12,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(organization_id, batch_id, batch_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_batch_materials_batch ON public.batch_materials(batch_id, batch_type);
CREATE INDEX IF NOT EXISTS idx_batch_materials_item ON public.batch_materials(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_batch_botanicals_batch ON public.batch_botanicals(batch_id, batch_type);
CREATE INDEX IF NOT EXISTS idx_batch_botanicals_item ON public.batch_botanicals(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_batch_packaging_batch ON public.batch_packaging(batch_id, batch_type);
CREATE INDEX IF NOT EXISTS idx_batch_packaging_item ON public.batch_packaging(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON public.inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_ref ON public.inventory_movements(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_batch_costs_batch ON public.batch_costs(batch_id, batch_type);

-- Enable RLS (simplified for now)
ALTER TABLE public.batch_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_botanicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_packaging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users)
CREATE POLICY "Authenticated users can view batch_materials" ON public.batch_materials FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert batch_materials" ON public.batch_materials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update batch_materials" ON public.batch_materials FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete batch_materials" ON public.batch_materials FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view batch_botanicals" ON public.batch_botanicals FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert batch_botanicals" ON public.batch_botanicals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update batch_botanicals" ON public.batch_botanicals FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete batch_botanicals" ON public.batch_botanicals FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view batch_packaging" ON public.batch_packaging FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert batch_packaging" ON public.batch_packaging FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update batch_packaging" ON public.batch_packaging FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete batch_packaging" ON public.batch_packaging FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view inventory_movements" ON public.inventory_movements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert inventory_movements" ON public.inventory_movements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view batch_costs" ON public.batch_costs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert batch_costs" ON public.batch_costs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update batch_costs" ON public.batch_costs FOR UPDATE USING (auth.uid() IS NOT NULL);

