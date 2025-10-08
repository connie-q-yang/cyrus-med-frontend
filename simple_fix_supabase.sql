-- Disable RLS entirely for waitlist table (simplest fix)
ALTER TABLE waitlist DISABLE ROW LEVEL SECURITY;

-- Test it works
SELECT COUNT(*) FROM waitlist;