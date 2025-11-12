-- Rum Production Schema Migration
-- Date: 2025-01-07
-- Purpose: Add missing fields and standardize data structure

-- ============================================
-- 1. Add Missing Cuts Fields
-- ============================================

-- Add foreshots volume (currently only have foreshots_abv_percent)
ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS foreshots_volume_l NUMERIC;

COMMENT ON COLUMN rum_production_runs.foreshots_volume_l IS 
'Volume of foreshots collected (usually discarded), in liters';

-- Add tails volume (currently using tails_segments JSONB)
ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS tails_volume_l NUMERIC;

COMMENT ON COLUMN rum_production_runs.tails_volume_l IS 
'Total volume of tails collected (early + late), in liters';

-- Add tails ABV
ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS tails_abv_percent NUMERIC;

COMMENT ON COLUMN rum_production_runs.tails_abv_percent IS 
'Average ABV of tails collected, as percentage';

-- ============================================
-- 2. Add Antifoam Tracking
-- ============================================

ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS antifoam_added BOOLEAN DEFAULT false;

COMMENT ON COLUMN rum_production_runs.antifoam_added IS 
'Whether antifoam was added during fermentation';

-- Update existing records where anti_foam_ml > 0
UPDATE rum_production_runs 
SET antifoam_added = true 
WHERE anti_foam_ml > 0;

-- ============================================
-- 3. Rename Fermaid Column for Clarity
-- ============================================

-- Check if column exists before renaming
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'rum_production_runs' 
        AND column_name = 'fermaid_g'
    ) THEN
        ALTER TABLE rum_production_runs 
        RENAME COLUMN fermaid_g TO fermaid_o_g;
    END IF;
END $$;

COMMENT ON COLUMN rum_production_runs.fermaid_o_g IS 
'Mass of Fermaid O nutrient added, in grams';

-- ============================================
-- 4. Data Migration: Extract Tails from JSONB
-- ============================================

-- Migrate tails data from tails_segments JSONB to new columns
-- This assumes tails_segments has structure like:
-- [{"segment": "early", "volume_l": 50, "abv_percent": 75}, ...]

UPDATE rum_production_runs
SET 
    tails_volume_l = (
        SELECT SUM((segment->>'volume_l')::numeric)
        FROM jsonb_array_elements(tails_segments) AS segment
    ),
    tails_abv_percent = (
        SELECT AVG((segment->>'abv_percent')::numeric)
        FROM jsonb_array_elements(tails_segments) AS segment
    )
WHERE tails_segments IS NOT NULL 
AND jsonb_array_length(tails_segments) > 0;

-- ============================================
-- 5. Data Consistency: Sync ABV Values
-- ============================================

-- Set boiler_abv_percent = final_abv_percent where boiler is NULL
-- This enforces the single-source-of-truth principle
UPDATE rum_production_runs
SET boiler_abv_percent = final_abv_percent
WHERE boiler_abv_percent IS NULL 
AND final_abv_percent IS NOT NULL;

-- Set final_abv_percent = boiler_abv_percent where final is NULL
-- (reverse direction for incomplete records)
UPDATE rum_production_runs
SET final_abv_percent = boiler_abv_percent
WHERE final_abv_percent IS NULL 
AND boiler_abv_percent IS NOT NULL;

-- ============================================
-- 6. Add Constraints and Validation
-- ============================================

-- Ensure ABV values are reasonable
ALTER TABLE rum_production_runs
ADD CONSTRAINT check_final_abv_range 
CHECK (final_abv_percent IS NULL OR (final_abv_percent > 0 AND final_abv_percent < 20));

ALTER TABLE rum_production_runs
ADD CONSTRAINT check_boiler_abv_range 
CHECK (boiler_abv_percent IS NULL OR (boiler_abv_percent > 0 AND boiler_abv_percent < 20));

-- Ensure brix values make sense
ALTER TABLE rum_production_runs
ADD CONSTRAINT check_brix_decrease 
CHECK (
    initial_brix IS NULL OR 
    final_brix IS NULL OR 
    initial_brix >= final_brix
);

-- Ensure volume filled doesn't exceed cask size
ALTER TABLE rum_production_runs
ADD CONSTRAINT check_cask_fill 
CHECK (
    cask_size_l IS NULL OR 
    volume_filled_l IS NULL OR 
    volume_filled_l <= cask_size_l
);

-- ============================================
-- 7. Create Indexes for Performance
-- ============================================

-- Index on batch_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_rum_batch_id 
ON rum_production_runs(batch_id);

-- Index on dates for filtering
CREATE INDEX IF NOT EXISTS idx_rum_fermentation_date 
ON rum_production_runs(fermentation_start_date);

CREATE INDEX IF NOT EXISTS idx_rum_distillation_date 
ON rum_production_runs(distillation_date);

CREATE INDEX IF NOT EXISTS idx_rum_fill_date 
ON rum_production_runs(fill_date);

-- Index on product type for filtering
CREATE INDEX IF NOT EXISTS idx_rum_product_type 
ON rum_production_runs(product_type);

-- ============================================
-- 8. Verification Queries
-- ============================================

-- Check records with missing ABV sync
SELECT 
    batch_id,
    final_abv_percent,
    boiler_abv_percent,
    CASE 
        WHEN final_abv_percent IS NULL AND boiler_abv_percent IS NULL THEN 'Both NULL'
        WHEN final_abv_percent IS NULL THEN 'Final NULL'
        WHEN boiler_abv_percent IS NULL THEN 'Boiler NULL'
        WHEN ABS(final_abv_percent - boiler_abv_percent) > 0.1 THEN 'Mismatch'
        ELSE 'OK'
    END AS status
FROM rum_production_runs
WHERE final_abv_percent IS DISTINCT FROM boiler_abv_percent;

-- Check tails migration
SELECT 
    batch_id,
    tails_segments,
    tails_volume_l,
    tails_abv_percent
FROM rum_production_runs
WHERE tails_segments IS NOT NULL
LIMIT 10;

-- Summary statistics
SELECT 
    COUNT(*) AS total_records,
    COUNT(final_abv_percent) AS has_final_abv,
    COUNT(boiler_abv_percent) AS has_boiler_abv,
    COUNT(tails_volume_l) AS has_tails_volume,
    COUNT(foreshots_volume_l) AS has_foreshots_volume,
    COUNT(CASE WHEN antifoam_added THEN 1 END) AS used_antifoam
FROM rum_production_runs;

-- ============================================
-- 9. Rollback Script (if needed)
-- ============================================

/*
-- To rollback these changes:

ALTER TABLE rum_production_runs DROP COLUMN IF EXISTS foreshots_volume_l;
ALTER TABLE rum_production_runs DROP COLUMN IF EXISTS tails_volume_l;
ALTER TABLE rum_production_runs DROP COLUMN IF EXISTS tails_abv_percent;
ALTER TABLE rum_production_runs DROP COLUMN IF EXISTS antifoam_added;
ALTER TABLE rum_production_runs RENAME COLUMN fermaid_o_g TO fermaid_g;

ALTER TABLE rum_production_runs DROP CONSTRAINT IF EXISTS check_final_abv_range;
ALTER TABLE rum_production_runs DROP CONSTRAINT IF EXISTS check_boiler_abv_range;
ALTER TABLE rum_production_runs DROP CONSTRAINT IF EXISTS check_brix_decrease;
ALTER TABLE rum_production_runs DROP CONSTRAINT IF EXISTS check_cask_fill;

DROP INDEX IF EXISTS idx_rum_batch_id;
DROP INDEX IF EXISTS idx_rum_fermentation_date;
DROP INDEX IF EXISTS idx_rum_distillation_date;
DROP INDEX IF EXISTS idx_rum_fill_date;
DROP INDEX IF EXISTS idx_rum_product_type;
*/

