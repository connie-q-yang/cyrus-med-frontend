import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-toastify';
import { addToWaitlist, getWaitlistCount } from '../../lib/supabase';
import './Waitlist.css';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [betaSpotsLeft, setBetaSpotsLeft] = useState(500);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    // Fetch actual waitlist count on mount
    const fetchCount = async () => {
      const count = await getWaitlistCount();
      if (count > 0) {
        // Calculate remaining beta spots (500 total spots)
        const spotsLeft = Math.max(0, 500 - count);
        setBetaSpotsLeft(spotsLeft);
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addToWaitlist(email);

      if (result.success) {
        // Send welcome email via Netlify Function
        fetch('/.netlify/functions/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })
        .then(res => res.json())
        .then(data => {
          console.log('Email sent:', data);
        })
        .catch(err => {
          console.error('Email error:', err);
          // Don't show error to user as the signup was successful
        });

        toast.success(result.message || 'Welcome to Cyrus Med! Check your email for next steps.');
        setEmail('');
        // Update remaining spots
        setBetaSpotsLeft(prev => Math.max(0, prev - 1));
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

  const scrollToChat = () => {
    document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="waitlist" id="waitlist" ref={ref}>
      <motion.div
        className="waitlist-container"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="waitlist-card"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="exclusive-badge">
            <span className="badge-text">LIMITED BETA ACCESS</span>
          </div>

          <h2>Reserve Your Spot</h2>
          <p className="waitlist-subtitle">
            Join the exclusive beta program for AI-powered healthcare.
          </p>

          <div className="waitlist-benefits">
            <div className="benefit">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>$50 in free consultation credits</span>
            </div>
            <div className="benefit">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Priority access to all features</span>
            </div>
            <div className="benefit">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Help shape product development</span>
            </div>
          </div>

          <form className="waitlist-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for instant access"
                required
                disabled={isSubmitting}
                className="email-input"
              />
              <button type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? 'Processing...' : 'Get Early Access'}
              </button>
            </div>
          </form>

          <div className="spots-remaining">
            <span className="spots-number">{betaSpotsLeft}</span>
            <span className="spots-label">spots remaining</span>
          </div>

          <p className="privacy-note">
            No credit card required. HIPAA compliant. Unsubscribe anytime.
          </p>
        </motion.div>

        <motion.div
          className="cta-alternative"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>Want to try it now?</p>
          <button className="demo-link" onClick={scrollToChat}>
            Experience the demo
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Waitlist;