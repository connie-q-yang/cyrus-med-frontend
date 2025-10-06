import { createClient } from '@supabase/supabase-js';

// These will be replaced with your actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to add email to waitlist
export const addToWaitlist = async (email) => {
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