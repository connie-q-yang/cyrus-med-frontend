import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-toastify';
import { addToWaitlist, getWaitlistCount } from '../../lib/supabase';
import { trackWaitlistSignup } from '../../utils/analytics';
import './Waitlist.css';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [betaSpotsLeft, setBetaSpotsLeft] = useState(800);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    // Fetch actual waitlist count on mount
    const fetchCount = async () => {
      const count = await getWaitlistCount();
      if (count > 0) {
        // Add padding to show momentum (1200 base + actual count)
        const paddedCount = count + 1200;
        // Calculate remaining beta spots (2000 total spots)
        const spotsLeft = Math.max(0, 2000 - paddedCount);
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
        try {
          const emailResponse = await fetch('/.netlify/functions/send-welcome-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          const emailResult = await emailResponse.json();
          console.log('Email result:', emailResult);

          if (!emailResponse.ok) {
            console.error('Email sending failed:', emailResult);
            // Don't block the user flow, but log the error
          }
        } catch (err) {
          console.error('Email error:', err);
          // Don't show error to user as the signup was successful
        }

        // Track successful signup
        trackWaitlistSignup(email, 'waitlist_section');

        toast.success(result.message || '🎉 Welcome to OpenMedicine! Check your email for next steps.');
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
          <h2>Join the Waitlist</h2>
          <p className="waitlist-subtitle">
            Be among the first to access our AI-powered menopause care platform. {2000 - betaSpotsLeft} women have already joined.
          </p>

          <div className="waitlist-benefits">
            <div className="benefit">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                <path d="M5 9L8 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Daily symptom tracking</span>
            </div>
            <div className="benefit">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                <path d="M5 9L8 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>AI-powered insights and patterns</span>
            </div>
            <div className="benefit">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                <path d="M5 9L8 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Early access to launch</span>
            </div>
            <div className="benefit">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                <path d="M5 9L8 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Help shape the future of menopause care</span>
            </div>
          </div>

          <form className="waitlist-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className="email-input"
              />
              <button type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>
          </form>

          <div className="spots-remaining">
            <span className="spots-number">{betaSpotsLeft}</span>
            <span className="spots-label">early access spots remaining</span>
          </div>

          <p className="privacy-note">
            Not for emergencies. If you're experiencing a medical emergency, call 911.
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