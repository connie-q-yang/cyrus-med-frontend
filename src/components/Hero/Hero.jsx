import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Hero.css';

const Hero = () => {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [consultationCount, setConsultationCount] = useState(15571632);

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

    const countInterval = setInterval(() => {
      setConsultationCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);

    return () => {
      clearInterval(benefitInterval);
      clearInterval(countInterval);
    };
  }, [benefits.length]);

  const scrollToChat = () => {
    document.getElementById('chat-section').scrollIntoView({ behavior: 'smooth' });
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

          <div className="trust-indicators">
            <motion.div
              className="indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="indicator-number">{consultationCount.toLocaleString()}</span>
              <span className="indicator-label">consultations completed</span>
            </motion.div>
            <motion.div
              className="indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="indicator-number">$39</span>
              <span className="indicator-label">for video doctor visit</span>
            </motion.div>
          </div>

          <div className="cta-container">
            <button className="cta-primary" onClick={scrollToChat}>
              Start Free Consultation
            </button>
            <p className="cta-subtitle">No signup required • Get answers in seconds</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
