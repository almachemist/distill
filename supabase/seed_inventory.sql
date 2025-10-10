-- Seed inventory data for testing
-- This should be run after seeding items from the UI

-- First, let's assume we have items created via the seed demo data function
-- We'll create some lots and inventory transactions

-- Insert some sample lots for botanical items
-- Note: These will only work after the seed demo data has been created from the UI

-- Insert lots for Juniper Berries
INSERT INTO public.lots (organization_id, item_id, lot_number, received_date, supplier, cost_per_unit, notes)
SELECT 
  p.organization_id,
  i.id as item_id,
  'JB-2024-001' as lot_number,
  '2024-01-15'::date as received_date,
  'Botanical Supplies Ltd' as supplier,
  45.50 as cost_per_unit,
  'Premium quality juniper berries from Macedonia' as notes
FROM public.profiles p
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND i.name = 'Juniper Berries'
ON CONFLICT (organization_id, item_id, lot_number) DO NOTHING;

-- Insert lots for Coriander Seeds
INSERT INTO public.lots (organization_id, item_id, lot_number, received_date, supplier, cost_per_unit, notes)
SELECT 
  p.organization_id,
  i.id as item_id,
  'CS-2024-001' as lot_number,
  '2024-01-15'::date as received_date,
  'Botanical Supplies Ltd' as supplier,
  28.75 as cost_per_unit,
  'Fresh coriander seeds from India' as notes
FROM public.profiles p
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND i.name = 'Coriander Seeds'
ON CONFLICT (organization_id, item_id, lot_number) DO NOTHING;

-- Insert lots for Angelica Root
INSERT INTO public.lots (organization_id, item_id, lot_number, received_date, supplier, cost_per_unit, notes)
SELECT 
  p.organization_id,
  i.id as item_id,
  'AR-2024-001' as lot_number,
  '2024-01-20'::date as received_date,
  'Herbal Extracts Co' as supplier,
  95.00 as cost_per_unit,
  'Organic angelica root from Germany' as notes
FROM public.profiles p
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND i.name = 'Angelica Root'
ON CONFLICT (organization_id, item_id, lot_number) DO NOTHING;

-- Insert lots for Neutral Spirit
INSERT INTO public.lots (organization_id, item_id, lot_number, received_date, supplier, cost_per_unit, notes)
SELECT 
  p.organization_id,
  i.id as item_id,
  'NS-2024-001' as lot_number,
  '2024-02-01'::date as received_date,
  'Premium Distillers' as supplier,
  8.50 as cost_per_unit,
  '96% neutral grain spirit' as notes
FROM public.profiles p
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND i.name = 'Neutral Spirit 96%'
ON CONFLICT (organization_id, item_id, lot_number) DO NOTHING;

-- Insert lots for Water
INSERT INTO public.lots (organization_id, item_id, lot_number, received_date, supplier, cost_per_unit, notes)
SELECT 
  p.organization_id,
  i.id as item_id,
  'W-2024-001' as lot_number,
  '2024-02-01'::date as received_date,
  'Municipal Water' as supplier,
  0.02 as cost_per_unit,
  'Filtered municipal water' as notes
FROM public.profiles p
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND i.name = 'Water'
ON CONFLICT (organization_id, item_id, lot_number) DO NOTHING;

-- Create RECEIVE transactions for initial stock
-- Juniper Berries - 50kg
INSERT INTO public.inventory_txns (organization_id, item_id, lot_id, txn_type, quantity, uom, reference_type, notes, created_by)
SELECT 
  p.organization_id,
  l.item_id,
  l.id as lot_id,
  'RECEIVE' as txn_type,
  50.0 as quantity,
  'kg' as uom,
  'initial_stock' as reference_type,
  'Initial stock receipt' as notes,
  p.id as created_by
FROM public.profiles p
CROSS JOIN public.lots l
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND l.organization_id = p.organization_id
  AND l.item_id = i.id
  AND i.name = 'Juniper Berries'
  AND l.lot_number = 'JB-2024-001';

-- Coriander Seeds - 30kg
INSERT INTO public.inventory_txns (organization_id, item_id, lot_id, txn_type, quantity, uom, reference_type, notes, created_by)
SELECT 
  p.organization_id,
  l.item_id,
  l.id as lot_id,
  'RECEIVE' as txn_type,
  30.0 as quantity,
  'kg' as uom,
  'initial_stock' as reference_type,
  'Initial stock receipt' as notes,
  p.id as created_by
FROM public.profiles p
CROSS JOIN public.lots l
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND l.organization_id = p.organization_id
  AND l.item_id = i.id
  AND i.name = 'Coriander Seeds'
  AND l.lot_number = 'CS-2024-001';

-- Angelica Root - 15kg
INSERT INTO public.inventory_txns (organization_id, item_id, lot_id, txn_type, quantity, uom, reference_type, notes, created_by)
SELECT 
  p.organization_id,
  l.item_id,
  l.id as lot_id,
  'RECEIVE' as txn_type,
  15.0 as quantity,
  'kg' as uom,
  'initial_stock' as reference_type,
  'Initial stock receipt' as notes,
  p.id as created_by
FROM public.profiles p
CROSS JOIN public.lots l
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND l.organization_id = p.organization_id
  AND l.item_id = i.id
  AND i.name = 'Angelica Root'
  AND l.lot_number = 'AR-2024-001';

-- Neutral Spirit - 1000L
INSERT INTO public.inventory_txns (organization_id, item_id, lot_id, txn_type, quantity, uom, reference_type, notes, created_by)
SELECT 
  p.organization_id,
  l.item_id,
  l.id as lot_id,
  'RECEIVE' as txn_type,
  1000.0 as quantity,
  'L' as uom,
  'initial_stock' as reference_type,
  'Initial stock receipt' as notes,
  p.id as created_by
FROM public.profiles p
CROSS JOIN public.lots l
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND l.organization_id = p.organization_id
  AND l.item_id = i.id
  AND i.name = 'Neutral Spirit 96%'
  AND l.lot_number = 'NS-2024-001';

-- Water - 5000L
INSERT INTO public.inventory_txns (organization_id, item_id, lot_id, txn_type, quantity, uom, reference_type, notes, created_by)
SELECT 
  p.organization_id,
  l.item_id,
  l.id as lot_id,
  'RECEIVE' as txn_type,
  5000.0 as quantity,
  'L' as uom,
  'initial_stock' as reference_type,
  'Initial stock receipt' as notes,
  p.id as created_by
FROM public.profiles p
CROSS JOIN public.lots l
CROSS JOIN public.items i
WHERE p.id = auth.uid()
  AND l.organization_id = p.organization_id
  AND l.item_id = i.id
  AND i.name = 'Water'
  AND l.lot_number = 'W-2024-001';



