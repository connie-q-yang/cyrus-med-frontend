import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ChatMessage from './ChatMessage';
import useChat from '../../hooks/useChat';
import './ChatPreview.css';

const ChatPreview = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      await sendMessage(input);
      setInput('');
    }
  };

  return (
    <section className="chat-preview" id="chat-section" ref={ref}>
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2>Experience Cyrus in Action</h2>
        <p>See how natural medical conversations can be</p>
      </motion.div>
      
      <motion.div 
        className="chat-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="messages-container">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <div className="chat-message ai">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Cyrus anything about your health..."
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading}>
            Send
          </button>
        </form>

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
    </section>
  );
};

export default ChatPreview;