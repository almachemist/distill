-- Drop ALL existing policies for organizations to start fresh
DROP POLICY IF EXISTS "Organizations can be created by authenticated users" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations during signup" ON organizations;

-- Drop ALL existing policies for profiles to start fresh  
DROP POLICY IF EXISTS "Users can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- ORGANIZATIONS POLICIES

-- Allow authenticated users to create organizations during signup
CREATE POLICY "Users can create organizations during signup"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to view their own organization
CREATE POLICY "Users can view their organization"
ON organizations FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Allow authenticated users to update their own organization
CREATE POLICY "Users can update their organization"
ON organizations FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- PROFILES POLICIES

-- Allow users to create their own profile during signup
CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);