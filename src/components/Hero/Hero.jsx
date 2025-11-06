import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import { trackButtonClick, trackWaitlistSignup } from '../../utils/analytics';
import { addToWaitlist, getWaitlistCount } from '../../lib/supabase';
import { toast } from 'react-toastify';
import './Hero.css';

const Hero = () => {
  const [currentFact, setCurrentFact] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [heroEmail, setHeroEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(800); // Will be updated from Supabase
  const [totalJoined, setTotalJoined] = useState(1200); // Will be updated from Supabase

  // Menopause statistics - Sources: North American Menopause Society (NAMS), WHO
  const menopauseFacts = [
    {
      stat: "450M",
      description: "women worldwide are in menopause",
      impact: "Yet most get zero medical support or guidance through this transition"
    },
    {
      stat: "7-10 years",
      description: "average duration of menopause symptoms",
      impact: "But with the right care, you can feel better in weeks, not years"
    },
    {
      stat: "75%",
      description: "of women experience hot flashes",
      impact: "On average 7 times per day. Tracking helps identify triggers and patterns"
    },
    {
      stat: "60%",
      description: "of menopausal women report sleep problems",
      impact: "Poor sleep affects mood, energy, and quality of life—but it's treatable"
    },
    {
      stat: "1 in 4",
      description: "women consider leaving their job due to symptoms",
      impact: "Severe symptoms don't have to derail your career or life"
    },
    {
      stat: "Only 20%",
      description: "of women who could benefit get treatment",
      impact: "Many doctors aren't trained in menopause care. We specialize in it"
    }
  ];

  // Fetch waitlist count on mount - same logic as Waitlist component
  useEffect(() => {
    const fetchCount = async () => {
      const count = await getWaitlistCount();
      if (count > 0) {
        // Add padding to show momentum (1200 base + actual count)
        const paddedCount = count + 1200;
        // Calculate remaining beta spots (2000 total spots)
        const spotsRemaining = Math.max(0, 2000 - paddedCount);
        setSpotsLeft(spotsRemaining);
        setTotalJoined(paddedCount);
      }
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % menopauseFacts.length);
    }, 2500); // Faster rotation - 2.5 seconds

    return () => {
      clearInterval(factInterval);
    };
  }, [menopauseFacts.length]);

  const openChat = () => {
    trackButtonClick('try_demo', 'hero');
    setIsChatOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeChat = () => {
    setIsChatOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleHeroEmailSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(heroEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addToWaitlist(heroEmail);

      if (result.success) {
        // Send welcome email
        try {
          const emailResponse = await fetch('/.netlify/functions/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: heroEmail }),
          });

          const emailResult = await emailResponse.json();
          console.log('Email result:', emailResult);

          if (!emailResponse.ok) {
            console.error('Email sending failed:', emailResult);
            // Don't block the user flow, but log the error
          }
        } catch (err) {
          console.error('Email error:', err);
          // Don't block the user flow, but log the error
        }

        trackWaitlistSignup(heroEmail, 'hero_inline');
        toast.success('🎉 Welcome to OpenMedicine! Check your email.');
        setHeroEmail('');
        // Update both spots left and total joined
        setSpotsLeft(prev => Math.max(0, prev - 1));
        setTotalJoined(prev => prev + 1);
      } else {
        toast.info(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Waitlist error:', error);
      toast.error('Unable to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="hero">
      <div className="hero-container">
        {/* Left Side - Main Content */}
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge">
            <span>AI-Powered Menopause Care</span>
          </div>

          <h1>Finally, menopause care that actually <span className="gradient-text">works</span></h1>

          <p className="hero-description">
            Track symptoms. Get AI-powered insights. Join women taking control of their menopause journey.
          </p>

          <div className="cta-container">
            {/* Urgency Banner */}
            <div className="urgency-banner">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V8M8 11H8.01M14.07 11L8.54 2C8.24 1.52 7.76 1.52 7.46 2L1.93 11C1.63 11.48 1.88 12 2.47 12H13.53C14.12 12 14.37 11.48 14.07 11Z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Only <strong>{spotsLeft} early access spots</strong> remaining</span>
            </div>

            {/* Inline Email Form */}
            <form className="hero-email-form" onSubmit={handleHeroEmailSubmit}>
              <input
                type="email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                placeholder="Enter your email for early access"
                required
                disabled={isSubmitting}
                className="hero-email-input"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="hero-submit-button"
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>

            <div className="hero-social-proof">
              <div className="user-avatars">
                <div className="avatar">👩🏻</div>
                <div className="avatar">👩🏽</div>
                <div className="avatar">👩🏾</div>
                <div className="avatar">👩🏼</div>
              </div>
              <p className="social-proof-text">
                Join <strong>{totalJoined.toLocaleString()} women</strong> managing menopause symptoms with OpenMedicine
              </p>
            </div>

            <button
              className="try-demo-link"
              onClick={openChat}
            >
              or see how it works →
            </button>
          </div>
        </motion.div>

        {/* Right Side - Animated Health Facts */}
        <motion.div
          className="hero-right"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="facts-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFact}
                className="fact-card"
                initial={{
                  opacity: 0,
                  rotateX: -15,
                  y: 40
                }}
                animate={{
                  opacity: 1,
                  rotateX: 0,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  rotateX: 15,
                  y: -40
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut"
                }}
              >
                <div className="did-you-know">Did you know...</div>
                <div className="fact-stat">{menopauseFacts[currentFact].stat}</div>
                <div className="fact-description">{menopauseFacts[currentFact].description}</div>
                <div className="fact-impact">{menopauseFacts[currentFact].impact}</div>

                {/* Decorative elements */}
                <div className="fact-glow"></div>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="fact-indicators">
              {menopauseFacts.map((_, index) => (
                <button
                  key={index}
                  className={`fact-dot ${index === currentFact ? 'active' : ''}`}
                  onClick={() => setCurrentFact(index)}
                  aria-label={`Go to fact ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <FullScreenChat isOpen={isChatOpen} onClose={closeChat} />
    </section>
  );
};

export default Hero;
