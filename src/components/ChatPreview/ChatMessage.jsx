import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatMessage.css';

const ChatMessage = ({ message, onFollowUpClick, isFinalSummary, onJoinWaitlist, onScheduleConsultation }) => {
  const isAI = message.role === 'ai' || message.role === 'assistant';
  const [activeTab, setActiveTab] = useState('summary');

  // Check if this is a summary message (contains SOAP note, H&P note, or summary indicators)
  const isSummaryMessage = isAI && (
    message.content.includes('Your Symptoms:') ||
    message.content.includes('What This Could Mean:') ||
    message.content.includes('**Your Symptoms:**') ||
    message.content.includes('**What This Could Mean:**') ||
    message.content.includes('**SOAP NOTE') ||
    message.content.includes('SOAP NOTE') ||
    message.content.includes('**Chief Complaint:**') ||
    message.content.includes('Chief Complaint:') ||
    message.content.includes('**History of Present Illness') ||
    message.content.includes('**Assessment:**') ||
    message.content.includes('Assessment:')
  );

  // Split content into AI Doctor Summary and H&P Note
  const splitContent = () => {
    const content = message.content;

    // Only process AI messages
    if (!isAI) {
      return {
        hasTabs: false,
        fullContent: content
      };
    }

    // Look for H&P note section markers
    // We need to find where the H&P section actually starts (not just mentioned in intro)

    let splitIndex = -1;

    // Strategy: Look for "History and Physical" text that appears after significant content
    // and is preceded by newlines (indicating it's a section header, not inline text)

    // First, try to find patterns with newlines before them (most reliable)
    const newlinePatterns = [
      '\n\nHistory and Physical Note (Physician H&P)',
      '\n\nHistory and Physical Note for Physicians',
      '\n\n**History and Physical Note for Physicians',
      '\nHistory and Physical Note for Physicians',
      '\n\nH&P Note for Physicians',
      '\nH&P Note for Physicians'
    ];

    for (const pattern of newlinePatterns) {
      const index = content.indexOf(pattern);
      if (index !== -1 && index > 500) { // Ensure there's substantial content before
        splitIndex = index;
        break;
      }
    }

    // If no match yet, look for the standalone pattern
    if (splitIndex === -1) {
      const standalonePatterns = [
        'History and Physical Note (Physician H&P)',
        'History and Physical Note for Physicians:'
      ];

      for (const pattern of standalonePatterns) {
        const index = content.indexOf(pattern);
        if (index !== -1 && index > 500) {
          splitIndex = index;
          break;
        }
      }
    }

    // If we found the H&P section and there's content before it, show tabs
    if (splitIndex !== -1) {
      // Trim any leading newlines from the split point for cleaner display
      const summaryContent = content.substring(0, splitIndex).trim();
      const hpContent = content.substring(splitIndex).trim();

      return {
        hasTabs: true,
        summary: summaryContent,
        hp: hpContent
      };
    }

    return {
      hasTabs: false,
      fullContent: content
    };
  };

  const contentData = splitContent();

  return (
    <motion.div
      className={`chat-message ${message.role}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="message-bubble">
        {contentData.hasTabs ? (
          <>
            {/* Tabs Navigation */}
            <div className="summary-tabs">
              <button
                className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                AI Doctor Summary
              </button>
              <button
                className={`tab-button ${activeTab === 'hp' ? 'active' : ''}`}
                onClick={() => setActiveTab('hp')}
              >
                H&P Note for Physicians
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'summary' && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
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
                  {contentData.summary}
                </ReactMarkdown>
              )}

              {activeTab === 'hp' && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
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
                  {contentData.hp}
                </ReactMarkdown>
              )}
            </div>
          </>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
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
            {contentData.fullContent}
          </ReactMarkdown>
        )}

        {/* Show CTAs only on final summary message */}
        {isSummaryMessage && isFinalSummary && (
          <div className="final-cta-section">
            <p className="cta-prompt">What would you like to do next?</p>
            <div className="cta-buttons">
              <button
                className="cta-button primary"
                onClick={onScheduleConsultation}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V16C17 17.1046 16.1046 18 15 18H5C3.89543 18 3 17.1046 3 16V6C3 4.89543 3.89543 4 5 4Z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Schedule a Consultation
              </button>
              <button
                className="cta-button secondary"
                onClick={onJoinWaitlist}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16 7C16 9.20914 12.4183 11 8 11C3.58172 11 0 9.20914 0 7M16 7C16 4.79086 12.4183 3 8 3C3.58172 3 0 4.79086 0 7M16 7V13C16 15.2091 12.4183 17 8 17C3.58172 17 0 15.2091 0 13V7"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Join Waitlist
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;