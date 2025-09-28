import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import './ChatPreview.css';

const ChatPreview = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const openChat = () => {
    setIsChatOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeChat = () => {
    setIsChatOpen(false);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  return (
    <>
      <section className="chat-preview" id="chat-section" ref={ref}>
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2>Experience Cyrus in Action</h2>
          <p>Get instant, personalized medical guidance 24/7</p>
        </motion.div>

        <motion.div
          className="chat-preview-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="preview-content">
            <div className="preview-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Instant Responses</h3>
                <p>Get medical insights in seconds, not hours or days</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15 9L22 10L17 15L18 22L12 18L6 22L7 15L2 10L9 9L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Evidence-Based</h3>
                <p>Backed by millions of medical cases and research</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>24/7 Available</h3>
                <p>Always here when you need medical guidance</p>
              </div>
            </div>

            <div className="chat-demo">
              <div className="demo-messages">
                <div className="demo-message user">
                  <span>I've been having headaches for 3 days. Should I be worried?</span>
                </div>
                <div className="demo-message ai">
                  <span>I understand headaches can be concerning. Let me help you assess this...</span>
                </div>
              </div>

              <button className="start-chat-btn" onClick={openChat}>
                <span className="btn-text">Start Free Consultation</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10H16M16 10L12 6M16 10L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="privacy-disclaimer">
            <div className="disclaimer-content">
              <svg className="lock-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7V5C12 2.79086 10.2091 1 8 1C5.79086 1 4 2.79086 4 5V7M8 10V12M3 15H13C13.5523 15 14 14.5523 14 14V8C14 7.44772 13.5523 7 13 7H3C2.44772 7 2 7.44772 2 8V14C2 14.5523 2.44772 15 3 15Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"/>
              </svg>
              <span className="disclaimer-text">
                <strong>HIPAA Compliant</strong> • Everything is private and secure
              </span>
            </div>
            <p className="disclaimer-details">
              Every conversation is encrypted and stored securely. We never use your data for AI training and only share with your doctor if you explicitly authorize it.
            </p>
          </div>
        </motion.div>
      </section>

      <FullScreenChat isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
};

export default ChatPreview;