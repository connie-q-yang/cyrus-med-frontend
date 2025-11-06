import { useState, useCallback } from 'react';
import chatService from '../services/chatService';

// Generate contextual follow-up questions to encourage engagement
const generateFollowUpQuestions = (aiResponse, exchangeCount) => {
  const lowerResponse = aiResponse.toLowerCase();

  // If SOAP/H&P note is provided (after 8-10 exchanges), encourage download and beta signup
  if (lowerResponse.includes('**s (subjective):**') ||
      lowerResponse.includes('s (subjective):') ||
      lowerResponse.includes('soap note') ||
      lowerResponse.includes('**chief complaint:**') ||
      lowerResponse.includes('chief complaint:') ||
      lowerResponse.includes('h&p note') ||
      (exchangeCount >= 8 && (lowerResponse.includes('subjective') || lowerResponse.includes('chief complaint')))) {
    return [
      "Download my clinical note",
      "Get priority access to OpenMedicine",
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
      content: "Hi, I'm Dr. Luna, your AI menopause specialist. I'm here to help you understand your symptoms and find relief. What menopause symptoms are you experiencing?"
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
      content: "Hi, I'm Dr. Luna, your AI menopause specialist. I'm here to help you understand your symptoms and find relief. What menopause symptoms are you experiencing?"
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