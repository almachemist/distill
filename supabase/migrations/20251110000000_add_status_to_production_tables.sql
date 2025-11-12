-- Add status field to production tables for draft system
-- Migration: 20251110000000_add_status_to_production_tables.sql

-- Create status enum type
CREATE TYPE production_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');

-- Add status column to rum_production_runs
ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS status production_status DEFAULT 'completed';

-- Update existing records to 'completed' (they are historical data)
UPDATE rum_production_runs 
SET status = 'completed' 
WHERE status IS NULL;

-- Add index for faster queries on draft batches
CREATE INDEX IF NOT EXISTS idx_rum_production_runs_status 
ON rum_production_runs(status);

-- Add index for faster queries on draft batches in production_batches
-- (production_batches already stores status in JSONB data field)
CREATE INDEX IF NOT EXISTS idx_production_batches_status 
ON production_batches((data->>'status'));

-- Add comments
COMMENT ON COLUMN rum_production_runs.status IS 'Production status: draft, in_progress, completed, or archived';
COMMENT ON TYPE production_status IS 'Status of a production batch in the workflow';

