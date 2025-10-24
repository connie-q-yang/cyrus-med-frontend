import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import { trackButtonClick } from '../../utils/analytics';
import './Hero.css';

const Hero = () => {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const primaryBtnRef = React.useRef(null);
  const secondaryBtnRef = React.useRef(null);

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

  // Magnetic button effect
  const handleMagneticMove = (e, ref) => {
    if (!ref.current) return;
    const btn = ref.current;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 100;

    if (distance < maxDistance) {
      const strength = (maxDistance - distance) / maxDistance;
      btn.style.transform = `translate(${x * strength * 0.3}px, ${y * strength * 0.3}px) translateY(-2px)`;
    }
  };

  const handleMagneticLeave = (ref) => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  };

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
              <button
                ref={primaryBtnRef}
                className="cta-primary magnetic-button"
                onClick={openChat}
                onMouseMove={(e) => handleMagneticMove(e, primaryBtnRef)}
                onMouseLeave={() => handleMagneticLeave(primaryBtnRef)}
              >
                Try Demo
              </button>
              <button
                ref={secondaryBtnRef}
                className="cta-secondary magnetic-button"
                onClick={scrollToWaitlist}
                onMouseMove={(e) => handleMagneticMove(e, secondaryBtnRef)}
                onMouseLeave={() => handleMagneticLeave(secondaryBtnRef)}
              >
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
