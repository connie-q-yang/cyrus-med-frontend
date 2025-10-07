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
          {betaSpotsLeft < 100 && (
            <motion.div
              className="urgency-banner"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
            >
              🔥 Only {betaSpotsLeft} spots remaining!
            </motion.div>
          )}

          <div className="exclusive-badge">
            <span className="badge-text">
              {betaSpotsLeft < 50 ? '🚀 FINAL SPOTS AVAILABLE' : '✨ EXCLUSIVE BETA ACCESS'}
            </span>
          </div>

          <h2>Be Among The First {betaSpotsLeft}</h2>
          <p className="waitlist-subtitle">
            Get <span className="highlight-text">$50 in free credits</span> and priority access to your AI health companion.
            <br />Join innovators shaping the future of healthcare.
          </p>

          <div className="value-props">
            <div className="value-item">
              <div className="value-icon">💰</div>
              <div className="value-content">
                <strong>$50 Free Credits</strong>
                <span>Start with complimentary consultations</span>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon">⚡</div>
              <div className="value-content">
                <strong>Skip the Line</strong>
                <span>First access when we launch</span>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon">🎯</div>
              <div className="value-content">
                <strong>Shape the Product</strong>
                <span>Your feedback drives our features</span>
              </div>
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
              <button type="submit" disabled={isSubmitting} className="submit-button pulse-animation">
                {isSubmitting ? 'Securing Your Spot...' : betaSpotsLeft < 50 ? 'Claim Final Spot →' : 'Reserve My Spot →'}
              </button>
            </div>
          </form>

          <div className="spots-indicator">
            <div className="spots-progress">
              <div
                className="spots-progress-bar"
                style={{
                  width: `${((500 - betaSpotsLeft) / 500) * 100}%`,
                  background: betaSpotsLeft < 100 ? 'linear-gradient(135deg, #ff6b6b, #ff4757)' : 'linear-gradient(135deg, #8A7CF4, #4CB3D4)'
                }}
              />
            </div>
            <p className="spots-text">
              <strong>{betaSpotsLeft} of 500</strong> early access spots remaining
            </p>
          </div>

          <div className="trust-signals">
            <div className="trust-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10 6L15 7L11.5 10.5L12.5 15L8 12L3.5 15L4.5 10.5L1 7L6 6L8 1Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.3"/>
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="trust-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Instant confirmation email</span>
            </div>
            <div className="trust-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L3 5V9C3 12 8 14 8 14C8 14 13 12 13 9V5L8 2Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.3"/>
              </svg>
              <span>HIPAA compliant</span>
            </div>
          </div>
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