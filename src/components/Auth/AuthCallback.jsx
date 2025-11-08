import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Auth.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Confirming your email...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in React Strict Mode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleEmailConfirmation = async () => {
      try {
        // Parse both hash and search params (Supabase can use either)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(location.search);

        // Get auth params from either source
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        // Check for errors from Supabase
        if (errorCode) {
          throw new Error(errorDescription || 'Authentication error occurred');
        }

        // Check if this is an email confirmation
        if (type === 'signup' || type === 'email_change' || type === 'recovery' || accessToken) {
          // If we have tokens, set the session explicitly
          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError) throw sessionError;

            if (sessionData.session) {
              setStatus('success');

              if (type === 'recovery') {
                setMessage('Email verified! Redirecting to reset your password...');
                setTimeout(() => {
                  navigate('/auth/reset-password');
                }, 2000);
              } else {
                setMessage('Email confirmed successfully! Redirecting to your dashboard...');
                setTimeout(() => {
                  navigate('/dashboard');
                }, 2000);
              }
              return;
            }
          }

          // Fallback: Try to get existing session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) throw error;

          if (session) {
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting to your dashboard...');
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            throw new Error('Could not establish session. Please try logging in.');
          }
        } else {
          // If no confirmation token, might be an error or expired link
          setStatus('error');
          setMessage('Invalid or expired confirmation link. Please try signing up again.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');

        // Provide more helpful error messages
        let errorMessage = error.message;
        if (errorMessage.includes('expired')) {
          errorMessage = 'This confirmation link has expired. Please request a new one.';
        } else if (errorMessage.includes('already')) {
          errorMessage = 'This email has already been confirmed. You can sign in now.';
        } else if (!errorMessage || errorMessage === 'undefined') {
          errorMessage = 'Unable to confirm email. Please try again or contact support.';
        }

        setMessage(errorMessage);
      }
    };

    // Add a small delay to ensure URL params are fully loaded
    const timer = setTimeout(() => {
      handleEmailConfirmation();
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate, location]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            {status === 'processing' && 'Confirming Email'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Confirmation Failed'}
          </h1>
          <p>
            {status === 'processing' && 'Please wait while we verify your email'}
            {status === 'success' && 'Your email has been verified'}
            {status === 'error' && 'We couldn\'t verify your email'}
          </p>
        </div>

        <div className="confirm-content">
          <div className="confirm-icon">
            {status === 'processing' && (
              <div className="loading-spinner" style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(139, 92, 246, 0.2)',
                borderTopColor: '#8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            )}
            {status === 'success' && (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ margin: '0 auto' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            )}
            {status === 'error' && (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
          </div>

          <p className="confirm-text">
            {message}
          </p>

          {status === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '24px' }}>
              {message.includes('already been confirmed') ? (
                <button
                  onClick={() => navigate('/login')}
                  className="auth-button"
                >
                  Go to Login
                </button>
              ) : (
                <button
                  onClick={() => navigate('/signup')}
                  className="auth-button"
                >
                  Back to Sign Up
                </button>
              )}

              <button
                onClick={() => navigate('/login')}
                className="auth-button"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: 'none'
                }}
              >
                Try Logging In Instead
              </button>
            </div>
          )}

          {status === 'success' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="auth-button"
              style={{ marginTop: '24px', width: '100%' }}
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
