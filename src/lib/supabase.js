import { createClient } from '@supabase/supabase-js';

// These will be replaced with your actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rsgvhilaapbyhvzfmldu.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZ3ZoaWxhYXBieWh2emZtbGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjQxOTksImV4cCI6MjA3NTEwMDE5OX0.8Q3mimHi0mNqrwfJ1Wys4Jy71YUCvF-2dS6U4lKxKvI';

// Create Supabase client only if credentials are available
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase initialized with URL:', supabaseUrl);
} else {
  console.error('Supabase credentials missing!');
}

export { supabase };

// Function to add email to waitlist
export const addToWaitlist = async (email) => {
  try {
    // First check localStorage to prevent duplicates
    const existingWaitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
    if (existingWaitlist.some(item => item.email === email.toLowerCase())) {
      return {
        success: false,
        message: 'You\'re already on the waitlist! Check your email for updates.'
      };
    }

    // Try to save to Supabase first
    if (supabase) {
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
          // Check if email already exists in database
          if (error.code === '23505') {
            return {
              success: false,
              message: 'You\'re already on the waitlist! Check your email for updates.'
            };
          }
          // If other Supabase error, fall back to localStorage
          console.warn('Supabase error, falling back to localStorage:', error);
          throw error;
        }

        // Success - also save to localStorage for offline access
        existingWaitlist.push({
          email: email.toLowerCase(),
          joined_at: new Date().toISOString(),
          source: 'website',
          status: 'pending'
        });
        localStorage.setItem('waitlist', JSON.stringify(existingWaitlist));

        return {
          success: true,
          message: 'Welcome to OpenHealth! Check your email for next steps.',
          data
        };
      } catch (supabaseError) {
        // Fallback to localStorage if Supabase fails
        console.log('Using localStorage fallback');
      }
    }

    // Fallback: Save to localStorage only
    existingWaitlist.push({
      email: email.toLowerCase(),
      joined_at: new Date().toISOString(),
      source: 'website',
      status: 'pending'
    });
    localStorage.setItem('waitlist', JSON.stringify(existingWaitlist));

    return {
      success: true,
      message: 'Welcome to OpenHealth! Check your email for next steps.',
      data: { email }
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
    // Get local count first
    const localWaitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
    const localCount = localWaitlist.length;

    // Try to get count from Supabase
    if (supabase) {
      try {
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) {
          // Return the database count if successful
          return count;
        }
      } catch (supabaseError) {
        console.log('Using localStorage count as fallback');
      }
    }

    // Fallback to local count
    return localCount;
  } catch (error) {
    console.error('Error getting waitlist count:', error);
    return 0;
  }
};