import React from 'react';
import { motion } from 'framer-motion';
import './DoctorLuna.css';

const DoctorLuna = ({ inView }) => {
  return (
    <motion.div
      className="doctor-luna-fairy"
      initial={{ x: 100, y: -50, opacity: 0, scale: 0 }}
      animate={inView ? { x: 0, y: 0, opacity: 1, scale: 1 } : {}}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 12,
        delay: 0.5
      }}
    >
      {/* Floating Container with Flutter Animation */}
      <motion.div
        className="luna-float-container"
        animate={{
          y: [0, -15, 0],
          x: [0, 8, 0],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Magic Sparkles */}
        <motion.div
          className="sparkle sparkle-1"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0
          }}
        >
          ✨
        </motion.div>
        <motion.div
          className="sparkle sparkle-2"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.7
          }}
        >
          ⭐
        </motion.div>
        <motion.div
          className="sparkle sparkle-3"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1.4
          }}
        >
          💫
        </motion.div>

        {/* Main Character Circle */}
        <div className="luna-circle">
          {/* Glow Effect */}
          <div className="luna-glow"></div>

          {/* Character Face */}
          <div className="luna-avatar">
            {/* Purple Doctor's Hat */}
            <div className="doctor-hat">
              <div className="hat-top"></div>
              <div className="hat-band"></div>
              <div className="hat-fold hat-fold-1"></div>
              <div className="hat-fold hat-fold-2"></div>
              <div className="hat-fold hat-fold-3"></div>
            </div>

            {/* Face */}
            <div className="luna-face-circle">
              {/* Eyes */}
              <motion.div
                className="luna-eyes-container"
                animate={{
                  scaleY: [1, 0.1, 1],
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <div className="luna-eye">
                  <div className="eye-pupil"></div>
                  <div className="eye-sparkle"></div>
                </div>
                <div className="luna-eye">
                  <div className="eye-pupil"></div>
                  <div className="eye-sparkle"></div>
                </div>
              </motion.div>

              {/* Rosy Cheeks */}
              <div className="rosy-cheek cheek-left"></div>
              <div className="rosy-cheek cheek-right"></div>

              {/* Sweet Smile */}
              <div className="luna-smile-container">
                <svg viewBox="0 0 50 30" width="50" height="30">
                  <path
                    d="M 10 12 Q 25 22 40 12"
                    stroke="#F472B6"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Medical Cross Badge */}
            <div className="medical-badge">
              <div className="cross-vertical"></div>
              <div className="cross-horizontal"></div>
            </div>

            {/* Stethoscope Icon */}
            <div className="mini-stethoscope">🩺</div>
          </div>
        </div>

        {/* Speech Bubble */}
        <motion.div
          className="fairy-speech-bubble"
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.3 }}
        >
          Hi! I'm Dr. Luna
          <div className="bubble-arrow"></div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorLuna;
