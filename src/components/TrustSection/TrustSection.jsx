import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './TrustSection.css';

const trustPoints = [
  {
    title: 'Evidence-Based',
    description: 'Trained on millions of medical cases and peer-reviewed research',
    icon: 'research'
  },
  {
    title: 'Physician-Reviewed',
    description: 'Developed with healthcare professionals to ensure accuracy',
    icon: 'medical'
  },
  {
    title: 'Privacy-First',
    description: 'Your health data stays private. No sharing without consent',
    icon: 'lock'
  }
];

const TrustSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section className="trust-section" ref={ref}>
      <div className="trust-container">
        <motion.div
          className="trust-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="trust-hero-content">
            <h2 className="trust-title">Care you can trust. Privacy you control.</h2>
            <p className="trust-subtitle">
              Built on medical evidence, designed for your peace of mind
            </p>
          </div>
        </motion.div>

        <div className="trust-features">
          {trustPoints.map((point, index) => (
            <motion.div
              key={index}
              className={`trust-feature trust-feature-${index + 1}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 * index }}
            >
              <div className="trust-feature-icon">
                {point.icon === 'research' && (
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4V28M16 4C16 4 12 4 12 8V12C12 16 16 16 16 16M16 4C16 4 20 4 20 8V12C20 16 16 16 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="16" cy="24" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
                {point.icon === 'medical' && (
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <path d="M16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 12V20M12 16H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
                {point.icon === 'lock' && (
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <rect x="8" y="13" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 13V9C12 6.79086 13.7909 5 16 5C18.2091 5 20 6.79086 20 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="16" cy="19" r="1.5" fill="currentColor"/>
                  </svg>
                )}
              </div>
              <div className="trust-feature-content">
                <h3 className="trust-feature-title">{point.title}</h3>
                <p className="trust-feature-description">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;