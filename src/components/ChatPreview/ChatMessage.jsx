import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-toastify';
import { addToWaitlist } from '../../lib/supabase';
import { trackWaitlistSignup } from '../../utils/analytics';
import './ChatMessage.css';

const ChatMessage = ({ message, onFollowUpClick, isFinalSummary, onJoinWaitlist, onScheduleConsultation, hasUnlockedSummary, onEmailUnlock }) => {
  const isAI = message.role === 'ai' || message.role === 'assistant';
  const [activeTab, setActiveTab] = useState('summary');
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || isSubmitting) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addToWaitlist(emailInput);

      if (result.success) {
        // Send welcome email via Netlify Function
        fetch('/.netlify/functions/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: emailInput }),
        })
        .then(res => res.json())
        .then(data => {
          console.log('Email sent:', data);
        })
        .catch(err => {
          console.error('Email error:', err);
          // Don't show error to user as the signup was successful
        });

        // Track successful signup from demo chat
        trackWaitlistSignup(emailInput, 'demo_chat_unlock');

        toast.success(result.message || 'Welcome to OpenMedicine! Your summary is now unlocked.');

        // Unlock the summary
        onEmailUnlock(emailInput);
      } else {
        toast.info(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      toast.error('Unable to unlock summary. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if this message needs to be gated
  const shouldShowGate = isSummaryMessage && isFinalSummary && !hasUnlockedSummary;

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
                shouldShowGate ? (
                  <div className="email-gate">
                    <div className="gate-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h3 className="gate-title">Unlock Your AI Doctor Summary</h3>
                    <p className="gate-description">
                      Join our waitlist to see your personalized health summary and H&P note. Get early access when we launch!
                    </p>
                    <form className="gate-form" onSubmit={handleEmailSubmit}>
                      <input
                        type="email"
                        className="gate-email-input"
                        placeholder="Enter your email address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="submit"
                        className="gate-submit-button"
                        disabled={isSubmitting || !emailInput.trim()}
                      >
                        {isSubmitting ? 'Unlocking...' : 'Unlock Summary'}
                      </button>
                    </form>
                    <p className="gate-privacy">
                      🔒 We respect your privacy. No spam, ever.
                    </p>
                  </div>
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
                    {contentData.summary}
                  </ReactMarkdown>
                )
              )}

              {activeTab === 'hp' && (
                shouldShowGate ? (
                  <div className="email-gate">
                    <div className="gate-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h3 className="gate-title">Unlock H&P Note for Physicians</h3>
                    <p className="gate-description">
                      Join our waitlist to see your complete History & Physical note formatted for healthcare providers.
                    </p>
                    <form className="gate-form" onSubmit={handleEmailSubmit}>
                      <input
                        type="email"
                        className="gate-email-input"
                        placeholder="Enter your email address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="submit"
                        className="gate-submit-button"
                        disabled={isSubmitting || !emailInput.trim()}
                      >
                        {isSubmitting ? 'Unlocking...' : 'Unlock H&P Note'}
                      </button>
                    </form>
                    <p className="gate-privacy">
                      🔒 We respect your privacy. No spam, ever.
                    </p>
                  </div>
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
                    {contentData.hp}
                  </ReactMarkdown>
                )
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