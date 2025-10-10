import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './FAQ.css';

const faqData = [
  {
    question: "What is OpenMedicine?",
    answer: `OpenMedicine helps you make sense of symptoms. In a short chat, we turn your story into:

• A Differential Snapshot (likely / possible / rule-out)
• A Seriousness Gauge (clear, plain-English risk cues and escalation advice)
• A Share-Ready Summary you can hand to any clinician to speed up care`
  },
  {
    question: "What will I see after a chat?",
    answer: `• Top 3-5 possibilities with brief reasoning
• Seriousness cues (what would make this urgent vs. watchful waiting)
• Next-step guidance (what to prepare, what to bring)
• Share-Ready Summary (PDF/link) for your doctor, urgent care, or ER`
  },
  {
    question: "When should I use OpenMedicine?",
    answer: `Use us when you want clarity before contacting a clinician, preparing for urgent care/ER, or getting a second look at what might be going on.

⚠️ If you have severe symptoms right now (e.g., chest pain, trouble breathing, stroke signs, heavy bleeding), call 911 or your local emergency number immediately.`
  },
  {
    question: "What OpenMedicine is NOT",
    answer: `• We don't diagnose, treat, or prescribe
• We don't offer video visits today`
  },
  {
    question: "How much does it cost?",
    answer: `OpenMedicine is free. We may add optional paid features later (e.g., long-term history, record integrations). The core experience remains free.`
  },
  {
    question: "How is my data handled?",
    answer: `• Use OpenMedicine without an account for maximum privacy
• Create an account if you want us to save your summaries for easy sharing
• We don't sell your personal data. You can delete your account anytime
• If you access OpenMedicine through a healthcare partner later, your data may be governed by that partner's privacy and security rules`
  },
  {
    question: "Who can use OpenMedicine?",
    answer: `Adults 18+ (U.S.), English only for now. Parents/guardians may use OpenMedicine themselves to better understand a child's symptoms; minors should not use the service independently.`
  },
  {
    question: "For clinics, health systems, and employers",
    answer: `We're piloting EHR-friendly summaries and ahead-of-arrival sharing to reduce repetitive intake and speed clinical review. This program is a work in progress.

Interested? Join the partner waitlist.`
  },
  {
    question: "How do I get started?",
    answer: `Open OpenMedicine on your phone or computer and start a chat. No downloads, no forms, no fees. You'll get a differential, seriousness guidance, and a shareable summary in minutes.`
  },
  {
    question: "Do you provide medical visits or prescriptions?",
    answer: `Not yet. No video visits or prescriptions at this time. We're building MD FastPass so a licensed physician can rapidly approve the AI assessment for safety and seriousness. Join the waitlist.`
  },
  {
    question: "Can OpenMedicine tell me exactly what I have?",
    answer: `No single tool can guarantee a diagnosis. We provide a structured differential plus a Seriousness Gauge, then equip you and your clinician to decide next steps quickly.`
  },
  {
    question: "Can I upload my medical records?",
    answer: `Coming soon. For now, add key history (meds, allergies, conditions) during the chat. Record uploads and health-system syncing are on our roadmap. Join the waitlist.`
  },
  {
    question: "Can I save my results?",
    answer: `• Without an account: download or copy your summary before closing your browser
• With an account: your summaries live in your dashboard for easy sharing`
  },
  {
    question: "Can I skip questions and jump to a summary?",
    answer: `We keep questions brief and your answers make the output safer and the handoff more useful. Most chats take under a minute.`
  },
  {
    question: "Is OpenMedicine a medical device?",
    answer: `OpenMedicine provides information to support understanding and clinician communication. It does not diagnose, treat, or prescribe. Always follow guidance from your healthcare professionals and emergency services.`
  },
  {
    question: "Where does it run?",
    answer: `Any modern web browser (phone, tablet, computer). Additional languages and native apps are planned.`
  }
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState([]);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const toggleItem = (index) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="faq-section" ref={ref}>
      <div className="faq-container">
        <motion.div
          className="faq-header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">Everything you need to know about OpenMedicine</p>
        </motion.div>

        <motion.div
          className="faq-grid"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * (index % 4) }}
            >
              <button
                className={`faq-question ${openItems.includes(index) ? 'open' : ''}`}
                onClick={() => toggleItem(index)}
              >
                <span className="question-text">{item.question}</span>
                <motion.svg
                  className="chevron-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </button>

              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="answer-content">
                      {item.answer.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="faq-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="legal-notice">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>
              <strong>Legal & Safety Notice:</strong> If symptoms are severe or rapidly worsening,
              call 911 or go to the nearest emergency department. OpenMedicine is informational
              and does not replace professional medical care.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;