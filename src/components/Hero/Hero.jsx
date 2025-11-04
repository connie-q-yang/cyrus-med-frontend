import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import { trackButtonClick } from '../../utils/analytics';
import './Hero.css';

const Hero = () => {
  const [currentFact, setCurrentFact] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const primaryBtnRef = React.useRef(null);
  const secondaryBtnRef = React.useRef(null);

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

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % healthFacts.length);
    }, 2500); // Faster rotation - 2.5 seconds

    return () => {
      clearInterval(factInterval);
    };
  }, [healthFacts.length]);

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
            <p className="cta-subtitle">Join 1000+ women taking control of their health</p>
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
