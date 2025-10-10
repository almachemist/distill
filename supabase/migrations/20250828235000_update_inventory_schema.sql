-- Update inventory schema to match specifications

-- Update items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS abv_pct numeric(5,2);

-- Update lots table to match specification
ALTER TABLE public.lots 
  DROP COLUMN IF EXISTS lot_number,
  DROP COLUMN IF EXISTS supplier,
  DROP COLUMN IF EXISTS cost_per_unit,
  DROP COLUMN IF EXISTS expiry_date,
  DROP COLUMN IF EXISTS notes;

ALTER TABLE public.lots 
  ADD COLUMN IF NOT EXISTS code text NOT NULL DEFAULT 'LOT-' || gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS qty numeric(12,6) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS invoice_url text;

-- Make code unique per organization/item
ALTER TABLE public.lots DROP CONSTRAINT IF EXISTS lots_organization_id_item_id_lot_number_key;
ALTER TABLE public.lots ADD CONSTRAINT lots_organization_id_item_id_code_key UNIQUE (organization_id, item_id, code);

-- Update inventory_txns table
ALTER TABLE public.inventory_txns 
  DROP COLUMN IF EXISTS reference_id,
  DROP COLUMN IF EXISTS reference_type,
  DROP COLUMN IF EXISTS notes;

ALTER TABLE public.inventory_txns 
  ADD COLUMN IF NOT EXISTS dt timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS note text;

-- Update the txn_type constraint to match specification
ALTER TABLE public.inventory_txns DROP CONSTRAINT IF EXISTS inventory_txns_txn_type_check;
ALTER TABLE public.inventory_txns ADD CONSTRAINT inventory_txns_txn_type_check 
  CHECK (txn_type IN ('RECEIVE', 'CONSUME', 'TRANSFER', 'PRODUCE', 'ADJUST', 'DESTROY'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lots_code ON public.lots(organization_id, item_id, code);
CREATE INDEX IF NOT EXISTS idx_inventory_txns_dt ON public.inventory_txns(dt DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_txns_item_lot ON public.inventory_txns(item_id, lot_id);

-- Update RLS policies to use new column names
DROP POLICY IF EXISTS "Users can view lots in their organization" ON public.lots;
CREATE POLICY "Users can view lots in their organization" ON public.lots 
    FOR SELECT USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ));

DROP POLICY IF EXISTS "Operators can manage lots" ON public.lots;
CREATE POLICY "Operators can manage lots" ON public.lots 
    USING (organization_id IN (
        SELECT profiles.organization_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    ) AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(ARRAY['admin', 'manager', 'operator'])
    ));
