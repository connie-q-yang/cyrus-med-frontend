import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '../ChatPreview/ChatMessage';
import useChat from '../../hooks/useChat';
import { exportChatAsDocx, exportChatAsText } from '../../utils/exportChat';
import { trackDemoAction, trackChatMetrics, trackButtonClick } from '../../utils/analytics';
import './FullScreenChat.css';

const samplePrompts = [
  {
    category: "Period & Cycle",
    icon: "🌸",
    prompts: [
      "My period is 2 weeks late, what could it mean?",
      "I have severe cramps, is this normal?",
      "My cycle is irregular, should I be concerned?",
      "I'm spotting between periods, what does this mean?"
    ]
  },
  {
    category: "Pregnancy & Fertility",
    icon: "🤰",
    prompts: [
      "Could I be pregnant? What are the early signs?",
      "I'm trying to conceive, when should I test?",
      "Is this discharge normal during pregnancy?",
      "I had a miscarriage, when can I try again?"
    ]
  },
  {
    category: "Birth Control",
    icon: "💊",
    prompts: [
      "Which birth control is right for me?",
      "I missed a pill, what should I do?",
      "Are these side effects from my IUD normal?",
      "How do I switch birth control methods safely?"
    ]
  },
  {
    category: "Hormonal Health",
    icon: "⚖️",
    prompts: [
      "What are signs of PCOS?",
      "I think I have a hormonal imbalance, what now?",
      "Is this a thyroid problem?",
      "What are normal hormone levels for my age?"
    ]
  },
  {
    category: "Menopause & Aging",
    icon: "🌺",
    prompts: [
      "Am I starting menopause? What are the signs?",
      "How do I manage hot flashes?",
      "Is HRT right for me?",
      "Why is my libido changing?"
    ]
  },
  {
    category: "Sexual Health",
    icon: "❤️",
    prompts: [
      "Is this STI symptom serious?",
      "Why does sex hurt sometimes?",
      "How do I talk to my partner about testing?",
      "Is this vaginal discharge normal?"
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
  const sessionStartRef = useRef(null);
  const messageCountRef = useRef(0);

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

  // Focus input when opened and track session start
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      // Track demo opened
      trackDemoAction('demo_opened');
      sessionStartRef.current = Date.now();
      messageCountRef.current = 0;
    } else if (sessionStartRef.current) {
      // Track session metrics when closing
      const sessionDuration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      trackChatMetrics({
        messageCount: messageCountRef.current,
        duration: sessionDuration,
        topicCount: Math.ceil(messageCountRef.current / 2)
      });
      sessionStartRef.current = null;
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      // Track message sent (not the content)
      trackDemoAction('message_sent', {
        messageNumber: messageCountRef.current + 1,
        inputMethod: 'manual'
      });
      messageCountRef.current++;

      await sendMessage(input);
      setInput('');
      setShowPrompts(false);
    }
  };

  const handlePromptClick = async (prompt) => {
    // Track prompt usage (category, not the actual prompt)
    const category = samplePrompts.find(cat =>
      cat.prompts.includes(prompt)
    )?.category || 'unknown';

    trackDemoAction('prompt_selected', {
      category: category,
      messageNumber: messageCountRef.current + 1,
      inputMethod: 'prompt'
    });
    messageCountRef.current++;

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
                        onClick={() => {
                          trackButtonClick('export_docx', 'demo_chat');
                          exportChatAsDocx(messages);
                        }}
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
                        onClick={() => {
                          trackButtonClick('export_text', 'demo_chat');
                          exportChatAsText(messages);
                        }}
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