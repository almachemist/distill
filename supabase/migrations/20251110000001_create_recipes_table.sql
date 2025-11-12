-- Create recipes table
-- Migration: 20251110000001_create_recipes_table.sql

-- Recipes are reusable templates for production batches
-- When creating a new batch, user selects a recipe and the system
-- creates a draft with the recipe data as a starting point

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_product_type ON recipes(product_type);
CREATE INDEX IF NOT EXISTS idx_recipes_is_active ON recipes(is_active);
CREATE INDEX IF NOT EXISTS idx_recipes_recipe_name ON recipes(recipe_name);

-- Comments
COMMENT ON TABLE recipes IS 'Reusable production recipes/templates';
COMMENT ON COLUMN recipes.recipe_name IS 'Name of the recipe (e.g., Rainforest Gin, Navy Strength Rum)';
COMMENT ON COLUMN recipes.product_type IS 'Type of product: gin, vodka, rum, cane_spirit, liqueur, other';
COMMENT ON COLUMN recipes.data IS 'Recipe data in JSONB format (botanicals, process parameters, etc.)';
COMMENT ON COLUMN recipes.is_active IS 'Whether this recipe is active (can be used to archive old recipes)';

-- Insert sample recipes
INSERT INTO recipes (recipe_name, product_type, description, data, is_active) VALUES
(
  'Rainforest Gin',
  'gin',
  'Tropical botanical gin with native Australian ingredients',
  '{
    "baseSpirit": "Ethanol 96%",
    "targetChargeVolume_L": 1000,
    "targetChargeABV_percent": 25,
    "botanicals": [
      {"name": "Juniper", "weight_g": 6250, "ratio_percent": 62.6, "phase": "steep"},
      {"name": "Coriander", "weight_g": 1500, "ratio_percent": 15.0, "phase": "steep"},
      {"name": "Finger Lime", "weight_g": 500, "ratio_percent": 5.0, "phase": "vapor"},
      {"name": "Lemon Myrtle", "weight_g": 300, "ratio_percent": 3.0, "phase": "vapor"}
    ],
    "totalBotanicals_g": 8550,
    "botanicalsPerLAL": 34.2,
    "recommendedStill": "Carrie",
    "steepingHours": 14,
    "elements": "16000 W × 2",
    "plates": "Zero plates",
    "helmetType": "Standard",
    "targetHearts_L": 240,
    "targetFinalABV_percent": 42,
    "distillationNotes": "Distil with helmet and no plates for maximum botanical character"
  }'::jsonb,
  true
),
(
  'Oaks Kitchen Gin',
  'gin',
  'Thai-inspired botanical gin with kaffir lime and holy basil',
  '{
    "baseSpirit": "Manildra NC96",
    "targetChargeVolume_L": 1000,
    "targetChargeABV_percent": 25,
    "botanicals": [
      {"name": "Juniper", "weight_g": 6250, "ratio_percent": 62.6, "phase": "steep"},
      {"name": "Kaffir Lime Leaf", "weight_g": 800, "ratio_percent": 8.0, "phase": "steep"},
      {"name": "Holy Basil", "weight_g": 600, "ratio_percent": 6.0, "phase": "vapor"},
      {"name": "Galangal", "weight_g": 500, "ratio_percent": 5.0, "phase": "steep"},
      {"name": "Lemongrass", "weight_g": 400, "ratio_percent": 4.0, "phase": "vapor"}
    ],
    "totalBotanicals_g": 9987,
    "botanicalsPerLAL": 39.9,
    "recommendedStill": "Carrie",
    "steepingHours": 14,
    "elements": "16000 W × 2",
    "plates": "Zero plates",
    "targetHearts_L": 236,
    "targetFinalABV_percent": 42,
    "distillationNotes": "Thai-inspired aromatic profile with citrus-basil depth"
  }'::jsonb,
  true
),
(
  'Standard Rum',
  'rum',
  'Traditional molasses rum with dunder',
  '{
    "substrateType": "A Molasses",
    "targetSubstrateMass_kg": 500,
    "targetWaterMass_kg": 1350,
    "targetInitialBrix": 22.5,
    "targetInitialPH": 5.45,
    "dunderRecommended": true,
    "dunderType": "Clean dunder",
    "dunderVolume_L": 150,
    "yeastType": "Distillamax CN",
    "yeastMass_g": 1000,
    "yeastRehydrationTemp_C": 35,
    "yeastRehydrationTime_min": 20,
    "antifoam_ml": 100,
    "fermaid_g": 1000,
    "targetFermentationDays": 5,
    "targetFinalBrix": 1.7,
    "targetFinalPH": 4.78,
    "targetFinalABV_percent": 11.5,
    "recommendedStill": "Roberta",
    "boilerElements": "6 × 5750 W main",
    "retort1Elements": "2200 W",
    "retort2Elements": "2200 W",
    "retort1Content": "Heads and tails",
    "targetHeartsVolume_L": 75,
    "targetHeartsABV_percent": 84,
    "maturationRecommended": true,
    "recommendedCaskType": "Ex-Bourbon",
    "recommendedFillABV_percent": 63.5,
    "recommendedAgingMonths": 24,
    "fermentationNotes": "Monitor temperature curve - should peak at 33°C in first 24h",
    "distillationNotes": "Double retort system for cleaner spirit"
  }'::jsonb,
  true
);

