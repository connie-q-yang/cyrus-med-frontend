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
              Getting the right care fast should feel simple, private, and reassuring.
              OpenHealth is a 24/7 health guide that helps you understand symptoms, decide
              what to do now, and, when it is safer, get to Urgent Care or the ER
              without delay. It is free to use, with affordable access to licensed
              clinicians when you want a human.
            </p>
          </section>

          <section className="about-section">
            <h2>How OpenHealth Helps</h2>
            <p>
              Think of it as a careful co-pilot: it organizes your story, flags red
              flags, and suggests the next best step (self-care, clinic, Urgent Care
              or ER), plus practical actions like click to call and directions. OpenHealth
              is not a medical diagnosis and can make mistakes; it works best alongside
              licensed professionals, especially for urgent or complex issues.
            </p>
          </section>

          <section className="about-section">
            <h2>Your Privacy Comes First</h2>
            <p>
              Use OpenHealth anonymously or create an account to save chats. We use
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