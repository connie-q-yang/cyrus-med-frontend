-- Create symptom_logs table
-- Run this in your Supabase SQL Editor to enable symptom logging

CREATE TABLE IF NOT EXISTS symptom_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  symptoms TEXT[] NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_date ON symptom_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date ON symptom_logs(user_id, log_date);

-- Enable Row Level Security
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own symptom logs
CREATE POLICY "Users can view own symptom logs"
ON symptom_logs FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Users can insert their own symptom logs
CREATE POLICY "Users can insert own symptom logs"
ON symptom_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own symptom logs
CREATE POLICY "Users can update own symptom logs"
ON symptom_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy: Users can delete their own symptom logs
CREATE POLICY "Users can delete own symptom logs"
ON symptom_logs FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_symptom_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_symptom_logs_timestamp
BEFORE UPDATE ON symptom_logs
FOR EACH ROW
EXECUTE FUNCTION update_symptom_logs_updated_at();
