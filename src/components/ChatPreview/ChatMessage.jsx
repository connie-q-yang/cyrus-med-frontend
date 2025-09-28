import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatMessage.css';

const ChatMessage = ({ message, onFollowUpClick }) => {
  const isAI = message.role === 'ai';

  return (
    <motion.div
      className={`chat-message ${message.role}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="message-bubble">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom rendering for markdown elements
            strong: ({children}) => <strong className="message-bold">{children}</strong>,
            em: ({children}) => <em className="message-italic">{children}</em>,
            ul: ({children}) => <ul className="message-list">{children}</ul>,
            ol: ({children}) => <ol className="message-list ordered">{children}</ol>,
            li: ({children}) => <li className="message-list-item">{children}</li>,
            p: ({children}) => <p className="message-paragraph">{children}</p>,
            blockquote: ({children}) => <blockquote className="message-quote">{children}</blockquote>,
            code: ({inline, children}) =>
              inline
                ? <code className="message-code-inline">{children}</code>
                : <pre className="message-code-block"><code>{children}</code></pre>
          }}
        >
          {message.content}
        </ReactMarkdown>

        {isAI && message.followUpQuestions && (
          <div className="follow-up-section">
            <p className="follow-up-prompt">Learn more:</p>
            <div className="follow-up-questions">
              {message.followUpQuestions.map((question, idx) => (
                <button
                  key={idx}
                  className="follow-up-button"
                  onClick={() => onFollowUpClick && onFollowUpClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;