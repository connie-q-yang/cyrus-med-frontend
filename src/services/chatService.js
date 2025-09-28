import { AzureOpenAI } from 'openai';

// Initialize Azure OpenAI with configuration from environment
const client = new AzureOpenAI({
    apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY,  // <-- Make sure this is 'apiKey'
    endpoint: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT,
    apiVersion: process.env.REACT_APP_AZURE_OPENAI_API_VERSION || "2024-12-01-preview",
    dangerouslyAllowBrowser: true
  });  

// System prompt for medical AI assistant
const SYSTEM_PROMPT = `You are Cyrus, an AI medical assistant. You provide helpful, accurate, and empathetic medical information while always reminding users that you're not a replacement for professional medical care. Be conversational, caring, and clear in your responses. Keep responses concise but informative. 

Important guidelines:
- Always remind users to consult healthcare professionals for serious concerns
- Be empathetic and understanding
- Provide evidence-based information when possible
- Avoid definitive diagnoses
- Suggest when emergency care might be needed`;

class ChatService {
  async sendMessage(message, conversationHistory = []) {
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await client.chat.completions.create({
        messages: messages,
        model: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1',
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Azure OpenAI:', error);
      
      // More specific error handling for Azure
      if (error.status === 401) {
        return "Authentication error. Please check your Azure OpenAI API key configuration.";
      } else if (error.status === 404) {
        return "Deployment not found. Please verify your Azure OpenAI deployment name.";
      } else if (error.status === 429) {
        return "Rate limit exceeded. Please try again in a moment.";
      } else if (error.message?.includes('API key') || error.message?.includes('api_key')) {
        return "Please configure your Azure OpenAI API key in the .env file to enable AI responses.";
      }
      
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  }

  // Method to validate health-related queries
  isHealthRelated(message) {
    const healthKeywords = [
      'pain', 'ache', 'symptom', 'medicine', 'doctor', 'health',
      'sick', 'illness', 'disease', 'treatment', 'therapy', 'medication',
      'fever', 'cold', 'flu', 'covid', 'vaccine', 'injection',
      'prescription', 'diagnosis', 'condition', 'injury', 'bleeding'
    ];
    
    const lowerMessage = message.toLowerCase();
    return healthKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Format medical response with disclaimers
  formatMedicalResponse(response) {
    const disclaimer = "\n\n*Remember: This information is for educational purposes only and should not replace professional medical advice. If you're experiencing serious symptoms, please contact a healthcare provider or emergency services.*";
    
    // Only add disclaimer if it's not already in the response
    if (!response.includes('educational purposes') && !response.includes('medical advice')) {
      return response + disclaimer;
    }
    return response;
  }
}

export default new ChatService();