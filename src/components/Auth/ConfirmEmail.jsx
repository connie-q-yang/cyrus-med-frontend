import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const ConfirmEmail = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Check Your Email</h1>
          <p>We've sent you a confirmation link</p>
        </div>

        <div className="confirm-content">
          <div className="confirm-icon">
            📧
          </div>
          <p className="confirm-text">
            Please check your email and click the confirmation link to activate your account.
            If you don't see the email, check your spam folder.
          </p>

          <div className="confirm-info">
            <p>
              Once you've confirmed your email, you can sign in to access your dashboard.
            </p>
          </div>

          <Link to="/login" className="auth-button" style={{ textDecoration: 'none' }}>
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
