-- Add category field to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS category text;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(organization_id, category);

-- Update existing items to have a default category
UPDATE public.items SET category = 'botanical' WHERE category IS NULL AND is_alcohol = false AND name NOT LIKE '%Spirit%' AND name NOT LIKE '%Water%';
UPDATE public.items SET category = 'neutral_spirit' WHERE category IS NULL AND is_alcohol = true;
UPDATE public.items SET category = 'other' WHERE category IS NULL AND name = 'Water';



