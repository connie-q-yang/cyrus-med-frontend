-- Create waitlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for all users" ON waitlist;
DROP POLICY IF EXISTS "Enable read for all users" ON waitlist;

-- Create policy to allow anyone to insert into waitlist
CREATE POLICY "Enable insert for all users" ON waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create policy to allow anyone to read from waitlist (for counting)
CREATE POLICY "Enable read for all users" ON waitlist
FOR SELECT
TO anon, authenticated
USING (true);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Grant permissions
GRANT ALL ON waitlist TO anon;
GRANT ALL ON waitlist TO authenticated;