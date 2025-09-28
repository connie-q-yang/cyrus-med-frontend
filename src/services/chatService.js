class ChatService {
  async sendMessage(message, conversationHistory = []) {
    try {
      // For local development, check if Netlify Dev is running
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // Use appropriate endpoint
      let endpoint;
      if (isLocal) {
        // Try Netlify Dev first, fallback to direct API if not available
        endpoint = 'http://localhost:8888/.netlify/functions/chat';
      } else {
        // Production - use relative path
        endpoint = '/.netlify/functions/chat';
      }

      console.log('Sending request to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data.response;
    } catch (error) {
      console.error('Error calling chat service:', error);

      // Check if it's a network error (likely means Netlify Dev isn't running)
      if (error.message.includes('fetch')) {
        return "I'm having trouble connecting to the chat service. If you're developing locally, make sure to run 'netlify dev' instead of 'npm start' to enable serverless functions.";
      }

      // Return a more helpful error message
      return "I apologize, but I encountered an error processing your request. Please try again. If the problem persists, please check your Azure OpenAI configuration.";
    }
  }

  formatResponse(response) {
    // Medical disclaimer
    const disclaimer = '\n\n*Remember: This information is for educational purposes only and should not replace professional medical advice. If you have serious concerns, please consult with a healthcare provider.*';

    // Only add disclaimer if it's not already in the response
    if (!response.includes('educational purposes') && !response.includes('medical advice')) {
      return response + disclaimer;
    }
    return response;
  }
}

const chatService = new ChatService();
export default chatService;