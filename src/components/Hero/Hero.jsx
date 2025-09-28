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
  }, []);

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
              ⚡ Fast & Free
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
              <span className="cta-icon">💬</span>
              Start Free Consultation
            </button>
            <p className="cta-subtitle">No signup required • Get answers in seconds</p>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="interactive-cards">
            <motion.div
              className="feature-card primary"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="card-icon">⚡</div>
              <h3>Feel Better in Hours</h3>
              <p>Skip the waiting room. Get personalized care instantly.</p>
            </motion.div>

            <motion.div
              className="feature-card secondary"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="card-icon">🔬</div>
              <h3>Evidence-Based Care</h3>
              <p>Backed by millions of medical cases and research.</p>
            </motion.div>

            <motion.div
              className="feature-card tertiary"
              whileHover={{ scale: 1.05, rotate: -1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="card-icon">🛡️</div>
              <h3>Proactive Health</h3>
              <p>Catch issues early with preventive insights.</p>
            </motion.div>
          </div>

          <div className="floating-elements">
            <motion.div
              className="floating-pill"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >💊</motion.div>
            <motion.div
              className="floating-heart"
              animate={{
                y: [0, -15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >❤️</motion.div>
            <motion.div
              className="floating-shield"
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >🩺</motion.div>
          </div>
        </motion.div>
      </div>

      <div className="scroll-indicator">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↓
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;