-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('DISTILLATION', 'BOTTLING', 'BLENDING', 'PACKAGING', 'MAINTENANCE', 'DELIVERY', 'TASTING', 'OTHER')),
  status TEXT NOT NULL CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
  resource TEXT,
  sku TEXT,
  linked_collection TEXT CHECK (linked_collection IN ('distillationSessions', 'bottlings', 'blends', 'workOrders')),
  linked_id TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'Australia/Brisbane',
  notes TEXT,
  color TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_organization_id ON calendar_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_starts_at ON calendar_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked ON calendar_events(linked_collection, linked_id);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view calendar events for their organization" ON calendar_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert calendar events for their organization" ON calendar_events
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update calendar events for their organization" ON calendar_events
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete calendar events for their organization" ON calendar_events
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_calendar_events_updated_at 
  BEFORE UPDATE ON calendar_events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
