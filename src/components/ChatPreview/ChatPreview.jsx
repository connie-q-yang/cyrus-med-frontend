import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import DoctorLuna from './DoctorLuna';
import './ChatPreview.css';

const ChatPreview = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const chatContainerRef = React.useRef(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // 3D tilt effect on mouse move
  const handleMouseMove = (e) => {
    if (!chatContainerRef.current) return;
    const rect = chatContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5; // Max 5 degrees
    const rotateY = ((x - centerX) / centerX) * 5;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

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
          <div className="header-badge">
            <span className="badge-dot">💜</span>
            <span>Meet Dr. Luna</span>
          </div>
          <h2>Your AI Menopause Companion</h2>
          <p className="header-description">Get instant help understanding hot flashes, sleep issues, mood changes, and other menopause symptoms—anytime, anywhere.</p>
        </motion.div>

        <motion.div
          className="benefits-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h4>Available 24/7</h4>
            <p>Track and understand symptoms anytime</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h4>Personalized Insights</h4>
            <p>Get tailored menopause guidance</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h4>Share with Your Doctor</h4>
            <p>Export notes for informed conversations</p>
          </div>
        </motion.div>

        <motion.div
          ref={chatContainerRef}
          className="chat-preview-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Doctor Luna Character */}
          <DoctorLuna inView={inView} />
          <div className="preview-content">
            <div className="chat-demo">
              <div className="demo-messages">
                <div className="demo-message user">
                  <span>I'm having hot flashes 10+ times a day. What can I do?</span>
                </div>
                <div className="demo-message ai">
                  <span>Hot flashes can be disruptive. Let me help you understand triggers and options for relief...</span>
                </div>
              </div>

              <button className="start-chat-btn" onClick={openChat}>
                <span className="btn-text">Try Demo Now</span>
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
        {/* Transition Arrow to Waitlist */}
        <motion.div
          className="transition-arrow"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="arrow-text">Ready to take control of your menopause journey?</p>
          <motion.div
            className="arrow-container"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 8V32M20 32L12 24M20 32L28 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <FullScreenChat isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
};

export default ChatPreview;