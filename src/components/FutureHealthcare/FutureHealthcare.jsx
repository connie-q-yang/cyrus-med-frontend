import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeStep, setActiveStep] = useState(0);
  const [particleCount] = useState(50);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Auto-cycle through transformation cards
  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % transformations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [inView]);

  const particleVariants = {
    animate: {
      y: [-20, -100],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="future-healthcare" id="features" ref={ref}>
      {/* Animated Background Particles */}
      <div className="particle-container">
        {Array.from({ length: particleCount }).map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            variants={particleVariants}
            animate="animate"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating Background Elements */}
      <div className="floating-elements">
        <motion.div
          className="floating-circle circle-1"
          animate={{
            y: [-20, 20],
            x: [-10, 10],
            rotate: [0, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-circle circle-2"
          animate={{
            y: [20, -20],
            x: [10, -10],
            rotate: [360, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-circle circle-3"
          animate={{
            y: [-15, 15],
            x: [-5, 5],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="future-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Healthcare{' '}
            <motion.span
              className="highlight"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Reimagined
            </motion.span>
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Stop waiting weeks. Stop paying hundreds. Stop googling symptoms.
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              Get instant, intelligent medical guidance when you need it.
            </motion.span>
          </motion.p>
        </motion.div>

        <motion.div
          className="transformation-grid"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Progress Indicator */}
          <motion.div
            className="progress-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
          >
            <div className="progress-track">
              {transformations.map((_, index) => (
                <motion.div
                  key={index}
                  className={`progress-dot ${activeStep === index ? 'active' : ''}`}
                  animate={{
                    scale: activeStep === index ? [1, 1.2, 1] : 1,
                    backgroundColor: activeStep === index ? '#10b981' : 'rgba(255,255,255,0.3)'
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>

          {transformations.map((transform, index) => (
            <motion.div
              key={index}
              className={`transform-card ${
                hoveredTransform === index || activeStep === index ? 'active' : ''
              } ${activeStep === index ? 'highlighted' : ''}`}
              onMouseEnter={() => {
                setHoveredTransform(index);
                setActiveStep(index);
              }}
              onMouseLeave={() => setHoveredTransform(null)}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="transform-content">
                <motion.div
                  className="transform-icon"
                  animate={{
                    rotate: hoveredTransform === index || activeStep === index ? [0, 5, -5, 0] : 0,
                    scale: hoveredTransform === index || activeStep === index ? 1.1 : 1
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="icon-glow"
                    animate={{
                      opacity: hoveredTransform === index || activeStep === index ? [0.5, 1, 0.5] : 0,
                      scale: hoveredTransform === index || activeStep === index ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  {transform.icon === 'clock' && (
                    <motion.svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      animate={{
                        rotate: hoveredTransform === index || activeStep === index ? 360 : 0
                      }}
                      transition={{ duration: 1.5 }}
                    >
                      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
                      <motion.path
                        d="M20 12V20L26 26"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={{
                          pathLength: hoveredTransform === index || activeStep === index ? [0, 1] : 1
                        }}
                        transition={{ duration: 0.8 }}
                      />
                    </motion.svg>
                  )}
                  {transform.icon === 'dollar' && (
                    <motion.svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      animate={{
                        y: hoveredTransform === index || activeStep === index ? [-2, 2, -2] : 0
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <motion.path
                        d="M20 8V32M14 12H22C24.7614 12 27 14.2386 27 17C27 19.7614 24.7614 22 22 22H14C11.2386 22 9 24.2386 9 27C9 29.7614 11.2386 32 14 32H22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={{
                          pathLength: hoveredTransform === index || activeStep === index ? [0, 1] : 1
                        }}
                        transition={{ duration: 1.2 }}
                      />
                    </motion.svg>
                  )}
                  {transform.icon === 'maze' && (
                    <motion.svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      animate={{
                        scale: hoveredTransform === index || activeStep === index ? [1, 1.1, 1] : 1
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      <rect x="8" y="10" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M14 6H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <motion.path
                        d="M14 15H26M14 20H26M14 25H20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        animate={{
                          pathLength: hoveredTransform === index || activeStep === index ? [0, 1] : 1
                        }}
                        transition={{ duration: 1 }}
                      />
                    </motion.svg>
                  )}
                  {transform.icon === 'globe' && (
                    <motion.svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      animate={{
                        rotate: hoveredTransform === index || activeStep === index ? [0, 360] : 0
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
                      <ellipse cx="20" cy="20" rx="7" ry="18" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 20H38" stroke="currentColor" strokeWidth="1.5"/>
                      <motion.path
                        d="M20 2C20 2 28 10 28 20C28 30 20 38 20 38"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        animate={{
                          pathLength: hoveredTransform === index || activeStep === index ? [0, 1] : 1
                        }}
                        transition={{ duration: 1.5 }}
                      />
                    </motion.svg>
                  )}
                </motion.div>
                <div className="transform-text">
                  <motion.div
                    className="transform-before"
                    initial={{ opacity: 0.6 }}
                    animate={{
                      opacity: hoveredTransform === index || activeStep === index ? 0.4 : 0.6,
                      x: hoveredTransform === index || activeStep === index ? -5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.span
                      className="transform-label"
                      animate={{
                        color: hoveredTransform === index || activeStep === index ? '#ff6b6b' : 'rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      Before
                    </motion.span>
                    <motion.span
                      className="transform-value"
                      animate={{
                        textDecorationColor: hoveredTransform === index || activeStep === index ? '#ff6b6b' : 'rgba(255, 100, 100, 0.5)'
                      }}
                    >
                      {transform.before}
                    </motion.span>
                  </motion.div>

                  <motion.div
                    className="transform-arrow"
                    animate={{
                      x: hoveredTransform === index || activeStep === index ? 8 : 0,
                      scale: hoveredTransform === index || activeStep === index ? 1.2 : 1,
                      rotate: hoveredTransform === index || activeStep === index ? [0, 10, -10, 0] : 0
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <motion.path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{
                          pathLength: hoveredTransform === index || activeStep === index ? [0, 1] : 1
                        }}
                        transition={{ duration: 0.6 }}
                      />
                    </svg>

                    {/* Flowing particles along arrow */}
                    <AnimatePresence>
                      {(hoveredTransform === index || activeStep === index) && (
                        <motion.div
                          className="arrow-particle"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 30, opacity: [0, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    className="transform-after"
                    animate={{
                      x: hoveredTransform === index || activeStep === index ? 5 : 0,
                      scale: hoveredTransform === index || activeStep === index ? 1.05 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.span
                      className="transform-label"
                      animate={{
                        color: hoveredTransform === index || activeStep === index ? '#10b981' : 'rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      With OpenHealth
                    </motion.span>
                    <motion.span
                      className="transform-value"
                      animate={{
                        color: hoveredTransform === index || activeStep === index ? '#34d399' : '#10b981',
                        textShadow: hoveredTransform === index || activeStep === index ? '0 0 20px rgba(52, 211, 153, 0.3)' : 'none'
                      }}
                    >
                      {transform.after}
                    </motion.span>
                  </motion.div>
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
          <motion.div
            className="impact-stats"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated connecting lines */}
            <div className="stat-connections">
              <motion.div
                className="connection-line line-1"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 1, delay: 1 }}
              />
              <motion.div
                className="connection-line line-2"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 1, delay: 1.2 }}
              />
            </div>

            <motion.div
              className="impact-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{
                scale: 1.08,
                y: -8,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div className="stat-glow" />
              <motion.span
                className="impact-number"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  97%
                </motion.span>
              </motion.span>
              <motion.span
                className="impact-label"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1 }}
              >
                Faster than Traditional Care
              </motion.span>
            </motion.div>

            <motion.div
              className="impact-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{
                scale: 1.08,
                y: -8,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div className="stat-glow" />
              <motion.span
                className="impact-number"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  $0
                </motion.span>
              </motion.span>
              <motion.span
                className="impact-label"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 }}
              >
                To Get Started
              </motion.span>
            </motion.div>

            <motion.div
              className="impact-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 }}
              whileHover={{
                scale: 1.08,
                y: -8,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div className="stat-glow" />
              <motion.span
                className="impact-number"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  24/7
                </motion.span>
              </motion.span>
              <motion.span
                className="impact-label"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.4 }}
              >
                Always Available
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FutureHealthcare;