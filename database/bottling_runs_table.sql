-- Create bottling_runs table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS bottling_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('simple', 'blend')),
  selected_batches JSONB NOT NULL DEFAULT '[]',
  dilution_phases JSONB NOT NULL DEFAULT '[]',
  bottle_entries JSONB NOT NULL DEFAULT '[]',
  summary JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bottling_runs_created_at ON bottling_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bottling_runs_product_type ON bottling_runs(product_type);
CREATE INDEX IF NOT EXISTS idx_bottling_runs_mode ON bottling_runs(mode);

-- Add RLS policies (Row Level Security)
ALTER TABLE bottling_runs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations for authenticated users" ON bottling_runs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE bottling_runs IS 'Stores bottling run data including batches, dilution phases, and bottle entries';

