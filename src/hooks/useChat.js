import { useState, useCallback } from 'react';
import chatService from '../services/chatService';

// Generate contextual follow-up questions to encourage engagement
const generateFollowUpQuestions = (aiResponse, exchangeCount) => {
  const lowerResponse = aiResponse.toLowerCase();

  // If SOAP note is provided (after 4-5 exchanges), encourage beta signup
  if (lowerResponse.includes('subjective:') || lowerResponse.includes('s:') || exchangeCount >= 4) {
    return [
      "Get priority access to OpenMedicine",
      "Schedule a consultation",
      "Join the beta waitlist"
    ];
  }

  // During information gathering phase, don't show follow-ups to maintain focus
  if (exchangeCount < 3) {
    return [];
  }

  // After initial exchanges, encourage beta signup
  return [
    "Get personalized care plan",
    "Join beta for full access",
    "Track symptoms over time"
  ];
};

const useChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hi, I'm OpenMedicine, your personal AI health companion. Can you tell me what's going on today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content) => {
    // Add user message
    const userMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Convert messages to Azure OpenAI format (including the new user message)
      const conversationHistory = updatedMessages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      }));

      // Get AI response (medical disclaimer is already added in the service/function)
      const aiResponse = await chatService.sendMessage(content, conversationHistory);

      // Calculate exchange count based on updated messages
      const exchangeCount = Math.floor(updatedMessages.length / 2);

      // Generate follow-up questions based on the topic and exchange count
      const followUpQuestions = generateFollowUpQuestions(aiResponse, exchangeCount);

      // Add AI response with follow-up questions
      setMessages(prev => [...prev, {
        role: 'ai',
        content: aiResponse,
        followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'I apologize, but I encountered an error processing your request. Please try again. If the problem persists, please check your Azure OpenAI configuration.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([{
      role: 'ai',
      content: "Hi, I'm OpenMedicine, your personal AI health companion. Can you tell me what's going on today?"
    }]);
  }, []);

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading
  };
};

export default useChat;