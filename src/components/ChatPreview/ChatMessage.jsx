import React from 'react';
import { motion } from 'framer-motion';

const ChatMessage = ({ message }) => {
  return (
    <motion.div 
      className={`chat-message ${message.role}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="message-bubble">
        {message.content}
      </div>
    </motion.div>
  );
};

export default ChatMessage;