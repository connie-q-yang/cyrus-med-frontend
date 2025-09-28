import { useState, useCallback } from 'react';
import chatService from '../services/chatService';

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

      // Get AI response
      let aiResponse = await chatService.sendMessage(content, conversationHistory);
      
      // Add medical disclaimer for health-related queries
      if (chatService.isHealthRelated(content)) {
        aiResponse = chatService.formatMedicalResponse(aiResponse);
      }
      
      // Add AI response
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
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