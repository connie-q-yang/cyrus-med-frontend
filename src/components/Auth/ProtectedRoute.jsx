import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ProtectedRoute = ({ children, requiresOnboarding = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        console.log('ProtectedRoute: No user found');
        setCheckingOnboarding(false);
        return;
      }

      console.log('ProtectedRoute: Checking onboarding for user:', user.id);

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        console.log('ProtectedRoute: Onboarding check result:', { data, error });

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('ProtectedRoute: Error checking onboarding status:', error);
        }

        const isComplete = data?.onboarding_completed || false;
        console.log('ProtectedRoute: Onboarding complete?', isComplete);
        setOnboardingComplete(isComplete);
      } catch (error) {
        console.error('ProtectedRoute: Error checking onboarding:', error);
        setOnboardingComplete(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (requiresOnboarding && user) {
      console.log('ProtectedRoute: requiresOnboarding is true, checking status');
      checkOnboardingStatus();
    } else {
      console.log('ProtectedRoute: requiresOnboarding is false, skipping check');
      setCheckingOnboarding(false);
    }
  }, [user, requiresOnboarding]);

  if (loading || (requiresOnboarding && checkingOnboarding)) {
    console.log('ProtectedRoute: Still loading...', { loading, checkingOnboarding });
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1f1435 0%, #0f0c29 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If onboarding is required and explicitly not completed, redirect to onboarding
  // Only redirect if we've confirmed it's false (not null/undefined)
  if (requiresOnboarding && onboardingComplete === false) {
    console.log('ProtectedRoute: Onboarding not complete, redirecting to /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  console.log('ProtectedRoute: Access granted, rendering children');
  return children;
};

export default ProtectedRoute;
