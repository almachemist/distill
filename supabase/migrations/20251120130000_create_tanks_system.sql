-- Create tanks table for production tank management
CREATE TABLE IF NOT EXISTS public.tanks (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    tank_id text NOT NULL,
    tank_name text NOT NULL,
    tank_type text NOT NULL CHECK (tank_type IN ('fermenter', 'holding', 'spirits', 'storage')),
    capacity_l numeric(12,2) NOT NULL,
    
    -- Current contents
    product text,
    current_abv numeric(5,2),
    current_volume_l numeric(12,2),
    status text NOT NULL DEFAULT 'empty' CHECK (status IN (
        'empty',
        'fresh_distillation',
        'settling',
        'waiting_to_proof',
        'proofed_resting',
        'ready_to_bottle',
        'bottled_empty',
        'cleaning',
        'maintenance'
    )),
    notes text,
    
    -- Metadata
    last_updated_by text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    UNIQUE(organization_id, tank_id)
);

-- Create tank history table for audit trail
CREATE TABLE IF NOT EXISTS public.tank_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    tank_id uuid NOT NULL REFERENCES public.tanks(id),
    action text NOT NULL,
    user_name text,
    previous_values jsonb,
    new_values jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tanks_org ON public.tanks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tanks_status ON public.tanks(status);
CREATE INDEX IF NOT EXISTS idx_tank_history_tank ON public.tank_history(tank_id);
CREATE INDEX IF NOT EXISTS idx_tank_history_created ON public.tank_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tank_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tanks
CREATE POLICY "Users can view tanks in their organization"
    ON public.tanks FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert tanks in their organization"
    ON public.tanks FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update tanks in their organization"
    ON public.tanks FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    ));

-- RLS Policies for tank history
CREATE POLICY "Users can view tank history in their organization"
    ON public.tank_history FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert tank history in their organization"
    ON public.tank_history FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    ));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tanks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER tanks_updated_at
    BEFORE UPDATE ON public.tanks
    FOR EACH ROW
    EXECUTE FUNCTION update_tanks_updated_at();

-- Insert initial tanks for the organization
DO $$
DECLARE
    org_id uuid;
BEGIN
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    
    IF org_id IS NOT NULL THEN
        INSERT INTO public.tanks (organization_id, tank_id, tank_name, tank_type, capacity_l, status) VALUES
        (org_id, 'TK-01', 'Tank 1', 'spirits', 1000, 'empty'),
        (org_id, 'TK-02', 'Tank 2', 'spirits', 1000, 'empty'),
        (org_id, 'TK-03', 'Tank 3', 'spirits', 1000, 'empty'),
        (org_id, 'TK-04', 'Tank 4', 'spirits', 1000, 'empty'),
        (org_id, 'TK-05', 'Tank 5', 'spirits', 1000, 'empty'),
        (org_id, 'TK-06', 'Tank 6', 'spirits', 500, 'empty'),
        (org_id, 'TK-07', 'Tank 7', 'spirits', 500, 'empty'),
        (org_id, 'TK-08', 'Tank 8', 'holding', 2000, 'empty'),
        (org_id, 'TK-09', 'Tank 9', 'holding', 2000, 'empty'),
        (org_id, 'TK-10', 'Tank 10', 'fermenter', 3000, 'empty')
        ON CONFLICT (organization_id, tank_id) DO NOTHING;
    END IF;
END $$;

