-- Add stage-based status fields to rum_production_runs
-- This allows tracking completion of each production stage independently

-- Add stage status columns
ALTER TABLE public.rum_production_runs
ADD COLUMN IF NOT EXISTS fermentation_status TEXT DEFAULT 'not_started' CHECK (fermentation_status IN ('not_started', 'in_progress', 'completed')),
ADD COLUMN IF NOT EXISTS distillation_status TEXT DEFAULT 'not_started' CHECK (distillation_status IN ('not_started', 'in_progress', 'completed')),
ADD COLUMN IF NOT EXISTS aging_status TEXT DEFAULT 'not_started' CHECK (aging_status IN ('not_started', 'in_progress', 'completed', 'skipped')),
ADD COLUMN IF NOT EXISTS bottling_status TEXT DEFAULT 'not_started' CHECK (bottling_status IN ('not_started', 'in_progress', 'completed', 'skipped')),
ADD COLUMN IF NOT EXISTS overall_status TEXT DEFAULT 'draft' CHECK (overall_status IN ('draft', 'fermenting', 'distilling', 'aging', 'ready_to_bottle', 'bottled', 'archived'));

-- Add comments
COMMENT ON COLUMN public.rum_production_runs.fermentation_status IS 'Status of fermentation stage: not_started, in_progress, completed';
COMMENT ON COLUMN public.rum_production_runs.distillation_status IS 'Status of distillation stage: not_started, in_progress, completed';
COMMENT ON COLUMN public.rum_production_runs.aging_status IS 'Status of aging stage: not_started, in_progress, completed, skipped';
COMMENT ON COLUMN public.rum_production_runs.bottling_status IS 'Status of bottling stage: not_started, in_progress, completed, skipped';
COMMENT ON COLUMN public.rum_production_runs.overall_status IS 'Overall batch status: draft, fermenting, distilling, aging, ready_to_bottle, bottled, archived';

-- Migrate existing data from old 'status' field to new stage-based fields
-- Assuming 'status' field exists with values like 'draft', 'in_progress', 'completed'
UPDATE public.rum_production_runs
SET 
  fermentation_status = CASE 
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'in_progress' THEN 'in_progress'
    ELSE 'not_started'
  END,
  distillation_status = CASE 
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'in_progress' THEN 'in_progress'
    ELSE 'not_started'
  END,
  aging_status = CASE 
    WHEN status = 'completed' THEN 'skipped'
    ELSE 'not_started'
  END,
  bottling_status = 'not_started',
  overall_status = CASE 
    WHEN status = 'completed' THEN 'distilling'
    WHEN status = 'in_progress' THEN 'fermenting'
    ELSE 'draft'
  END
WHERE fermentation_status IS NULL OR overall_status IS NULL;

-- Keep the old 'status' field for backward compatibility (can be removed later)
-- ALTER TABLE public.rum_production_runs DROP COLUMN IF EXISTS status;

