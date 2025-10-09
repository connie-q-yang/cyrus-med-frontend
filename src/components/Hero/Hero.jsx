import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import './Hero.css';

const Hero = () => {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const benefits = [
    "Skip the 3-week wait for appointments",
    "Get answers in seconds, not hours",
    "Know if you need urgent care or can rest",
    "Save hundreds on unnecessary ER visits"
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
          <h1>Clarity for your health concerns. <span className="gradient-text">Instantly.</span></h1>

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
            <p className="cta-subtitle">Join 500+ beta users getting instant health clarity</p>
          </div>
        </motion.div>
      </div>

      <FullScreenChat isOpen={isChatOpen} onClose={closeChat} />
    </section>
  );
};

export default Hero;
