import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addToWaitlist } from '../../lib/supabase';
import './ComingSoon.css';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addToWaitlist(email, 'mens-health');

      if (result.success) {
        toast.success('You\'ll be the first to know when we launch!');
        setEmail('');
      } else {
        toast.info(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      toast.error('Unable to join waitlist. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-container">
        <Link to="/" className="back-link">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Women's Health
        </Link>

        <motion.div
          className="coming-soon-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="coming-soon-badge">Coming Soon</div>

          <h1>Men's Health is <span className="gradient-text">On The Way</span></h1>

          <p className="coming-soon-subtitle">
            We're building comprehensive health guidance specifically for men's unique health needs.
          </p>

          <div className="features-preview">
            <h3>What's Coming:</h3>
            <div className="feature-list">
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 10L9 13L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Prostate health guidance</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 10L9 13L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Testosterone and hormone insights</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 10L9 13L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Men's mental health support</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 10L9 13L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Fertility and sexual health</span>
              </div>
            </div>
          </div>

          <div className="notify-section">
            <h3>Be the First to Know</h3>
            <form className="notify-form" onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className="email-input"
              />
              <button type="submit" disabled={isSubmitting} className="notify-button">
                {isSubmitting ? 'Joining...' : 'Notify Me'}
              </button>
            </form>
          </div>

          <div className="meanwhile-section">
            <p>Meanwhile, explore our women's health platform:</p>
            <Link to="/xx" className="explore-link">
              Visit Women's Health
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L12 6M16 10L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;