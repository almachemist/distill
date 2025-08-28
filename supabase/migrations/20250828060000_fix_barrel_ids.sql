-- Drop the existing primary key constraint
ALTER TABLE tracking DROP CONSTRAINT IF EXISTS tracking_pkey;

-- Add a new UUID id column as primary key
ALTER TABLE tracking ADD COLUMN IF NOT EXISTS id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL;

-- Add primary key constraint on the new id column
ALTER TABLE tracking ADD PRIMARY KEY (id);

-- Rename barrel_id to barrel_number for clarity (human-readable)
ALTER TABLE tracking RENAME COLUMN barrel_id TO barrel_number;

-- Create unique constraint on barrel_number within organization
ALTER TABLE tracking ADD CONSTRAINT tracking_barrel_number_org_unique 
  UNIQUE (barrel_number, organization_id);

-- Add index on barrel_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_tracking_barrel_number ON tracking(barrel_number);