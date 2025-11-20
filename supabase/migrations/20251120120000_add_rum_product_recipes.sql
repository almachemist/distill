-- Add rum product recipes (Pineapple, Spiced, Dark)
-- Migration: 20251120120000_add_rum_product_recipes.sql

-- Get the organization ID (assuming development organization exists)
DO $$
DECLARE
  org_id uuid;
  recipe_pineapple_id uuid;
  recipe_spiced_id uuid;
  recipe_dark_id uuid;
  item_pineapple_flavour_id uuid;
  item_glycerin_id uuid;
  item_cinnamon_id uuid;
  item_cardamom_id uuid;
  item_cloves_id uuid;
  item_star_anise_id uuid;
  item_orange_peel_id uuid;
  item_lime_peel_id uuid;
  item_vanilla_essence_id uuid;
  item_caramel_colour_id uuid;
  item_caramel_flavour_id uuid;
BEGIN
  -- Get organization ID
  SELECT id INTO org_id FROM public.organizations LIMIT 1;
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found';
  END IF;

  -- Create or get items
  INSERT INTO public.items (organization_id, name, category, default_uom, is_alcohol)
  VALUES 
    (org_id, 'Pineapple Flavour', 'flavoring', 'ml', false),
    (org_id, 'Glycerin', 'additive', 'ml', false),
    (org_id, 'Cinnamon', 'spice', 'g', false),
    (org_id, 'Cardamom', 'spice', 'g', false),
    (org_id, 'Cloves', 'spice', 'g', false),
    (org_id, 'Star Anise', 'spice', 'g', false),
    (org_id, 'Orange Peel', 'botanical', 'g', false),
    (org_id, 'Lime Peel', 'botanical', 'g', false),
    (org_id, 'Vanilla Essence', 'flavoring', 'ml', false),
    (org_id, 'Caramel Colour', 'additive', 'ml', false),
    (org_id, 'Caramel Flavour Monin', 'flavoring', 'ml', false)
  ON CONFLICT (organization_id, name) DO NOTHING;

  -- Get item IDs
  SELECT id INTO item_pineapple_flavour_id FROM public.items WHERE organization_id = org_id AND name = 'Pineapple Flavour';
  SELECT id INTO item_glycerin_id FROM public.items WHERE organization_id = org_id AND name = 'Glycerin';
  SELECT id INTO item_cinnamon_id FROM public.items WHERE organization_id = org_id AND name = 'Cinnamon';
  SELECT id INTO item_cardamom_id FROM public.items WHERE organization_id = org_id AND name = 'Cardamom';
  SELECT id INTO item_cloves_id FROM public.items WHERE organization_id = org_id AND name = 'Cloves';
  SELECT id INTO item_star_anise_id FROM public.items WHERE organization_id = org_id AND name = 'Star Anise';
  SELECT id INTO item_orange_peel_id FROM public.items WHERE organization_id = org_id AND name = 'Orange Peel';
  SELECT id INTO item_lime_peel_id FROM public.items WHERE organization_id = org_id AND name = 'Lime Peel';
  SELECT id INTO item_vanilla_essence_id FROM public.items WHERE organization_id = org_id AND name = 'Vanilla Essence';
  SELECT id INTO item_caramel_colour_id FROM public.items WHERE organization_id = org_id AND name = 'Caramel Colour';
  SELECT id INTO item_caramel_flavour_id FROM public.items WHERE organization_id = org_id AND name = 'Caramel Flavour Monin';

  -- ============================================================================
  -- PINEAPPLE RUM
  -- ============================================================================
  INSERT INTO public.recipes (organization_id, name, notes, description)
  VALUES (
    org_id,
    'Pineapple Rum',
    'Tropical pineapple-flavored rum',
    'Tropical pineapple-flavored rum with natural flavoring and glycerin for smoothness. Target: 255L @ 40% ABV'
  )
  ON CONFLICT (organization_id, name) DO UPDATE
    SET notes = EXCLUDED.notes,
        description = EXCLUDED.description,
        updated_at = now()
  RETURNING id INTO recipe_pineapple_id;

  -- Delete existing ingredients for this recipe
  DELETE FROM public.recipe_ingredients WHERE recipe_id = recipe_pineapple_id;

  -- Add ingredients for Pineapple Rum
  INSERT INTO public.recipe_ingredients (organization_id, recipe_id, item_id, qty_per_batch, uom, step, notes)
  VALUES
    (org_id, recipe_pineapple_id, item_pineapple_flavour_id, 30, 'ml', 'blending', NULL),
    (org_id, recipe_pineapple_id, item_glycerin_id, 200, 'ml', 'blending', NULL);

  -- ============================================================================
  -- SPICED RUM
  -- ============================================================================
  INSERT INTO public.recipes (organization_id, name, notes, description)
  VALUES (
    org_id,
    'Spiced Rum',
    'Traditional spiced rum with botanicals',
    'Traditional spiced rum with cinnamon, cardamom, cloves, star anise, citrus peels, and vanilla. Target: 136L @ 40% ABV'
  )
  ON CONFLICT (organization_id, name) DO UPDATE
    SET notes = EXCLUDED.notes,
        description = EXCLUDED.description,
        updated_at = now()
  RETURNING id INTO recipe_spiced_id;

  -- Delete existing ingredients for this recipe
  DELETE FROM public.recipe_ingredients WHERE recipe_id = recipe_spiced_id;

  -- Add ingredients for Spiced Rum
  INSERT INTO public.recipe_ingredients (organization_id, recipe_id, item_id, qty_per_batch, uom, step, notes)
  VALUES
    (org_id, recipe_spiced_id, item_cinnamon_id, 107.14, 'g', 'blending', 'ok but can reduce'),
    (org_id, recipe_spiced_id, item_cardamom_id, 53.57, 'g', 'blending', 'ok but can reduce'),
    (org_id, recipe_spiced_id, item_cloves_id, 53.57, 'g', 'blending', 'ok but can reduce'),
    (org_id, recipe_spiced_id, item_star_anise_id, 53.57, 'g', 'blending', 'ok but can reduce'),
    (org_id, recipe_spiced_id, item_orange_peel_id, 107.14, 'g', 'blending', 'increase by 10g'),
    (org_id, recipe_spiced_id, item_lime_peel_id, 107.14, 'g', 'blending', 'increase by 10g'),
    (org_id, recipe_spiced_id, item_vanilla_essence_id, 107.14, 'ml', 'blending', 'ok'),
    (org_id, recipe_spiced_id, item_glycerin_id, 214.29, 'ml', 'blending', 'ok');

  -- ============================================================================
  -- MERCHANT MADE DARK RUM
  -- ============================================================================
  INSERT INTO public.recipes (organization_id, name, notes, description)
  VALUES (
    org_id,
    'Merchant Made Dark Rum',
    'Rich dark rum with caramel',
    'Rich dark rum with caramel color and flavor for depth and sweetness. Target: 281L @ 37.5% ABV'
  )
  ON CONFLICT (organization_id, name) DO UPDATE
    SET notes = EXCLUDED.notes,
        description = EXCLUDED.description,
        updated_at = now()
  RETURNING id INTO recipe_dark_id;

  -- Delete existing ingredients for this recipe
  DELETE FROM public.recipe_ingredients WHERE recipe_id = recipe_dark_id;

  -- Add ingredients for Merchant Made Dark Rum
  INSERT INTO public.recipe_ingredients (organization_id, recipe_id, item_id, qty_per_batch, uom, step, notes)
  VALUES
    (org_id, recipe_dark_id, item_caramel_colour_id, 175, 'ml', 'blending', NULL),
    (org_id, recipe_dark_id, item_glycerin_id, 150, 'ml', 'blending', NULL),
    (org_id, recipe_dark_id, item_caramel_flavour_id, 300, 'ml', 'blending', NULL);

END $$;

