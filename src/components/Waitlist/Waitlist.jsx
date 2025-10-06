import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-toastify';
import { addToWaitlist, getWaitlistCount } from '../../lib/supabase';
import './Waitlist.css';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(15000);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    // Fetch actual waitlist count on mount
    const fetchCount = async () => {
      const count = await getWaitlistCount();
      if (count > 0) {
        setWaitlistCount(15000 + count); // Start with base number + actual signups
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
        // Update count
        setWaitlistCount(prev => prev + 1);
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
            Join the healthcare revolution. Be among the first to experience
            instant, personalized medical guidance powered by AI.
          </p>

          <div className="waitlist-benefits">
            <div className="benefit">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 10L8 16L18 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Priority access to all features</span>
            </div>
            <div className="benefit">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 10L8 16L18 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Free consultation credits</span>
            </div>
            <div className="benefit">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 10L8 16L18 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Shape the future of Cyrus Med</span>
            </div>
          </div>

          <form className="waitlist-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
                className="email-input"
              />
              <button type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? 'Securing Your Spot...' : 'Get Early Access'}
              </button>
            </div>
          </form>

          <div className="waitlist-stats">
            <div className="stat">
              <span className="stat-number">{waitlistCount.toLocaleString()}+</span>
              <span className="stat-label">people waiting</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">500</span>
              <span className="stat-label">beta spots left</span>
            </div>
          </div>

          <p className="privacy-note">
            We respect your privacy. No spam, ever.
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