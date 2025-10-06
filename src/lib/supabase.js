import { createClient } from '@supabase/supabase-js';

// These will be replaced with your actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rsgvhilaapbyhvzfmldu.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZ3ZoaWxhYXBieWh2emZtbGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjQxOTksImV4cCI6MjA3NTEwMDE5OX0.8Q3mimHi0mNqrwfJ1Wys4Jy71YUCvF-2dS6U4lKxKvI';

// Create Supabase client only if credentials are available
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Function to add email to waitlist
export const addToWaitlist = async (email) => {
  if (!supabase) {
    console.warn('Supabase is not configured. Skipping database save.');
    return {
      success: true,
      message: 'Welcome to Cyrus Med! Check your email for next steps.',
      data: null
    };
  }

  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email: email.toLowerCase(),
          joined_at: new Date().toISOString(),
          source: 'website',
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      // Check if email already exists
      if (error.code === '23505') {
        return {
          success: false,
          message: 'You\'re already on the waitlist! Check your email for updates.'
        };
      }
      throw error;
    }

    // Trigger welcome email (this will be handled by Supabase Edge Functions or Database Webhooks)
    // For now, we'll just return success
    return {
      success: true,
      message: 'Welcome to Cyrus Med! Check your email for next steps.',
      data
    };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again.'
    };
  }
};

// Function to get waitlist count (optional - for displaying stats)
export const getWaitlistCount = async () => {
  if (!supabase) {
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting waitlist count:', error);
    return 0;
  }
};