import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './FutureHealthcare.css';

const transformations = [
  {
    before: '3-week wait for appointments',
    after: 'Instant medical guidance',
    icon: 'clock'
  },
  {
    before: '$300 urgent care surprise bills',
    after: 'Know before you go',
    icon: 'dollar'
  },
  {
    before: 'Endless insurance confusion',
    after: 'Clear, actionable steps',
    icon: 'maze'
  },
  {
    before: 'Geographic barriers to care',
    after: '24/7 access anywhere',
    icon: 'globe'
  }
];

const FutureHealthcare = () => {
  const [hoveredTransform, setHoveredTransform] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section className="future-healthcare" id="features" ref={ref}>
      <div className="future-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Healthcare <span className="highlight">Reimagined</span>
          </h2>
          <p className="section-subtitle">
            Stop waiting weeks. Stop paying hundreds. Stop googling symptoms.
            <br />Get instant, intelligent medical guidance when you need it.
          </p>
        </motion.div>

        <motion.div
          className="transformation-grid"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {transformations.map((transform, index) => (
            <motion.div
              key={index}
              className={`transform-card ${hoveredTransform === index ? 'active' : ''}`}
              onMouseEnter={() => setHoveredTransform(index)}
              onMouseLeave={() => setHoveredTransform(null)}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="transform-content">
                <div className="transform-icon">
                  {transform.icon === 'clock' && (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M20 12V20L26 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {transform.icon === 'dollar' && (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <path d="M20 8V32M14 12H22C24.7614 12 27 14.2386 27 17C27 19.7614 24.7614 22 22 22H14C11.2386 22 9 24.2386 9 27C9 29.7614 11.2386 32 14 32H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {transform.icon === 'maze' && (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="8" y="10" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M14 6H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14 15H26M14 20H26M14 25H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {transform.icon === 'globe' && (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
                      <ellipse cx="20" cy="20" rx="7" ry="18" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 20H38" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M20 2C20 2 28 10 28 20C28 30 20 38 20 38" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </div>
                <div className="transform-text">
                  <div className="transform-before">
                    <span className="transform-label">Before</span>
                    <span className="transform-value">{transform.before}</span>
                  </div>
                  <div className="transform-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="transform-after">
                    <span className="transform-label">With Cyrus</span>
                    <span className="transform-value">{transform.after}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="impact-section"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="impact-stats">
            <motion.div className="impact-stat" whileHover={{ scale: 1.05 }}>
              <span className="impact-number">97%</span>
              <span className="impact-label">Faster than Traditional Care</span>
            </motion.div>
            <motion.div className="impact-stat" whileHover={{ scale: 1.05 }}>
              <span className="impact-number">$0</span>
              <span className="impact-label">To Get Started</span>
            </motion.div>
            <motion.div className="impact-stat" whileHover={{ scale: 1.05 }}>
              <span className="impact-number">24/7</span>
              <span className="impact-label">Always Available</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FutureHealthcare;