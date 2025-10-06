import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import './Hero.css';

const Hero = () => {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const benefits = [
    "Feel better in hours, not days",
    "Available 24/7, whenever you need care",
    "Proactive health insights before issues arise",
    "Evidence-based care from advanced AI"
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
    setIsChatOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeChat = () => {
    setIsChatOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToWaitlist = () => {
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
          <div className="hero-badge">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              Fast & Free
            </motion.span>
          </div>

          <h1>Your AI Doctor Who Actually <span className="gradient-text">Gets You</span></h1>

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
                Start Free Consultation
              </button>
              <button className="cta-secondary" onClick={scrollToWaitlist}>
                Get on Waitlist
              </button>
            </div>
            <p className="cta-subtitle">No signup required • Get answers in seconds</p>
          </div>
        </motion.div>
      </div>

      <FullScreenChat isOpen={isChatOpen} onClose={closeChat} />
    </section>
  );
};

export default Hero;
