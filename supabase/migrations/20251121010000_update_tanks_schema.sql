-- Update tanks table schema for comprehensive tank inventory management
-- Adds: type, has_lid, batch_id, extra_materials, started_on, infusion details

-- Add new columns to tanks table
ALTER TABLE public.tanks
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'steel' CHECK (type IN ('steel', 'plastic', 'glass', 'oak_barrel', 'other')),
  ADD COLUMN IF NOT EXISTS has_lid boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS batch_id text,
  ADD COLUMN IF NOT EXISTS batch text,
  ADD COLUMN IF NOT EXISTS extra_materials jsonb,
  ADD COLUMN IF NOT EXISTS started_on timestamp with time zone,
  ADD COLUMN IF NOT EXISTS infusion_type text,
  ADD COLUMN IF NOT EXISTS expected_completion timestamp with time zone,
  ADD COLUMN IF NOT EXISTS location text;

-- Update status column to include new statuses
ALTER TABLE public.tanks
  DROP CONSTRAINT IF EXISTS tanks_status_check;

ALTER TABLE public.tanks
  ADD CONSTRAINT tanks_status_check CHECK (status IN (
    'empty',
    'holding',
    'infusing',
    'pending_redistillation',
    'fresh_distillation',
    'settling',
    'waiting_to_proof',
    'proofed_resting',
    'ready_to_bottle',
    'bottled_empty',
    'cleaning',
    'maintenance',
    'unavailable'
  ));

-- Create tank_movements table for tracking all tank changes
CREATE TABLE IF NOT EXISTS public.tank_movements (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  tank_id uuid NOT NULL REFERENCES public.tanks(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('fill', 'drain', 'transfer_in', 'transfer_out', 'adjustment')),
  volume_change_l numeric(12,2) NOT NULL,
  abv_before numeric(5,2),
  abv_after numeric(5,2),
  volume_before_l numeric(12,2),
  volume_after_l numeric(12,2),
  batch_id text,
  reference_tank_id uuid REFERENCES public.tanks(id),
  notes text,
  created_by text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for tank_movements
CREATE INDEX IF NOT EXISTS idx_tank_movements_tank_id ON public.tank_movements(tank_id);
CREATE INDEX IF NOT EXISTS idx_tank_movements_batch_id ON public.tank_movements(batch_id);
CREATE INDEX IF NOT EXISTS idx_tank_movements_created_at ON public.tank_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tank_movements_organization_id ON public.tank_movements(organization_id);

-- Disable RLS on tank_movements for easier access (enable later with proper policies)
ALTER TABLE public.tank_movements DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE public.tank_movements IS 'Tracks all tank fill/drain/transfer movements with volume and ABV changes';
COMMENT ON COLUMN public.tanks.type IS 'Tank material type: steel, plastic, glass, oak_barrel, other';
COMMENT ON COLUMN public.tanks.has_lid IS 'Whether tank has a lid (affects usability and evaporation)';
COMMENT ON COLUMN public.tanks.batch_id IS 'Linked production batch ID';
COMMENT ON COLUMN public.tanks.batch IS 'Batch name/number for display';
COMMENT ON COLUMN public.tanks.extra_materials IS 'JSON object storing infusion materials (coffee_kg, vanilla_beans, etc.)';
COMMENT ON COLUMN public.tanks.started_on IS 'Date when infusion or process started';
COMMENT ON COLUMN public.tanks.infusion_type IS 'Type of infusion: coffee, vanilla, spice, fruit, etc.';
COMMENT ON COLUMN public.tanks.expected_completion IS 'Expected completion date for infusion or process';
COMMENT ON COLUMN public.tanks.location IS 'Physical location in distillery';

-- Create function to automatically log tank movements when tank is updated
CREATE OR REPLACE FUNCTION public.log_tank_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if volume or ABV changed
  IF (OLD.volume IS DISTINCT FROM NEW.volume) OR (OLD.abv IS DISTINCT FROM NEW.abv) THEN
    INSERT INTO public.tank_movements (
      organization_id,
      tank_id,
      movement_type,
      volume_change_l,
      abv_before,
      abv_after,
      volume_before_l,
      volume_after_l,
      batch_id,
      notes,
      created_by
    ) VALUES (
      NEW.organization_id,
      NEW.id,
      CASE
        WHEN NEW.volume > COALESCE(OLD.volume, 0) THEN 'fill'
        WHEN NEW.volume < COALESCE(OLD.volume, 0) THEN 'drain'
        ELSE 'adjustment'
      END,
      COALESCE(NEW.volume, 0) - COALESCE(OLD.volume, 0),
      OLD.abv,
      NEW.abv,
      OLD.volume,
      NEW.volume,
      NEW.batch_id,
      'Automatic movement log',
      'system'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log tank movements
DROP TRIGGER IF EXISTS trigger_log_tank_movement ON public.tanks;
CREATE TRIGGER trigger_log_tank_movement
  AFTER UPDATE ON public.tanks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_tank_movement();

