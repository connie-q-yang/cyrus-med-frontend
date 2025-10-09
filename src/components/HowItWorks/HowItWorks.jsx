import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import './HowItWorks.css';

const steps = [
  {
    number: '1',
    title: 'Share Your Concerns',
    description: 'Tell us your symptoms in your own words. No medical jargon needed.',
    icon: 'message'
  },
  {
    number: '2',
    title: 'AI Analysis',
    description: 'Our AI analyzes your symptoms against millions of medical cases.',
    icon: 'brain'
  },
  {
    number: '3',
    title: 'Personalized Guidance',
    description: 'Receive clear, actionable health guidance tailored to your situation.',
    icon: 'guide'
  },
  {
    number: '4',
    title: 'Next Steps',
    description: 'Know whether to rest, visit urgent care, or seek emergency help.',
    icon: 'arrow'
  }
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 2,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section className="how-it-works" ref={ref}>
      <div className="how-container">
        <motion.div
          className="how-header"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="how-title">How It Works</h2>
          <p className="how-subtitle">
            Get from symptoms to clarity in minutes
          </p>
        </motion.div>

        <div className="timeline-container">
          {/* Animated vertical line */}
          <motion.div
            className="timeline-line"
            variants={lineVariants}
            initial="hidden"
            animate={controls}
          />

          <motion.div
            className="timeline-steps"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                variants={itemVariants}
                whileInView={{
                  opacity: 1,
                  x: 0
                }}
                viewport={{ once: false, amount: 0.5 }}
              >
                <motion.div
                  className="timeline-content"
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="timeline-icon">
                    {step.icon === 'message' && (
                      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                        <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 12L16 18L28 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    {step.icon === 'brain' && (
                      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                        <path d="M16 26C16 26 8 23 8 16C8 11.5 11.5 8 16 8C20.5 8 24 11.5 24 16C24 23 16 26 16 26Z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
                        <circle cx="20" cy="15" r="1.5" fill="currentColor"/>
                        <path d="M12 20C12 20 13.5 21.5 16 21.5C18.5 21.5 20 20 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    {step.icon === 'guide' && (
                      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M16 13V24M16 24L12 20M16 24L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {step.icon === 'arrow' && (
                      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                        <path d="M6 16H26M26 16L20 10M26 16L20 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="timeline-text">
                    <h3 className="timeline-title">{step.title}</h3>
                    <p className="timeline-description">{step.description}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="timeline-marker"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: index * 0.1
                  }}
                  viewport={{ once: false }}
                >
                  <span>{step.number}</span>
                  <motion.div
                    className="timeline-pulse"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;