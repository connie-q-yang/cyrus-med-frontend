import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './FutureHealthcare.css';

const capabilities = [
  {
    title: 'Skip the Wait',
    description: 'No more 3-week waits for appointments. Get instant medical guidance when you need it',
    metric: '24/7',
    label: 'Always Available'
  },
  {
    title: 'Save Money',
    description: 'Avoid unnecessary ER visits and surprise medical bills with intelligent pre-screening',
    metric: '$0',
    label: 'To Start'
  },
  {
    title: 'Get Clear Answers',
    description: 'Stop googling symptoms. Get personalized, evidence-based health guidance instantly',
    metric: '< 30s',
    label: 'Response Time'
  }
];

const FutureHealthcare = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section className="future-healthcare" id="features" ref={ref}>

      <div className="future-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="section-title"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Built for Modern Healthcare
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Advanced AI that understands your health concerns and provides instant, personalized guidance
          </motion.p>
        </motion.div>

        <motion.div
          className="capabilities-grid"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >

          {capabilities.map((capability, index) => (
            <motion.div
              key={index}
              className={`capability-card ${hoveredCard === index ? 'active' : ''}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="capability-content">
                <div className="capability-metric">
                  <motion.span
                    className="metric-value"
                    animate={{
                      opacity: hoveredCard === index ? 1 : 0.8
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {capability.metric}
                  </motion.span>
                  <span className="metric-label">{capability.label}</span>
                </div>
                <h3 className="capability-title">{capability.title}</h3>
                <p className="capability-description">{capability.description}</p>
                <motion.div
                  className="capability-indicator"
                  animate={{
                    width: hoveredCard === index ? '60px' : '30px'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Why Join Section */}
        <motion.div
          className="trust-section"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="trust-content">
            <h3 className="trust-title">Join the Healthcare Revolution</h3>
            <p className="trust-text">Be among the first to experience the future of personalized health guidance</p>
            <div className="trust-stats">
              <div className="trust-stat">
                <span className="trust-number">500</span>
                <span className="trust-label">Beta Spots</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-stat">
                <span className="trust-number">$50</span>
                <span className="trust-label">Free Credits</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-stat">
                <span className="trust-number">Early</span>
                <span className="trust-label">Access</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FutureHealthcare;