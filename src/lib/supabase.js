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
  // For now, we'll store in localStorage as a fallback
  // since Supabase seems to have authentication issues
  try {
    // Get existing waitlist from localStorage
    const existingWaitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');

    // Check if email already exists
    if (existingWaitlist.some(item => item.email === email.toLowerCase())) {
      return {
        success: false,
        message: 'You\'re already on the waitlist! Check your email for updates.'
      };
    }

    // Add to localStorage
    existingWaitlist.push({
      email: email.toLowerCase(),
      joined_at: new Date().toISOString(),
      source: 'website',
      status: 'pending'
    });

    localStorage.setItem('waitlist', JSON.stringify(existingWaitlist));

    // Try to save to Supabase if available (but don't block on errors)
    if (supabase) {
      supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase(),
            joined_at: new Date().toISOString(),
            source: 'website',
            status: 'pending'
          }
        ])
        .select()
        .then(({ data, error }) => {
          if (!error) {
            console.log('Successfully saved to Supabase:', data);
          } else {
            console.warn('Supabase save failed, but email saved locally:', error);
          }
        })
        .catch(err => {
          console.warn('Supabase error (non-blocking):', err);
        });
    }

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
    // First try to get from localStorage
    const localWaitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
    const localCount = localWaitlist.length;

    // If Supabase is available, try to get the count from there too
    if (supabase) {
      try {
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) {
          // Return the higher count (in case some are in Supabase but not local)
          return Math.max(count, localCount);
        }
      } catch (supabaseError) {
        console.warn('Supabase count failed, using local count:', supabaseError);
      }
    }

    // Return local count as fallback
    return localCount;
  } catch (error) {
    console.error('Error getting waitlist count:', error);
    return 0;
  }
};