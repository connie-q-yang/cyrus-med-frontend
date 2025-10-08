-- Fix production Supabase access
-- This ensures the policies work in production

-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow anonymous inserts to waitlist" ON waitlist;
DROP POLICY IF EXISTS "Allow reading waitlist count" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for anon and authenticated" ON waitlist;
DROP POLICY IF EXISTS "Enable select for anon and authenticated" ON waitlist;

-- Create simple, permissive policies for waitlist
CREATE POLICY "Public Insert" ON waitlist
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Select" ON waitlist
  FOR SELECT
  USING (true);

-- Make sure RLS is enabled
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Grant all permissions to anon role
GRANT ALL ON waitlist TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Test that it works
SELECT COUNT(*) FROM waitlist;