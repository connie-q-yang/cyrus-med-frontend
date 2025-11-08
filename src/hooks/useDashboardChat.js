import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useDashboardChat = (chatMode = 'diagnostic') => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: chatMode === 'dr-luna'
        ? "Hello! I'm Dr. Luna, your personal menopause specialist. I've reviewed your profile and I'm here to help you navigate your menopause journey with evidence-based guidance. What would you like to discuss today?"
        : "Welcome to your personalized menopause AI doctor so you don't have to go through this alone. What would you like to do first? Chat with me or log some symptoms? I'm here to make you feel better and get the proper care and support you need.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile data for Dr. Luna mode
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || chatMode !== 'dr-luna') return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        setUserProfile(data);
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchUserProfile();
  }, [user, chatMode]);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    // Add user message
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history for API (exclude timestamps)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory,
          chatMode: chatMode,
          userProfile: chatMode === 'dr-luna' ? userProfile : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      // Add AI response
      const newAssistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');

      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, chatMode, userProfile]);

  const clearChat = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: chatMode === 'dr-luna'
        ? "Hello! I'm Dr. Luna, your personal menopause specialist. I've reviewed your profile and I'm here to help you navigate your menopause journey with evidence-based guidance. What would you like to discuss today?"
        : "Welcome to your personalized menopause AI doctor so you don't have to go through this alone. What would you like to do first? Chat with me or log some symptoms? I'm here to make you feel better and get the proper care and support you need.",
      timestamp: new Date()
    }]);
    setError(null);
  }, [chatMode]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  };
};
