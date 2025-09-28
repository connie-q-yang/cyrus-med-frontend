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
      </motion.div>
    </section>
  );
};

export default ChatPreview;