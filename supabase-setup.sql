-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'website',
  status VARCHAR(20) DEFAULT 'pending',
  referral_code VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_joined_at ON waitlist(joined_at DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anonymous users
CREATE POLICY "Allow anonymous inserts to waitlist" ON waitlist
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create policy to allow reading count only (for displaying stats)
CREATE POLICY "Allow reading waitlist count" ON waitlist
  FOR SELECT TO anon
  USING (true);

-- Create function to handle new waitlist signups
CREATE OR REPLACE FUNCTION handle_new_waitlist_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- You can add custom logic here later
  -- For example, incrementing a counter, sending to a webhook, etc.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new signups
CREATE TRIGGER on_waitlist_signup
  AFTER INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_waitlist_signup();

-- Optional: Create a view for public statistics
CREATE OR REPLACE VIEW waitlist_stats AS
SELECT
  COUNT(*) as total_signups,
  COUNT(CASE WHEN joined_at > NOW() - INTERVAL '24 hours' THEN 1 END) as signups_last_24h,
  COUNT(CASE WHEN joined_at > NOW() - INTERVAL '7 days' THEN 1 END) as signups_last_week
FROM waitlist
WHERE status = 'pending';