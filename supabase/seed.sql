-- Seed data for development and testing

-- Insert test organization
INSERT INTO public.organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Test Distillery')
ON CONFLICT DO NOTHING;

-- Insert test reference data for spirits
INSERT INTO public.spirit (type, organization_id) VALUES
  ('Gin', '00000000-0000-0000-0000-000000000000'),
  ('Vodka', '00000000-0000-0000-0000-000000000000'),
  ('Whiskey', '00000000-0000-0000-0000-000000000000'),
  ('Rum', '00000000-0000-0000-0000-000000000000'),
  ('Brandy', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Insert previous spirit types
INSERT INTO public.prev_spirit (type, organization_id) VALUES
  ('Ex-Bourbon', '00000000-0000-0000-0000-000000000000'),
  ('Ex-Sherry', '00000000-0000-0000-0000-000000000000'),
  ('Ex-Port', '00000000-0000-0000-0000-000000000000'),
  ('Virgin', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Insert barrel types
INSERT INTO public.barrel (type, organization_id) VALUES
  ('Ex-Bourbon', '00000000-0000-0000-0000-000000000000'),
  ('Virgin Oak', '00000000-0000-0000-0000-000000000000'),
  ('Ex-Sherry', '00000000-0000-0000-0000-000000000000'),
  ('Ex-Port', '00000000-0000-0000-0000-000000000000'),
  ('Stainless Steel', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Insert barrel sizes
INSERT INTO public.barrel_size (size, liters, organization_id) VALUES
  ('200L', 200, '00000000-0000-0000-0000-000000000000'),
  ('225L', 225, '00000000-0000-0000-0000-000000000000'),
  ('300L', 300, '00000000-0000-0000-0000-000000000000'),
  ('500L', 500, '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Insert locations
INSERT INTO public.location (location, capacity, organization_id) VALUES
  ('Warehouse A', 100, '00000000-0000-0000-0000-000000000000'),
  ('Warehouse B', 150, '00000000-0000-0000-0000-000000000000'),
  ('Production Floor', 50, '00000000-0000-0000-0000-000000000000'),
  ('Aging Cellar', 200, '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Insert status options
INSERT INTO public.status (status, color, organization_id) VALUES
  ('Aging', '#22c55e', '00000000-0000-0000-0000-000000000000'),
  ('Ready', '#3b82f6', '00000000-0000-0000-0000-000000000000'),
  ('Emptied', '#6b7280', '00000000-0000-0000-0000-000000000000'),
  ('Maintenance', '#f59e0b', '00000000-0000-0000-0000-000000000000'),
  ('Testing', '#a855f7', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;