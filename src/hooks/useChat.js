import { useState, useCallback } from 'react';
import chatService from '../services/chatService';

// Generate contextual follow-up questions to encourage engagement
const generateFollowUpQuestions = (userMessage, aiResponse) => {
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();

  // Common follow-up questions based on context
  if (lowerMessage.includes('headache') || lowerResponse.includes('headache')) {
    return [
      "How can I prevent headaches?",
      "When should I see a doctor?",
      "What are migraine symptoms?"
    ];
  }

  if (lowerMessage.includes('flu') || lowerMessage.includes('cold')) {
    return [
      "How long do symptoms last?",
      "What medications can help?",
      "How can I prevent spreading it?"
    ];
  }

  if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart')) {
    return [
      "What are heart attack symptoms?",
      "Should I call 911?",
      "What tests might I need?"
    ];
  }

  if (lowerMessage.includes('anxiety') || lowerMessage.includes('stress')) {
    return [
      "What are calming techniques?",
      "When to seek therapy?",
      "Are there natural remedies?"
    ];
  }

  if (lowerMessage.includes('medication') || lowerMessage.includes('prescription')) {
    return [
      "What about side effects?",
      "Can I take with other meds?",
      "What if I miss a dose?"
    ];
  }

  // Default follow-up questions to encourage beta signup
  return [
    "Schedule a video consultation",
    "Get personalized health plan",
    "Track my symptoms over time"
  ];
};

const useChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I'm Cyrus, your AI medical assistant. I can help answer health questions, explain symptoms, and provide general medical information. How can I help you today?\n\nPlease note: I'm here to provide information and support, but always consult with healthcare professionals for medical advice, diagnosis, or treatment."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content) => {
    // Add user message
    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Convert messages to Azure OpenAI format
      const conversationHistory = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      }));

      // Get AI response (medical disclaimer is already added in the service/function)
      const aiResponse = await chatService.sendMessage(content, conversationHistory);

      // Generate follow-up questions based on the topic
      const followUpQuestions = generateFollowUpQuestions(content, aiResponse);

      // Add AI response with follow-up questions
      setMessages(prev => [...prev, {
        role: 'ai',
        content: aiResponse,
        followUpQuestions: followUpQuestions
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
      content: "Hello! I'm Cyrus, your AI medical assistant. I can help answer health questions, explain symptoms, and provide general medical information. How can I help you today?\n\nPlease note: I'm here to provide information and support, but always consult with healthcare professionals for medical advice, diagnosis, or treatment."
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