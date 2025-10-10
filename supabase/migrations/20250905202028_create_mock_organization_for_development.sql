-- Create mock organization for development mode
-- This allows the app to work with foreign key constraints in development

-- Insert mock organization if it doesn't exist
INSERT INTO public.organizations (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Development Organization',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
