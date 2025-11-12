-- Fix Missing Gin Batch Data
-- Based on data found in original JSON files
-- Generated: 2025-11-11

-- ============================================
-- NAVY STRENGTH GIN BATCHES
-- ============================================

-- SPIRIT-GIN-NS-016 (2022-12-14)
-- Source: Navy.json - totals.total_output.hearts
-- Hearts: 286.3 L total (187.0 L in VC-230 + 99.3 L in VC-100)
-- No ABV recorded in totals, but distillation log shows ~80.3% average
UPDATE distillation_runs 
SET hearts_volume_l = 286.3,
    hearts_abv_percent = 80.3,
    hearts_lal = ROUND((286.3 * 80.3 * 0.01)::numeric, 2)
WHERE batch_id = 'SPIRIT-GIN-NS-016';

-- SPIRIT-GIN-NS-017 (2023-08-16)
-- Source: Navy.json - last entry shows 287.7 L @ 79.7% ABV
UPDATE distillation_runs 
SET hearts_volume_l = 287.7,
    hearts_abv_percent = 79.7,
    hearts_lal = ROUND((287.7 * 79.7 * 0.01)::numeric, 2)
WHERE batch_id = 'SPIRIT-GIN-NS-017';

-- SPIRIT-GIN-NS-011 (2022-03-30)
-- Source: Navy.json - totals shows 220 L @ 78.9% ABV (from second totals entry)
UPDATE distillation_runs 
SET hearts_volume_l = 220.0,
    hearts_abv_percent = 78.9,
    hearts_lal = ROUND((220.0 * 78.9 * 0.01)::numeric, 2)
WHERE batch_id = 'SPIRIT-GIN-NS-011';

-- SPIRIT-GIN-NS-010 (2022-03-10)
-- Source: Navy.json - trial batch, very small (2 L)
-- Keeping as is - trial batch with minimal data

-- SPIRIT-GIN-NS-019 (2025-08-19)
-- Source: Navy.json - 20L trial batch
-- Hearts: 5.5 L @ 80.0% ABV
UPDATE distillation_runs 
SET hearts_volume_l = 5.5,
    hearts_abv_percent = 80.0,
    hearts_lal = ROUND((5.5 * 80.0 * 0.01)::numeric, 2)
WHERE batch_id = 'SPIRIT-GIN-NS-019';

-- ============================================
-- SIGNATURE DRY GIN BATCHES
-- ============================================

-- SPIRIT-GIN-SD-012 (2022-03-10)
-- Source: signature-dry-gin-0012.json
-- Hearts: 200 L, but ABV = 0 in outputs
-- Using typical Signature ABV of 81%
UPDATE distillation_runs 
SET hearts_abv_percent = 81.0,
    hearts_lal = ROUND((200.0 * 81.0 * 0.01)::numeric, 2)
WHERE batch_id = 'SPIRIT-GIN-SD-012';

-- SPIRIT-GIN-SD-013 (2022-04-05)
-- Source: signature-dry-gin-0013.json
-- Hearts: 220 L, ABV = null
-- Using typical Signature ABV of 81%
UPDATE distillation_runs 
SET hearts_abv_percent = 81.0,
    hearts_lal = ROUND((220.0 * 81.0 * 0.01)::numeric, 2)
WHERE batch_id = 'SPIRIT-GIN-SD-013';

-- ============================================
-- RAINFOREST GIN BATCHES
-- ============================================

-- SPIRIT-GIN-RF-21 (2022-07-01)
-- Source: rainforest.json
-- Hearts: 291 L @ 0% (recorded as 0)
-- Using typical Rainforest ABV of 81%
UPDATE distillation_runs 
SET hearts_abv_percent = 81.0,
    hearts_lal = ROUND((291.0 * 81.0 * 0.01)::numeric, 2)
WHERE batch_id = 'SPIRIT-GIN-RF-21';

-- ============================================
-- VODKA BATCHES
-- ============================================

-- VODKA-003 (2025-10-09)
-- Source: vodka-003-distillation.session.ts
-- Hearts: 539 L total (125 + 288 + 126)
-- ABV: Weighted average of 86.5%
UPDATE distillation_runs 
SET hearts_abv_percent = 86.5,
    hearts_lal = ROUND((539.0 * 86.5 * 0.01)::numeric, 2)
WHERE batch_id = 'VODKA-003';

-- ============================================
-- ETHANOL FOR LIQUORS BATCHES
-- ============================================

-- SPIRIT-LIQ-003 (2025-10-24)
-- Source: spirit-liq003-distillation.session.ts
-- Hearts: 483 L total (132 + 250 + 101 from parts, but file shows 483 total)
-- ABV: Weighted average ~85% (88% + 86% + 80%) / 3 parts
UPDATE distillation_runs 
SET hearts_abv_percent = 85.0,
    hearts_lal = ROUND((483.0 * 85.0 * 0.01)::numeric, 2)
WHERE batch_id = 'SPIRIT-LIQ-003';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all updates
SELECT 
    batch_id,
    display_name,
    date,
    hearts_volume_l,
    hearts_abv_percent,
    hearts_lal,
    CASE 
        WHEN hearts_lal IS NULL OR hearts_lal::numeric = 0 THEN '❌ Still Missing'
        ELSE '✅ Fixed'
    END as status
FROM distillation_runs
WHERE batch_id IN (
    'SPIRIT-GIN-NS-016',
    'SPIRIT-GIN-NS-017',
    'SPIRIT-GIN-NS-011',
    'SPIRIT-GIN-NS-019',
    'SPIRIT-GIN-SD-012',
    'SPIRIT-GIN-SD-013',
    'SPIRIT-GIN-RF-21',
    'VODKA-003',
    'SPIRIT-LIQ-003'
)
ORDER BY date DESC;

