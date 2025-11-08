import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useDashboardChat } from '../../hooks/useDashboardChat';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import SymptomLogModal from './SymptomLogModal';
import SymptomJournal from './SymptomJournal';
import './Dashboard.css';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'journal'
  const chatMode = 'dr-luna'; // Using Dr. Luna mode for personalized menopause guidance
  const { messages, isLoading, sendMessage } = useDashboardChat(chatMode);
  const [inputValue, setInputValue] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSymptomLogOpen, setIsSymptomLogOpen] = useState(false);
  const [moodScore, setMoodScore] = useState(0);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  // Calculate mood score from journal entries
  useEffect(() => {
    const calculateMoodScore = () => {
      try {
        const localEntries = JSON.parse(localStorage.getItem('symptom_journal') || '[]');
        const score = localEntries.reduce((total, entry) => {
          if (entry.mood === 'happy') return total + 1;
          if (entry.mood === 'sad') return total - 1;
          return total; // neutral = 0
        }, 0);
        setMoodScore(score);
      } catch (error) {
        console.error('Error calculating mood score:', error);
      }
    };

    calculateMoodScore();
    // Recalculate when modal closes (after saving)
    if (!isSymptomLogOpen) {
      calculateMoodScore();
    }
  }, [isSymptomLogOpen]);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) < 120;

    setShowScrollButton(!isNearBottom);
    isUserScrollingRef.current = !isNearBottom;
  };

  useEffect(() => {
    // Auto-scroll to bottom on new messages if user is near bottom
    if (messagesContainerRef.current && !isUserScrollingRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleQuickAction = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
    // Auto-send the question
    setTimeout(() => {
      sendMessage(question);
      setInputValue('');
    }, 100);
  };

  const userName = user?.user_metadata?.preferred_name ||
                   user?.user_metadata?.first_name ||
                   user?.email?.split('@')[0] ||
                   'there';

  return (
    <div className="jarvis-dashboard">
      {/* Header */}
      <div className="jarvis-header">
        <div className="jarvis-brand">
          <div className="jarvis-logo-pulse"></div>
          <h1>OpenMedicine AI</h1>
          {chatMode === 'dr-luna' && activeTab === 'chat' && (
            <span className="dr-luna-badge">Dr. Luna</span>
          )}
          <div className="mood-score-badge" title="Your wellness score based on mood tracking">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className={moodScore >= 0 ? 'score-positive' : 'score-negative'}>
              {moodScore > 0 ? '+' : ''}{moodScore}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="jarvis-tabs">
          <button
            className={`jarvis-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Chat</span>
          </button>
          <button
            className={`jarvis-tab ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Journal</span>
          </button>
        </div>

        <div className="jarvis-header-actions">
          {/* Action Buttons */}
          <button
            onClick={() => setIsSymptomLogOpen(true)}
            className="jarvis-action-button"
            title="Log Symptoms"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="action-button-text">Log Symptoms</span>
          </button>
          <button
            className="jarvis-action-button disabled"
            title="Available in future updates"
            disabled
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="action-button-text">Schedule</span>
            <div className="coming-soon-badge-header">Soon</div>
          </button>

          {/* User Section */}
          <div className="jarvis-user-section">
            <span className="jarvis-user-name">Welcome, {userName}</span>
            <button onClick={() => navigate('/profile')} className="jarvis-icon-button" title="Profile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button onClick={handleSignOut} className="jarvis-icon-button" title="Sign Out">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chat' ? (
        <div className="jarvis-chat-container">
        <div className="jarvis-messages-wrapper">
          <div
            className="jarvis-messages"
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`jarvis-message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                {message.role === 'assistant' && (
                  <div className="jarvis-avatar">
                    <div className="jarvis-avatar-pulse"></div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                )}
                <div className="jarvis-message-content">
                  <div className="jarvis-message-text">
                    {message.role === 'assistant' ? (
                      <div className="markdown-content">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                  <div className="jarvis-message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="jarvis-message ai-message">
                <div className="jarvis-avatar">
                  <div className="jarvis-avatar-pulse pulsing"></div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
                <div className="jarvis-message-content">
                  <div className="jarvis-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              className="scroll-to-bottom"
              onClick={() => {
                scrollToBottom('smooth');
                isUserScrollingRef.current = false;
              }}
              aria-label="Scroll to bottom"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="7 13 12 18 17 13" />
                <polyline points="7 6 12 11 17 6" />
              </svg>
            </button>
          )}

          {/* FAQ Quick Questions (shown for first message) */}
          {messages.length === 1 && !isLoading && (
            <div className="jarvis-quick-actions">
              <div className="quick-actions-header">
                <span>Frequently Asked Questions:</span>
              </div>
              <button
                className="jarvis-quick-btn"
                onClick={() => handleQuickAction('What are the most common menopause symptoms?')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                What are the most common menopause symptoms?
              </button>
              <button
                className="jarvis-quick-btn"
                onClick={() => handleQuickAction('How can I manage hot flashes naturally?')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
                </svg>
                How can I manage hot flashes naturally?
              </button>
              <button
                className="jarvis-quick-btn"
                onClick={() => handleQuickAction('Should I consider hormone replacement therapy?')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                Should I consider hormone replacement therapy?
              </button>
              <button
                className="jarvis-quick-btn"
                onClick={() => handleQuickAction('What lifestyle changes can help with menopause symptoms?')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                What lifestyle changes can help with menopause symptoms?
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="jarvis-input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="jarvis-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="jarvis-send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
      ) : (
        <SymptomJournal onOpenLogModal={() => setIsSymptomLogOpen(true)} />
      )}

      {/* Symptom Log Modal */}
      <SymptomLogModal
        isOpen={isSymptomLogOpen}
        onClose={() => setIsSymptomLogOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
