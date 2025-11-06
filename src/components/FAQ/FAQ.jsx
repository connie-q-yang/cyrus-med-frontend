import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './FAQ.css';

const faqData = [
  {
    category: "About OpenMedicine",
    questions: [
      {
        question: "How does symptom tracking work?",
        answer: `Takes 30 seconds daily on your phone. Log hot flashes, sleep quality, mood, and energy. After 7 days, our AI identifies patterns you'd never spot alone—like which days trigger more symptoms, how sleep affects your mood, and what lifestyle factors help or hurt.

You can track as long as you like. The more data, the clearer the patterns become.`
      },
      {
        question: "What symptoms can I track?",
        answer: `• Hot flashes and night sweats (frequency, severity, triggers)
• Sleep quality and disruptions
• Mood changes, anxiety, irritability
• Brain fog and memory issues
• Energy levels throughout the day
• Physical symptoms (joint pain, headaches)
• Weight changes
• And more

Track what matters to you. The AI learns your patterns regardless of which symptoms you focus on.`
      },
      {
        question: "When will OpenMedicine launch?",
        answer: `We're currently in development and gathering feedback from our waitlist community. Early access members will be notified first when we launch. Join the waitlist to stay updated on our progress and be among the first to try the platform.`
      },
      {
        question: "Is my data private and secure?",
        answer: `Yes. All data is HIPAA-compliant and encrypted at rest and in transit. We never share your health information with advertisers or third parties without your explicit consent.

You own your data. You can download it or delete your account anytime.`
      },
      {
        question: "Can I use this if I'm already on HRT or other treatments?",
        answer: `Absolutely! OpenMedicine is designed to help you track how well your current treatments are working. The data can help you and your doctor optimize dosing, try different formulations, or adjust your approach.

If you're not on treatment yet, tracking helps you decide whether you want to pursue HRT, lifestyle changes, supplements, or other options.`
      },
      {
        question: "What if I'm not sure I'm in menopause yet?",
        answer: `That's exactly why tracking helps. Perimenopause (the transition before menopause) can start in your 40s—or even late 30s. Symptoms are often subtle and confusing at first.

OpenMedicine will help you document what's happening so you can see patterns and better understand whether your symptoms might be menopause-related.`
      },
      {
        question: "How much does it cost?",
        answer: `Pricing details will be announced closer to launch. Our goal is to make evidence-based menopause care accessible and affordable. Join the waitlist to be notified when pricing is available.`
      }
    ]
  }
];

const FAQ = () => {
  const [openCategories, setOpenCategories] = useState([0]); // First category open by default
  const [openQuestions, setOpenQuestions] = useState([]);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const toggleCategory = (categoryIndex) => {
    setOpenCategories(prev =>
      prev.includes(categoryIndex)
        ? prev.filter(i => i !== categoryIndex)
        : [...prev, categoryIndex]
    );
  };

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenQuestions(prev =>
      prev.includes(key)
        ? prev.filter(i => i !== key)
        : [...prev, key]
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
          <p className="faq-subtitle">Everything you need to know about managing menopause with OpenMedicine</p>
        </motion.div>

        <motion.div
          className="faq-grid"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {faqData.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              className="faq-category"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
            >
              <button
                className={`faq-category-header ${openCategories.includes(categoryIndex) ? 'open' : ''}`}
                onClick={() => toggleCategory(categoryIndex)}
              >
                <span className="category-text">{category.category}</span>
                <motion.svg
                  className="chevron-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  animate={{ rotate: openCategories.includes(categoryIndex) ? 180 : 0 }}
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
                {openCategories.includes(categoryIndex) && (
                  <motion.div
                    className="faq-category-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {category.questions.map((item, questionIndex) => (
                      <div key={questionIndex} className="faq-item">
                        <button
                          className={`faq-question ${openQuestions.includes(`${categoryIndex}-${questionIndex}`) ? 'open' : ''}`}
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        >
                          <span className="question-text">{item.question}</span>
                          <motion.svg
                            className="chevron-icon"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            animate={{ rotate: openQuestions.includes(`${categoryIndex}-${questionIndex}`) ? 180 : 0 }}
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
                          {openQuestions.includes(`${categoryIndex}-${questionIndex}`) && (
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
                      </div>
                    ))}
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