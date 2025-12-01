-- Fix items table UOM column naming
-- The code expects 'default_uom' but the table has 'unit'

-- Rename the unit column to default_uom to match the application code
ALTER TABLE public.items RENAME COLUMN unit TO default_uom;
















