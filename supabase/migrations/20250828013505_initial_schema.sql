-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Organizations table (multi-tenancy support)
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

-- Reference Tables for Spirit Types
CREATE TABLE public.spirit (
  id SERIAL PRIMARY KEY,
  type TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Previous Spirit Types
CREATE TABLE public.prev_spirit (
  id SERIAL PRIMARY KEY,
  type TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barrel Types
CREATE TABLE public.barrel (
  id SERIAL PRIMARY KEY,
  type TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barrel Sizes
CREATE TABLE public.barrel_size (
  id SERIAL PRIMARY KEY,
  size TEXT UNIQUE NOT NULL,
  liters DECIMAL,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Locations
CREATE TABLE public.location (
  id SERIAL PRIMARY KEY,
  location TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  capacity INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barrel Status Options
CREATE TABLE public.status (
  id SERIAL PRIMARY KEY,
  status TEXT UNIQUE NOT NULL,
  color TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main barrel tracking table
CREATE TABLE public.tracking (
  barrel_id TEXT PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  date_filled DATE,
  batch TEXT,
  volume TEXT,
  abv TEXT,
  spirit TEXT,
  barrel TEXT,
  prev_spirit TEXT,
  date_mature DATE,
  tasting_notes TEXT,
  notes_comments TEXT,
  location TEXT,
  angelsshare TEXT,
  last_inspection DATE,
  status TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Distillation tracking
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

-- Fermentation tracking with time-series data
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

-- Create indexes for performance
CREATE INDEX idx_tracking_org ON public.tracking(organization_id);
CREATE INDEX idx_tracking_status ON public.tracking(status);
CREATE INDEX idx_tracking_location ON public.tracking(location);
CREATE INDEX idx_tracking_batch ON public.tracking(batch);
CREATE INDEX idx_tracking_date_filled ON public.tracking(date_filled DESC);

CREATE INDEX idx_distillation_org ON public.distillation(organization_id);
CREATE INDEX idx_distillation_batch ON public.distillation(batch);

CREATE INDEX idx_fermentation_org ON public.fermentation(organization_id);
CREATE INDEX idx_fermentation_batch ON public.fermentation(batch);

-- Enable Row Level Security
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

-- Create trigger to auto-create profile on user signup
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_tracking_updated_at BEFORE UPDATE ON public.tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_distillation_updated_at BEFORE UPDATE ON public.distillation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_fermentation_updated_at BEFORE UPDATE ON public.fermentation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();