-- Drop all existing policies on organizations and profiles to start fresh
DROP POLICY IF EXISTS "Users can create organizations during signup" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;
DROP POLICY IF EXISTS "Only admins can update organization" ON organizations;

DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a service role function to handle signup
CREATE OR REPLACE FUNCTION public.complete_signup(
  user_id UUID,
  org_name TEXT,
  display_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id UUID;
  result JSONB;
BEGIN
  -- Create the organization
  INSERT INTO organizations (name)
  VALUES (org_name)
  RETURNING id INTO org_id;

  -- Create or update the profile
  INSERT INTO profiles (id, organization_id, display_name, role)
  VALUES (user_id, org_id, display_name, 'admin')
  ON CONFLICT (id) DO UPDATE
  SET 
    organization_id = EXCLUDED.organization_id,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

  -- Return the created IDs
  result := jsonb_build_object(
    'organization_id', org_id,
    'user_id', user_id
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_signup(UUID, TEXT, TEXT) TO authenticated;

-- Create more permissive policies for initial setup
-- Allow users to view their own profile after creation
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to view their organization
CREATE POLICY "Users can view their organization"
ON organizations FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Allow users to update their organization
CREATE POLICY "Users can update their organization"
ON organizations FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);