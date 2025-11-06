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

  // Well-documented women's health statistics
  // IMPORTANT: Verify these with current sources before going live
  // Suggested sources: WHO, NIH, ACOG, CDC, American Thyroid Association
  const healthFacts = [
    {
      stat: "1 in 10",
      description: "women have endometriosis worldwide",
      impact: "That's 190 million women, yet diagnosis takes 7-10 years on average"
    },
    {
      stat: "1 in 3",
      description: "women say they don't fully understand their birth control options",
      impact: "Or which method is best for their body and lifestyle"
    },
    {
      stat: "70%",
      description: "of women experience period pain",
      impact: "But only 1 in 5 seek medical help, often dismissed as 'normal'"
    },
    {
      stat: "1 in 5",
      description: "women develop thyroid disorders in their lifetime",
      impact: "Women are 5-8x more likely than men to have thyroid problems"
    },
    {
      stat: "8%",
      description: "of reproductive-age women have PCOS",
      impact: "Yet 70% remain undiagnosed despite treatable symptoms"
    },
    {
      stat: "23 days",
      description: "longer wait time for pain diagnosis in women vs men",
      impact: "Gender bias in healthcare delays critical diagnoses"
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
      setCurrentFact((prev) => (prev + 1) % healthFacts.length);
    }, 2500); // Faster rotation - 2.5 seconds

    return () => {
      clearInterval(factInterval);
    };
  }, [healthFacts.length]);

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
        fetch('/.netlify/functions/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: heroEmail }),
        }).catch(err => console.error('Email error:', err));

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
            <span>AI-Powered Women's Health</span>
          </div>

          <h1>Women's health answers you can <span className="gradient-text">trust.</span></h1>

          <p className="hero-description">
            Get instant, evidence-based guidance for your reproductive and hormonal health.
            No more waiting weeks for answers or second-guessing your symptoms.
          </p>

          <div className="cta-container">
            {/* Urgency Banner */}
            <div className="urgency-banner">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V8M8 11H8.01M14.07 11L8.54 2C8.24 1.52 7.76 1.52 7.46 2L1.93 11C1.63 11.48 1.88 12 2.47 12H13.53C14.12 12 14.37 11.48 14.07 11Z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Only <strong>{spotsLeft} spots</strong> left for early access</span>
            </div>

            {/* Inline Email Form */}
            <form className="hero-email-form" onSubmit={handleHeroEmailSubmit}>
              <input
                type="email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                placeholder="Enter your email to join waitlist"
                required
                disabled={isSubmitting}
                className="hero-email-input"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="hero-submit-button"
              >
                {isSubmitting ? 'Joining...' : 'Get Early Access'}
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
                Join <strong>{totalJoined.toLocaleString()} others</strong> who are already experiencing the future of healthcare
              </p>
            </div>

            <button
              className="try-demo-link"
              onClick={openChat}
            >
              or try the demo first →
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
                <div className="did-you-know">Did you know that...</div>
                <div className="fact-stat">{healthFacts[currentFact].stat}</div>
                <div className="fact-description">{healthFacts[currentFact].description}</div>
                <div className="fact-impact">{healthFacts[currentFact].impact}</div>

                {/* Decorative elements */}
                <div className="fact-glow"></div>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="fact-indicators">
              {healthFacts.map((_, index) => (
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
