-- Add description field to recipes table
ALTER TABLE public.recipes ADD COLUMN description text;

-- Add a comment for documentation
COMMENT ON COLUMN public.recipes.description IS 'Detailed description of the recipe, including flavor profile and characteristics';






