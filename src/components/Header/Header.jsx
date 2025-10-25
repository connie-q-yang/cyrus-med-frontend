import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FullScreenChat from '../FullScreenChat/FullScreenChat';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openChat = () => {
    setIsChatOpen(true);
    document.body.style.overflow = 'hidden';
    setIsMobileMenuOpen(false);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToSection = (sectionId) => {
    // Close menu first to prevent layout shifts
    setIsMobileMenuOpen(false);

    // Small delay to allow menu to close before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 100; // Fixed header height + buffer
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <>
      <motion.header
        className={`header ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 8V16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="logo-text">OpenMedicine</span>
              </div>
            </div>

            <nav className="nav-menu desktop-only">
              <button onClick={() => scrollToSection('features')} className="nav-link">
                How it Works
              </button>
              <button onClick={() => scrollToSection('chat-section')} className="nav-link">
                Try Demo
              </button>
              <a href="/about" target="_blank" rel="noopener noreferrer" className="nav-link">
                About Us
              </a>
            </nav>

            <div className="header-actions">
              <button
                className="beta-badge desktop-only"
                onClick={() => scrollToSection('waitlist')}
              >
                <span className="beta-dot"></span>
                Beta Access
              </button>
              <button className="consult-button" onClick={openChat}>
                Start Consultation
              </button>
              <button
                className="mobile-menu-toggle mobile-only"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {isMobileMenuOpen ? (
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  ) : (
                    <>
                      <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
          initial={{ height: 0 }}
          animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <nav className="mobile-nav">
            <button onClick={() => scrollToSection('features')} className="mobile-nav-link">
              How it Works
            </button>
            <button onClick={() => scrollToSection('chat-section')} className="mobile-nav-link">
              Try Demo
            </button>
            <a href="/about" target="_blank" rel="noopener noreferrer" className="mobile-nav-link">
              About Us
            </a>
            <button
              className="mobile-beta-button"
              onClick={() => scrollToSection('waitlist')}
            >
              <span className="beta-dot"></span>
              Join Beta Waitlist
            </button>
          </nav>
        </motion.div>
      </motion.header>

      <FullScreenChat isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
};

export default Header;