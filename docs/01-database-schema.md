# Database Schema & Structure (Supabase PostgreSQL)

## Overview
The application uses Supabase PostgreSQL as the backend database with Row Level Security (RLS), real-time subscriptions, and Edge Functions. Based on the Flutter codebase analysis and new requirements, the following tables and structures are required:

## Supabase Schema Organization

```sql
-- Schema structure
CREATE SCHEMA IF NOT EXISTS public;  -- Main application tables
CREATE SCHEMA IF NOT EXISTS audit;   -- Audit trail tables
CREATE SCHEMA IF NOT EXISTS storage; -- Managed by Supabase Storage

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes
```

## Core Tables

### 1. Tracking (Main Barrel Table)
Primary table for barrel inventory tracking.

**Fields:**
- `barrel_id` (String, Primary Key) - Unique barrel identifier (supports QR codes)
- `date_filled` (String) - Date barrel was filled
- `batch` (String) - Fill batch number
- `volume` (String) - Volume in liters
- `abv` (String) - Alcohol by volume percentage
- `spirit` (String) - Type of spirit (references Spirit table)
- `barrel` (String) - Type of barrel (references Barrel table)
- `prev_spirit` (String) - Previous spirit in barrel (references PrevSpirit table)
- `date_mature` (String) - Estimated maturation date
- `tasting_notes` (Text) - Tasting notes
- `notes_comments` (Text) - Additional notes/comments
- `location` (String) - Current barrel location (references Location table)
- `angelsshare` (String) - Angel's share loss percentage
- `last_inspection` (String) - Date of last inspection
- `status` (String) - Current status (references Status table)

### 2. Spirit
Reference table for spirit types.

**Fields:**
- `id` (Auto-increment, Primary Key)
- `type` (String, Unique) - Spirit type name

### 3. PrevSpirit
Reference table for previous spirit types in barrels.

**Fields:**
- `id` (Auto-increment, Primary Key)
- `type` (String, Unique) - Previous spirit type name

### 4. Barrel
Reference table for barrel types.

**Fields:**
- `id` (Auto-increment, Primary Key)
- `type` (String, Unique) - Barrel type description

### 5. BarrelSize
Reference table for barrel sizes.

**Fields:**
- `id` (Auto-increment, Primary Key)
- `size` (String, Unique) - Barrel size description

### 6. Location
Reference table for barrel storage locations.

**Fields:**
- `id` (Auto-increment, Primary Key)
- `location` (String, Unique) - Location description

### 7. Status
Reference table for barrel status options.

**Fields:**
- `id` (Auto-increment, Primary Key)
- `status` (String, Unique) - Status description

### 8. Distillation
Table for tracking distillation batches.

**Fields:**
- `id` (Auto-increment, Primary Key)
- `date_filled` (Date) - Date of distillation
- `batch` (String) - Batch number
- `substrate1_name` (String)
- `substrate1_batch` (String)
- `substrate1_vol` (String)
- `substrate2_name` (String)
- `substrate2_batch` (String)
- `substrate2_vol` (String)
- `substrate3_name` (String)
- `substrate3_batch` (String)
- `substrate3_vol` (String)
- `substrate4_name` (String)
- `substrate4_batch` (String)
- `substrate4_vol` (String)
- `water_vol` (String)
- `dunder_batch` (String)
- `dunder_vol` (String)
- `temp_set` (String)
- `yeast_type` (String)
- `yeast_rehyd_temp` (String)
- `chems_added` (String)
- `yeast_added` (String)
- `notes` (Text)

### 9. Fermentation
Table for tracking fermentation processes.

**Fields:**
- `id` (Auto-increment, Primary Key)
- `date_filled` (Date) - Date fermentation started
- `batch` (String) - Batch number
- `substrate1_name` (String)
- `substrate1_batch` (String)
- `substrate1_vol` (String)
- `substrate2_name` (String)
- `substrate2_batch` (String)
- `substrate2_vol` (String)
- `substrate3_name` (String)
- `substrate3_batch` (String)
- `substrate3_vol` (String)
- `substrate4_name` (String)
- `substrate4_batch` (String)
- `substrate4_vol` (String)
- `water_vol` (String)
- `dunder_batch` (String)
- `dunder_vol` (String)
- `dunder_ph` (String)
- `temp_set` (String)
- `yeast_type` (String)
- `yeast_added` (String)
- `yeast_rehyd_temp` (String)
- `yeast_rehyd_time` (String)
- `chems_added` (String)
- `nutrients_added` (String)
- `init_temp` (String) - Initial temperature
- `init_brix` (String) - Initial Brix
- `init_ph` (String) - Initial pH
- `init_sg` (String) - Initial specific gravity
- `temp_24` (String) - 24-hour temperature
- `brix_24` (String) - 24-hour Brix
- `ph_24` (String) - 24-hour pH
- `sg_24` (String) - 24-hour specific gravity
- `temp_48` (String) - 48-hour temperature
- `brix_48` (String) - 48-hour Brix
- `ph_48` (String) - 48-hour pH
- `sg_48` (String) - 48-hour specific gravity
- `temp_72` (String) - 72-hour temperature
- `brix_72` (String) - 72-hour Brix
- `ph_72` (String) - 72-hour pH
- `sg_72` (String) - 72-hour specific gravity
- `temp_96` (String) - 96-hour temperature
- `brix_96` (String) - 96-hour Brix
- `ph_96` (String) - 96-hour pH
- `sg_96` (String) - 96-hour specific gravity
- `temp_120` (String) - 120-hour temperature
- `brix_120` (String) - 120-hour Brix
- `ph_120` (String) - 120-hour pH
- `sg_120` (String) - 120-hour specific gravity
- `temp_final` (String) - Final temperature
- `brix_final` (String) - Final Brix
- `ph_final` (String) - Final pH
- `sg_final` (String) - Final specific gravity
- `alcohol_content` (String) - Final alcohol content
- `notes` (Text)

### 10. Users (Supabase Auth Integration)
Extends Supabase Auth with profile information.

```sql
-- Profile table extends auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  role TEXT DEFAULT 'operator',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spirit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distillation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fermentation ENABLE ROW LEVEL SECURITY;

-- Organization-based isolation
CREATE POLICY "org_isolation" ON public.tracking
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- User-based access
CREATE POLICY "user_barrels" ON public.tracking
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "user_can_insert" ON public.tracking
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'operator')
  );

-- Admin-only operations
CREATE POLICY "admin_delete" ON public.tracking
  FOR DELETE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
```

## Database Indexes & Performance

```sql
-- Performance indexes
CREATE INDEX idx_tracking_status ON public.tracking(status);
CREATE INDEX idx_tracking_spirit ON public.tracking(spirit);
CREATE INDEX idx_tracking_location ON public.tracking(location);
CREATE INDEX idx_tracking_date_filled ON public.tracking(date_filled DESC);
CREATE INDEX idx_tracking_batch ON public.tracking(batch);

-- Composite indexes for common queries
CREATE INDEX idx_tracking_status_location ON public.tracking(status, location);
CREATE INDEX idx_fermentation_batch_date ON public.fermentation(batch, date_filled);

-- Full-text search
CREATE INDEX idx_tracking_search ON public.tracking USING gin(
  to_tsvector('english', barrel_id || ' ' || batch || ' ' || notes_comments)
);

-- JSONB indexes for flexible fields
CREATE INDEX idx_tracking_metadata ON public.tracking USING gin(metadata);
```

## Data Relationships & Migrations

### Foreign Key Relationships
```sql
-- Barrel to reference tables
ALTER TABLE public.tracking
  ADD CONSTRAINT fk_tracking_spirit FOREIGN KEY (spirit) REFERENCES public.spirit(type),
  ADD CONSTRAINT fk_tracking_barrel FOREIGN KEY (barrel) REFERENCES public.barrel(type),
  ADD CONSTRAINT fk_tracking_location FOREIGN KEY (location) REFERENCES public.location(location),
  ADD CONSTRAINT fk_tracking_status FOREIGN KEY (status) REFERENCES public.status(status);
```

### Supabase Migrations
```bash
# Create migration files
supabase migration new create_tracking_tables
supabase migration new create_reference_tables
supabase migration new create_rls_policies
supabase migration new create_audit_triggers

# Apply migrations
supabase db push
```

### Real-time Subscriptions
```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fermentation;
ALTER PUBLICATION supabase_realtime ADD TABLE public.distillation;
```

### Audit Trail Triggers
```sql
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit.logs (
    table_name,
    operation,
    user_id,
    organization_id,
    old_data,
    new_data,
    ip_address,
    user_agent
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    (SELECT organization_id FROM public.profiles WHERE id = auth.uid()),
    row_to_json(OLD),
    row_to_json(NEW),
    current_setting('request.headers')::json->>'x-real-ip',
    current_setting('request.headers')::json->>'user-agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to all tables
CREATE TRIGGER audit_tracking AFTER INSERT OR UPDATE OR DELETE ON public.tracking
  FOR EACH ROW EXECUTE FUNCTION audit.log_changes();
```