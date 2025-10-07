-- Fix RLS policies to work with anon key properly
-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts to waitlist" ON waitlist;
DROP POLICY IF EXISTS "Allow reading waitlist count" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for all users" ON waitlist;
DROP POLICY IF EXISTS "Enable read for all users" ON waitlist;

-- Create new policies that work with both anon and authenticated
CREATE POLICY "Enable insert for anon and authenticated" ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Enable select for anon and authenticated" ON waitlist
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Specifically grant on waitlist table
GRANT ALL ON waitlist TO anon, authenticated;

-- Ensure the anon role can execute functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;