import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './SocialProof.css';

const SocialProof = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const stats = [
    { number: '50K+', label: 'Early Adopters' },
    { number: '< 30s', label: 'Average Response Time' },
    { number: '98%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Always Available' }
  ];

  const badges = [
    'HIPAA Compliant',
    'FDA Registered',
    'Board-Certified Reviewed',
    '256-bit Encryption'
  ];

  return (
    <section className="social-proof" ref={ref}>
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2>The Future of Healthcare is Here</h2>
        <p>Join thousands discovering smarter, more accessible medicine</p>
      </motion.div>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="trust-badges">
        {badges.map((badge, index) => (
          <motion.div 
            key={index}
            className="badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
          >
            {badge}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SocialProof;