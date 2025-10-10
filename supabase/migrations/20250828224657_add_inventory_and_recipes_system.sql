-- Add inventory and recipes system
-- Tables: items, lots, inventory_txns, recipes, recipe_ingredients, production_orders

-- Items table (raw materials, chemicals, botanicals, etc.)
CREATE TABLE IF NOT EXISTS public.items (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    name text NOT NULL,
    unit text NOT NULL DEFAULT 'kg', -- default unit of measure
    is_alcohol boolean DEFAULT false, -- flag for alcohol tracking
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(organization_id, name)
);

-- Lots table (specific batches of items with quantities)
CREATE TABLE IF NOT EXISTS public.lots (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    item_id uuid NOT NULL REFERENCES public.items(id),
    lot_number text NOT NULL,
    received_date date,
    expiry_date date,
    supplier text,
    cost_per_unit numeric(10,4),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(organization_id, item_id, lot_number)
);

-- Inventory transactions (all stock movements)
CREATE TABLE IF NOT EXISTS public.inventory_txns (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    item_id uuid NOT NULL REFERENCES public.items(id),
    lot_id uuid REFERENCES public.lots(id),
    txn_type text NOT NULL CHECK (txn_type IN ('RECEIVE', 'PRODUCE', 'CONSUME', 'TRANSFER', 'DESTROY', 'ADJUST')),
    quantity numeric(12,6) NOT NULL,
    uom text NOT NULL, -- unit of measure for this transaction
    reference_id uuid, -- reference to production_orders, transfers, etc.
    reference_type text, -- 'production_order', 'manual_adjust', etc.
    notes text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    name text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(organization_id, name)
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    recipe_id uuid NOT NULL REFERENCES public.recipes(id),
    item_id uuid NOT NULL REFERENCES public.items(id),
    qty_per_batch numeric(12,6) NOT NULL,
    uom text NOT NULL,
    step text NOT NULL CHECK (step IN ('maceration', 'distillation', 'proofing', 'bottling')),
    created_at timestamp with time zone DEFAULT now()
);

-- Production orders table
CREATE TABLE IF NOT EXISTS public.production_orders (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    recipe_id uuid NOT NULL REFERENCES public.recipes(id),
    product_name text NOT NULL,
    batch_target_l numeric(10,2) NOT NULL, -- target batch size in liters
    status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'released', 'in_process', 'complete')),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_items_org ON public.items(organization_id);
CREATE INDEX idx_items_name ON public.items(organization_id, name);

CREATE INDEX idx_lots_org ON public.lots(organization_id);
CREATE INDEX idx_lots_item ON public.lots(item_id);

CREATE INDEX idx_inventory_txns_org ON public.inventory_txns(organization_id);
CREATE INDEX idx_inventory_txns_item ON public.inventory_txns(item_id);
CREATE INDEX idx_inventory_txns_lot ON public.inventory_txns(lot_id);
CREATE INDEX idx_inventory_txns_type ON public.inventory_txns(txn_type);
CREATE INDEX idx_inventory_txns_ref ON public.inventory_txns(reference_id, reference_type);

CREATE INDEX idx_recipes_org ON public.recipes(organization_id);
CREATE INDEX idx_recipes_name ON public.recipes(organization_id, name);

CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_item ON public.recipe_ingredients(item_id);
CREATE INDEX idx_recipe_ingredients_step ON public.recipe_ingredients(step);

CREATE INDEX idx_production_orders_org ON public.production_orders(organization_id);
CREATE INDEX idx_production_orders_recipe ON public.production_orders(recipe_id);
CREATE INDEX idx_production_orders_status ON public.production_orders(status);

-- Add updated_at triggers
CREATE OR REPLACE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON public.items 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER update_lots_updated_at 
    BEFORE UPDATE ON public.lots 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON public.recipes 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER update_production_orders_updated_at 
    BEFORE UPDATE ON public.production_orders 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_txns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items
CREATE POLICY "Users can view items in their organization" ON public.items 
    FOR SELECT USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Managers can manage items" ON public.items 
    USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ) AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(ARRAY['admin', 'manager'])
    ));

-- RLS Policies for lots
CREATE POLICY "Users can view lots in their organization" ON public.lots 
    FOR SELECT USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Operators can manage lots" ON public.lots 
    USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ) AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(ARRAY['admin', 'manager', 'operator'])
    ));

-- RLS Policies for inventory_txns
CREATE POLICY "Users can view inventory txns in their organization" ON public.inventory_txns 
    FOR SELECT USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Operators can create inventory txns" ON public.inventory_txns 
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ) AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(ARRAY['admin', 'manager', 'operator'])
    ));

-- RLS Policies for recipes
CREATE POLICY "Users can view recipes in their organization" ON public.recipes 
    FOR SELECT USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Managers can manage recipes" ON public.recipes 
    USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ) AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(ARRAY['admin', 'manager'])
    ));

-- RLS Policies for recipe_ingredients
CREATE POLICY "Users can view recipe ingredients in their organization" ON public.recipe_ingredients 
    FOR SELECT USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Managers can manage recipe ingredients" ON public.recipe_ingredients 
    USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ) AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(ARRAY['admin', 'manager'])
    ));

-- RLS Policies for production_orders
CREATE POLICY "Users can view production orders in their organization" ON public.production_orders 
    FOR SELECT USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ));

CREATE POLICY "Operators can manage production orders" ON public.production_orders 
    USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ) AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(ARRAY['admin', 'manager', 'operator'])
    ));



