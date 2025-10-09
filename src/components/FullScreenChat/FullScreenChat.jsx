import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '../ChatPreview/ChatMessage';
import useChat from '../../hooks/useChat';
import { exportChatAsDocx, exportChatAsText } from '../../utils/exportChat';
import './FullScreenChat.css';

const samplePrompts = [
  {
    category: "Urgent Symptoms",
    icon: "🚨",
    prompts: [
      "I have chest pain, is it serious?",
      "I feel dizzy and lightheaded, should I go to the ER?",
      "My child has a fever of 102°F, should I be worried?",
      "I have shortness of breath — what do I do?"
    ]
  },
  {
    category: "Common Illness",
    icon: "🤒",
    prompts: [
      "Do I have the flu or just a cold?",
      "I have a sore throat — do I need antibiotics?",
      "What can I take for a bad cough?",
      "I have a headache that won't go away — what should I do?"
    ]
  },
  {
    category: "Medications",
    icon: "💊",
    prompts: [
      "Can I take ibuprofen and Tylenol together?",
      "What are the side effects of my blood pressure meds?",
      "I missed a dose of my prescription, what should I do?",
      "Can I drink alcohol while taking antibiotics?"
    ]
  },
  {
    category: "Women's Health",
    icon: "👩‍⚕️",
    prompts: [
      "I missed my period, could I be pregnant?",
      "Is this birth control side effect normal?",
      "I have cramps and heavy bleeding — what does it mean?",
      "What are the signs of menopause?"
    ]
  },
  {
    category: "Mental Health",
    icon: "🧠",
    prompts: [
      "I feel really anxious all the time — what should I do?",
      "I can't sleep, any safe remedies?",
      "How do I know if I'm depressed?",
      "What can I do for a panic attack?"
    ]
  },
  {
    category: "Lifestyle",
    icon: "🏃‍♀️",
    prompts: [
      "What's a healthy diet for weight loss?",
      "How much exercise do I need per week?",
      "Is intermittent fasting safe?",
      "How can I lower my blood pressure naturally?"
    ]
  }
];

const FullScreenChat = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Only scroll when new messages are added, not on every render
  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length]);

  // Hide prompts after first message
  useEffect(() => {
    if (messages.length > 1) {
      setShowPrompts(false);
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      await sendMessage(input);
      setInput('');
      setShowPrompts(false);
    }
  };

  const handlePromptClick = async (prompt) => {
    setInput(prompt);
    setShowPrompts(false);
    await sendMessage(prompt);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fullscreen-chat-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fullscreen-chat"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="chat-header">
              <div className="header-top-bar">
                <div className="security-badges">
                  <span className="badge secure">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M12 7V5C12 2.79086 10.2091 1 8 1C5.79086 1 4 2.79086 4 5V7M8 10V12M3 15H13C13.5523 15 14 14.5523 14 14V8C14 7.44772 13.5523 7 13 7H3C2.44772 7 2 7.44772 2 8V14C2 14.5523 2.44772 15 3 15Z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Secure
                  </span>
                  <span className="badge anonymous">Anonymous</span>
                  <span className="badge instant">Instant Guidance</span>
                </div>
                <div className="emergency-notice">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 5V8M8 11H8.01M14.07 11L8.54 2C8.24 1.52 7.76 1.52 7.46 2L1.93 11C1.63 11.48 1.88 12 2.47 12H13.53C14.12 12 14.37 11.48 14.07 11Z"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  If this is an emergency, call 911 or go to the nearest emergency room
                </div>
              </div>
              <div className="header-content">
                <div className="header-info">
                  <h2>OpenMedicine AI Health Companion</h2>
                </div>
                <div className="header-actions">
                  {messages.length > 1 && (
                    <div className="export-buttons">
                      <button
                        className="export-btn"
                        onClick={() => exportChatAsDocx(messages)}
                        title="Download as Word Document"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2V10M10 10L13 7M10 10L7 7M3 12V16C3 17.1046 3.89543 18 5 18H15C16.1046 18 17 17.1046 17 16V12"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download
                      </button>
                      <button
                        className="export-btn text"
                        onClick={() => exportChatAsText(messages)}
                        title="Download as Text"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M7 18V6M7 6L4 9M7 6L10 9M13 2V14M13 14L10 11M13 14L16 11"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                  <button className="close-button" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="chat-body">
              {showPrompts && messages.length <= 1 ? (
                <div className="prompts-container">
                  <h3 className="prompts-title">What can I help you with today?</h3>
                  <p className="prompts-subtitle">Select a topic or type your own question below</p>

                  <div className="prompt-categories">
                    {samplePrompts.map((category, idx) => (
                      <div key={idx} className="prompt-category">
                        <button
                          className={`category-header ${selectedCategory === idx ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(selectedCategory === idx ? null : idx)}
                        >
                          <span className="category-icon">{category.icon}</span>
                          <span className="category-name">{category.category}</span>
                          <svg
                            className={`chevron ${selectedCategory === idx ? 'rotated' : ''}`}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                          >
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>

                        <AnimatePresence>
                          {selectedCategory === idx && (
                            <motion.div
                              className="prompt-list"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {category.prompts.map((prompt, promptIdx) => (
                                <button
                                  key={promptIdx}
                                  className="prompt-button"
                                  onClick={() => handlePromptClick(prompt)}
                                >
                                  {prompt}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="messages-area">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      onFollowUpClick={handlePromptClick}
                    />
                  ))}
                  {isLoading && (
                    <div className="chat-message ai">
                      <div className="message-bubble">
                        <div className="typing-indicator">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="chat-footer">
              <form className="chat-form" onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your health question here..."
                  disabled={isLoading}
                  className="chat-input"
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={isLoading || !input.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2 10L17 2L13 18L11 11L2 10Z" fill="currentColor"/>
                  </svg>
                </button>
              </form>

              <div className="footer-disclaimer">
                <p>Remember: This is for informational purposes only. Always consult healthcare professionals for medical advice.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenChat;