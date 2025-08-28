# Supabase Setup & Configuration Guide

## Overview
Complete guide for setting up Supabase for the Distillery Management System with all required configurations, migrations, and security policies.

## 🚀 Quick Start

### 1. Create Supabase Project
```bash
# Visit https://supabase.com and create a new project
# Note your project URL and keys:
# - Project URL: https://[PROJECT_REF].supabase.co
# - Anon Key: (public key for client-side)
# - Service Role Key: (private key for server-side)
```

### 2. Install Supabase CLI
```bash
# Install Supabase CLI
pnpm install -g supabase

# Or use npx (no installation required)
npx supabase --version
```

### 3. Initialize Local Development
```bash
# In your project directory
npx supabase init

# Link to your remote project
npx supabase link --project-ref [PROJECT_REF]

# Start local Supabase
npx supabase start

# Local URLs:
# - API URL: http://localhost:54321
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
```

## 📁 Project Structure

### Create Supabase Directory Structure
```bash
supabase/
├── migrations/           # Database migrations
├── functions/           # Edge Functions
├── seed.sql            # Seed data
└── config.toml         # Configuration
```

## 🗄️ Database Setup

### Migration 1: Core Tables
Create `supabase/migrations/001_core_tables.sql`:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Organizations table (multi-tenancy)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend auth with profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  display_name TEXT,
  role TEXT DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reference Tables
CREATE TABLE public.spirit (
  id SERIAL PRIMARY KEY,
  type TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.prev_spirit (
  id SERIAL PRIMARY KEY,
  type TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.barrel (
  id SERIAL PRIMARY KEY,
  type TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.barrel_size (
  id SERIAL PRIMARY KEY,
  size TEXT UNIQUE NOT NULL,
  liters DECIMAL,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.location (
  id SERIAL PRIMARY KEY,
  location TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  capacity INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.status (
  id SERIAL PRIMARY KEY,
  status TEXT UNIQUE NOT NULL,
  color TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migration 2: Barrel Tracking
Create `supabase/migrations/002_barrel_tracking.sql`:

```sql
-- Main barrel tracking table
CREATE TABLE public.tracking (
  barrel_id TEXT PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  date_filled DATE,
  batch TEXT,
  volume TEXT,
  abv TEXT,
  spirit TEXT REFERENCES public.spirit(type),
  barrel TEXT REFERENCES public.barrel(type),
  prev_spirit TEXT REFERENCES public.prev_spirit(type),
  date_mature DATE,
  tasting_notes TEXT,
  notes_comments TEXT,
  location TEXT REFERENCES public.location(location),
  angelsshare TEXT,
  last_inspection DATE,
  status TEXT REFERENCES public.status(status),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tracking_org ON public.tracking(organization_id);
CREATE INDEX idx_tracking_status ON public.tracking(status);
CREATE INDEX idx_tracking_location ON public.tracking(location);
CREATE INDEX idx_tracking_batch ON public.tracking(batch);
CREATE INDEX idx_tracking_date_filled ON public.tracking(date_filled DESC);
```

### Migration 3: Production Tables
Create `supabase/migrations/003_production_tables.sql`:

```sql
-- Distillation table
CREATE TABLE public.distillation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  date_filled DATE,
  batch TEXT,
  substrate1_name TEXT,
  substrate1_batch TEXT,
  substrate1_vol TEXT,
  substrate2_name TEXT,
  substrate2_batch TEXT,
  substrate2_vol TEXT,
  substrate3_name TEXT,
  substrate3_batch TEXT,
  substrate3_vol TEXT,
  substrate4_name TEXT,
  substrate4_batch TEXT,
  substrate4_vol TEXT,
  water_vol TEXT,
  dunder_batch TEXT,
  dunder_vol TEXT,
  temp_set TEXT,
  yeast_type TEXT,
  yeast_rehyd_temp TEXT,
  chems_added TEXT,
  yeast_added TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fermentation table
CREATE TABLE public.fermentation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  date_filled DATE,
  batch TEXT,
  -- Substrates
  substrate1_name TEXT,
  substrate1_batch TEXT,
  substrate1_vol TEXT,
  substrate2_name TEXT,
  substrate2_batch TEXT,
  substrate2_vol TEXT,
  substrate3_name TEXT,
  substrate3_batch TEXT,
  substrate3_vol TEXT,
  substrate4_name TEXT,
  substrate4_batch TEXT,
  substrate4_vol TEXT,
  -- Process parameters
  water_vol TEXT,
  dunder_batch TEXT,
  dunder_vol TEXT,
  dunder_ph TEXT,
  temp_set TEXT,
  yeast_type TEXT,
  yeast_added TEXT,
  yeast_rehyd_temp TEXT,
  yeast_rehyd_time TEXT,
  chems_added TEXT,
  nutrients_added TEXT,
  -- Time-series measurements
  init_temp TEXT,
  init_brix TEXT,
  init_ph TEXT,
  init_sg TEXT,
  temp_24 TEXT,
  brix_24 TEXT,
  ph_24 TEXT,
  sg_24 TEXT,
  temp_48 TEXT,
  brix_48 TEXT,
  ph_48 TEXT,
  sg_48 TEXT,
  temp_72 TEXT,
  brix_72 TEXT,
  ph_72 TEXT,
  sg_72 TEXT,
  temp_96 TEXT,
  brix_96 TEXT,
  ph_96 TEXT,
  sg_96 TEXT,
  temp_120 TEXT,
  brix_120 TEXT,
  ph_120 TEXT,
  sg_120 TEXT,
  temp_final TEXT,
  brix_final TEXT,
  ph_final TEXT,
  sg_final TEXT,
  alcohol_content TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_distillation_org ON public.distillation(organization_id);
CREATE INDEX idx_distillation_batch ON public.distillation(batch);
CREATE INDEX idx_fermentation_org ON public.fermentation(organization_id);
CREATE INDEX idx_fermentation_batch ON public.fermentation(batch);
```

### Migration 4: Audit System
Create `supabase/migrations/004_audit_system.sql`:

```sql
-- Audit schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Audit log table
CREATE TABLE audit.logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  organization_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit function
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit.logs (
    table_name,
    operation,
    user_id,
    organization_id,
    old_data,
    new_data
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    COALESCE(NEW.organization_id, OLD.organization_id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER audit_tracking 
  AFTER INSERT OR UPDATE OR DELETE ON public.tracking
  FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

CREATE TRIGGER audit_distillation 
  AFTER INSERT OR UPDATE OR DELETE ON public.distillation
  FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

CREATE TRIGGER audit_fermentation 
  AFTER INSERT OR UPDATE OR DELETE ON public.fermentation
  FOR EACH ROW EXECUTE FUNCTION audit.log_changes();
```

### Migration 5: Row Level Security
Create `supabase/migrations/005_row_level_security.sql`:

```sql
-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spirit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prev_spirit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barrel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barrel_size ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distillation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fermentation ENABLE ROW LEVEL SECURITY;

-- Organization isolation policy
CREATE POLICY "org_isolation" ON public.tracking
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- User can read own profile
CREATE POLICY "users_view_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- User can update own profile
CREATE POLICY "users_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Authenticated users can view reference data
CREATE POLICY "view_reference_data" ON public.spirit
  FOR SELECT USING (auth.role() = 'authenticated');

-- Managers can modify reference data
CREATE POLICY "managers_modify_reference" ON public.spirit
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Apply similar policies to all tables
-- ... (repeat for each table)
```

## 🔐 Authentication Setup

### Configure Auth Providers
```typescript
// In Supabase Dashboard > Authentication > Providers
// Enable:
// - Email/Password (required)
// - Magic Link (optional)
// - Google OAuth (optional)
// - Microsoft Azure AD (for enterprise)
```

### Create Auth Helpers
```typescript
// lib/supabase/auth.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const createClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
};

// Profile creation trigger
export const setupAuthTriggers = async (supabase: any) => {
  const { error } = await supabase.rpc('setup_auth_triggers');
  if (error) console.error('Error setting up triggers:', error);
};
```

## 📦 Storage Buckets

### Create Storage Buckets
```sql
-- Via Supabase Dashboard or SQL
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('invoices', 'invoices', false),
  ('certificates', 'certificates', false),
  ('test-photos', 'test-photos', false),
  ('documents', 'documents', false);

-- Set up policies for each bucket
CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoices' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view own org invoices"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices' AND
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE organization_id = (storage.foldername(name)::uuid)
  )
);
```

## 🔄 Real-time Configuration

### Enable Real-time
```sql
-- Enable real-time on specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fermentation;
ALTER PUBLICATION supabase_realtime ADD TABLE public.distillation;

-- Client-side subscription
const subscription = supabase
  .channel('tracking_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'tracking' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();
```

## ⚡ Edge Functions

### Create Edge Function
```bash
# Create new function
npx supabase functions new calculate-lal

# Deploy function
npx supabase functions deploy calculate-lal
```

### Example Edge Function
```typescript
// supabase/functions/calculate-lal/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { volume, abv } = await req.json();
  
  const lal = volume * (abv / 100);
  
  return new Response(
    JSON.stringify({ lal }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

## 🔧 Environment Variables

### Create .env.local
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Distillery Management System

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## 🧪 Testing Setup

### Local Testing
```bash
# Reset database
npx supabase db reset

# Run migrations
npx supabase db push

# Seed data
npx supabase db seed

# Run tests
pnpm test
```

### Seed Data
Create `supabase/seed.sql`:
```sql
-- Insert test organization
INSERT INTO public.organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Test Distillery');

-- Insert test reference data
INSERT INTO public.spirit (type, organization_id) VALUES
  ('Gin', '00000000-0000-0000-0000-000000000000'),
  ('Vodka', '00000000-0000-0000-0000-000000000000'),
  ('Whiskey', '00000000-0000-0000-0000-000000000000');

INSERT INTO public.barrel (type, organization_id) VALUES
  ('Ex-Bourbon', '00000000-0000-0000-0000-000000000000'),
  ('Virgin Oak', '00000000-0000-0000-0000-000000000000'),
  ('Ex-Sherry', '00000000-0000-0000-0000-000000000000');

INSERT INTO public.location (location, organization_id) VALUES
  ('Warehouse A', '00000000-0000-0000-0000-000000000000'),
  ('Warehouse B', '00000000-0000-0000-0000-000000000000'),
  ('Production Floor', '00000000-0000-0000-0000-000000000000');

INSERT INTO public.status (status, color, organization_id) VALUES
  ('Aging', 'green', '00000000-0000-0000-0000-000000000000'),
  ('Ready', 'blue', '00000000-0000-0000-0000-000000000000'),
  ('Emptied', 'gray', '00000000-0000-0000-0000-000000000000');
```

## 📊 Type Generation

### Generate TypeScript Types
```bash
# Generate types from database
npx supabase gen types typescript --local > types/supabase.ts

# Use in your code
import { Database } from '@/types/supabase';

type Barrel = Database['public']['Tables']['tracking']['Row'];
type InsertBarrel = Database['public']['Tables']['tracking']['Insert'];
type UpdateBarrel = Database['public']['Tables']['tracking']['Update'];
```

## 🚀 Deployment

### Deploy to Production
```bash
# Push database changes
npx supabase db push

# Deploy edge functions
npx supabase functions deploy

# Link to production
npx supabase link --project-ref [PRODUCTION_PROJECT_REF]

# Apply migrations to production
npx supabase db push --linked
```

## 📈 Monitoring

### Enable Monitoring
- Database metrics in Supabase Dashboard
- Query performance analyzer
- Real-time connection monitoring
- Storage usage tracking
- Auth event logs

## ✅ Setup Checklist

- [ ] Created Supabase project
- [ ] Installed Supabase CLI
- [ ] Initialized local development
- [ ] Created database migrations
- [ ] Enabled RLS policies
- [ ] Set up authentication
- [ ] Created storage buckets
- [ ] Configured real-time
- [ ] Set up environment variables
- [ ] Generated TypeScript types
- [ ] Added seed data
- [ ] Tested locally
- [ ] Ready for development!

## 🆘 Troubleshooting

### Common Issues

1. **RLS blocking queries**
   - Check auth token is valid
   - Verify RLS policies
   - Use service role key for admin operations

2. **Real-time not working**
   - Ensure table is added to publication
   - Check WebSocket connection
   - Verify RLS allows SELECT

3. **Type generation fails**
   - Ensure database is running
   - Check migrations are applied
   - Verify schema access

4. **Auth issues**
   - Check redirect URLs
   - Verify email templates
   - Test with local auth