import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './SidePanel.css';

const SidePanel = ({ onOpenSymptomLog }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Desktop: Fixed side panel */}
      <div className="side-panel-desktop">
        <div className="side-panel-actions">
          <button
            onClick={onOpenSymptomLog}
            className="side-panel-btn"
            title="Log Symptoms"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Log Symptoms</span>
          </button>

          <button
            className="side-panel-btn disabled"
            title="Available in future updates"
            disabled
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Schedule Consultation</span>
            <div className="coming-soon-badge">Soon</div>
          </button>
        </div>
      </div>

      {/* Mobile: Floating action button */}
      <div className="side-panel-mobile">
        <motion.button
          className="fab-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </motion.div>
        </motion.button>

        <motion.div
          className="fab-menu"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: isExpanded ? 1 : 0,
            scale: isExpanded ? 1 : 0.8,
            y: isExpanded ? 0 : 20,
            pointerEvents: isExpanded ? 'auto' : 'none'
          }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => {
              onOpenSymptomLog();
              setIsExpanded(false);
            }}
            className="fab-menu-item"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Log Symptoms</span>
          </button>

          <button
            className="fab-menu-item disabled"
            disabled
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Schedule</span>
            <div className="coming-soon-badge-small">Soon</div>
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default SidePanel;
