import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [hasSavedChat, setHasSavedChat] = useState(false);
  const [savedChatInfo, setSavedChatInfo] = useState(null);

  useEffect(() => {
    // Check if there's a saved demo chat
    const savedChat = localStorage.getItem('savedDemoChat');
    if (savedChat) {
      try {
        const chatData = JSON.parse(savedChat);
        const messages = chatData.messages || [];

        // Get last user message for preview
        const lastUserMessage = messages
          .filter(m => m.role === 'user')
          .slice(-1)[0];

        setHasSavedChat(true);
        setSavedChatInfo({
          messageCount: messages.length,
          timestamp: chatData.timestamp,
          source: chatData.source,
          lastMessage: lastUserMessage?.content?.substring(0, 60) || 'Your conversation'
        });
        toast.success('Welcome! Your demo chat has been saved.', {
          autoClose: 5000
        });
      } catch (error) {
        console.error('Error parsing saved chat:', error);
      }
    }
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const handleContinueChat = () => {
    // Navigate to chat - useChat.js will automatically restore saved chat
    navigate('/chat');
  };

  const handleStartNewChat = () => {
    // Clear saved demo chat before starting new conversation
    localStorage.removeItem('savedDemoChat');
    toast.success('Starting fresh conversation!');
    navigate('/chat');
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-brand">
          <h1>OpenMedicine</h1>
          <p>Your AI Menopause Specialist</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/profile')} className="profile-button">
            Profile
          </button>
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome back, {user?.user_metadata?.preferred_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there'}!</h2>
          <p className="user-email">{user?.email}</p>
        </div>

        <div className="dashboard-grid">
          {hasSavedChat && (
            <div className="dashboard-card featured">
              <div className="card-badge">Saved Conversation</div>
              <div className="card-icon">💬</div>
              <h3>Continue Your Chat</h3>
              {savedChatInfo && (
                <div className="chat-preview">
                  <p className="chat-preview-text">"{savedChatInfo.lastMessage}{savedChatInfo.lastMessage.length >= 60 ? '...' : ''}"</p>
                </div>
              )}
              {savedChatInfo && (
                <div className="chat-meta">
                  <span className="chat-meta-item">
                    📝 {savedChatInfo.messageCount} messages
                  </span>
                  <span className="chat-meta-item">
                    🕐 {formatTimestamp(savedChatInfo.timestamp)}
                  </span>
                </div>
              )}
              <button className="card-button" onClick={handleContinueChat}>
                Continue Conversation
              </button>
            </div>
          )}

          <div className="dashboard-card">
            <div className="card-icon">💬</div>
            <h3>Chat with Dr. Luna</h3>
            <p>Get instant help with your menopause symptoms</p>
            <button className="card-button" onClick={hasSavedChat ? handleStartNewChat : handleContinueChat}>
              {hasSavedChat ? 'Start New Chat' : 'Start Chat'}
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Symptom Tracker</h3>
            <p>Track your symptoms and identify patterns</p>
            <button className="card-button" onClick={() => toast.info('Coming soon!')}>
              Track Symptoms
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>My Health Notes</h3>
            <p>View and export your health summaries</p>
            <button className="card-button" onClick={() => toast.info('Coming soon!')}>
              View Notes
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Profile Settings</h3>
            <p>Manage your account and preferences</p>
            <button className="card-button" onClick={() => toast.info('Coming soon!')}>
              Settings
            </button>
          </div>
        </div>

        <div className="info-section">
          <h3>Quick Start Guide</h3>
          <ol>
            <li>Chat with Dr. Luna to discuss your symptoms</li>
            <li>Track your symptoms daily to identify patterns</li>
            <li>Export your health notes to share with your doctor</li>
            <li>Get personalized insights and treatment recommendations</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
