import React from 'react';
import { motion } from 'framer-motion';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <div className="about-us-container">
        <motion.div
          className="about-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="about-title">About Us</h1>

          <section className="about-section">
            <h2>Our Philosophy</h2>
            <p>
              Navigating menopause should feel simple, supportive, and empowering.
              OpenMedicine is a 24/7 AI menopause specialist that helps you understand
              your symptoms, identify patterns, and make informed decisions about your care.
              From hot flashes to mood changes, we're here to help you feel heard and informed.
            </p>
          </section>

          <section className="about-section">
            <h2>How OpenMedicine Helps</h2>
            <p>
              Think of it as your personal menopause guide: Dr. Luna helps you track symptoms,
              identify triggers, understand whether you're in perimenopause or menopause, and
              learn about treatment options including HRT and lifestyle changes. Export your
              symptom summary to share with your doctor for more informed conversations.
              OpenMedicine is educational and works best alongside licensed healthcare providers.
            </p>
          </section>

          <section className="about-section">
            <h2>Your Privacy Comes First</h2>
            <p>
              Use OpenMedicine anonymously or create an account to save chats. We use
              HIPAA-grade protections. Your data is yours, we do not sell it, and
              we will not use your personal conversations to train AI without your
              explicit consent.
            </p>
          </section>

          <div className="back-home">
            <button
              className="back-button"
              onClick={() => window.close()}
            >
              Close Tab
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;