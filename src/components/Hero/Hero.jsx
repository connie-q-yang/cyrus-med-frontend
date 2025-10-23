import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import { trackButtonClick } from '../../utils/analytics';
import './Hero.css';

const Hero = () => {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const benefits = [
    "Understand your cycle, symptoms, and hormones",
    "Get guidance on pregnancy and fertility concerns",
    "Know when period symptoms need attention",
    "Navigate menopause with confidence"
  ];

  useEffect(() => {
    const benefitInterval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 3000);

    return () => {
      clearInterval(benefitInterval);
    };
  }, [benefits.length]);

  const openChat = () => {
    trackButtonClick('try_demo', 'hero');
    setIsChatOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeChat = () => {
    setIsChatOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToWaitlist = () => {
    trackButtonClick('get_on_waitlist', 'hero');
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Women's health answers you can <span className="gradient-text">trust.</span></h1>

          <div className="benefits-carousel">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentBenefit}
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {benefits[currentBenefit]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="cta-container">
            <div className="cta-buttons">
              <button className="cta-primary" onClick={openChat}>
                Try Demo
              </button>
              <button className="cta-secondary" onClick={scrollToWaitlist}>
                Join Beta Waitlist
              </button>
            </div>
            <p className="cta-subtitle">Join 500+ women taking control of their health</p>
          </div>
        </motion.div>
      </div>

      <FullScreenChat isOpen={isChatOpen} onClose={closeChat} />
    </section>
  );
};

export default Hero;
