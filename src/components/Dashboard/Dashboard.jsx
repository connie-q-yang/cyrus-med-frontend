import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useDashboardChat } from '../../hooks/useDashboardChat';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import './Dashboard.css';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [chatMode, setChatMode] = useState('diagnostic'); // 'diagnostic' or 'dr-luna'
  const { messages, isLoading, sendMessage } = useDashboardChat(chatMode);
  const [inputValue, setInputValue] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isUserScrollingRef = useRef(false);

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

  const handleQuickAction = (action) => {
    if (action === 'chat') {
      // Switch to Dr. Luna mode for personalized symptom chat
      setChatMode('dr-luna');
      setInputValue("I'd like to chat with you about my symptoms");
      inputRef.current?.focus();
    } else if (action === 'log') {
      setInputValue("I'd like to log my symptoms");
      inputRef.current?.focus();
    }
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
          {chatMode === 'dr-luna' && (
            <span className="dr-luna-badge">Dr. Luna</span>
          )}
        </div>
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

      {/* Main Chat Area */}
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

          {/* Quick Actions (shown for first message) */}
          {messages.length === 1 && !isLoading && (
            <div className="jarvis-quick-actions">
              <button
                className="jarvis-quick-btn"
                onClick={() => handleQuickAction('chat')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chat about symptoms
              </button>
              <button
                className="jarvis-quick-btn"
                onClick={() => handleQuickAction('log')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Log symptoms
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
    </div>
  );
};

export default Dashboard;
