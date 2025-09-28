const { AzureOpenAI } = require('openai');

// System prompt for medical AI assistant
const SYSTEM_PROMPT = `You are Cyrus, an AI medical assistant. You provide helpful, accurate, and empathetic medical information while always reminding users that you're not a replacement for professional medical care. Be conversational, caring, and clear in your responses. Keep responses concise but informative.

Important guidelines:
- Always remind users to consult healthcare professionals for serious concerns
- Be empathetic and understanding
- Provide evidence-based information when possible
- Avoid definitive diagnoses
- Suggest when emergency care might be needed`;

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Check if environment variables are set
    if (!process.env.REACT_APP_AZURE_OPENAI_API_KEY) {
      console.error('Missing REACT_APP_AZURE_OPENAI_API_KEY');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Azure OpenAI API key is not configured. Please set REACT_APP_AZURE_OPENAI_API_KEY in Netlify environment variables.'
        }),
      };
    }

    if (!process.env.REACT_APP_AZURE_OPENAI_ENDPOINT) {
      console.error('Missing REACT_APP_AZURE_OPENAI_ENDPOINT');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Azure OpenAI endpoint is not configured. Please set REACT_APP_AZURE_OPENAI_ENDPOINT in Netlify environment variables.'
        }),
      };
    }

    const { message, conversationHistory } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    console.log('Initializing Azure OpenAI client...');

    // Initialize Azure OpenAI with configuration from environment
    const client = new AzureOpenAI({
      apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
      endpoint: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.REACT_APP_AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
      dangerouslyAllowBrowser: false, // We're in Node.js environment
    });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    console.log('Sending request to Azure OpenAI...');

    const response = await client.chat.completions.create({
      messages: messages,
      model: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const responseContent = response.choices[0].message.content;

    // Medical disclaimer
    const disclaimer = '\n\n*Remember: This information is for educational purposes only and should not replace professional medical advice. If you have serious concerns, please consult with a healthcare provider.*';

    // Only add disclaimer if it's not already in the response
    const finalResponse = responseContent.includes('educational purposes') || responseContent.includes('medical advice')
      ? responseContent
      : responseContent + disclaimer;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: finalResponse }),
    };
  } catch (error) {
    console.error('Error in chat function:', error);
    console.error('Error details:', error.message);

    // Check for specific error types
    if (error.message && error.message.includes('401')) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Authentication failed. Please check your Azure OpenAI API key configuration.',
          details: error.message
        }),
      };
    }

    if (error.message && error.message.includes('404')) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Azure OpenAI endpoint or deployment not found. Please check your configuration.',
          details: error.message
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process chat request. Please check the server logs for more details.',
        details: error.message
      }),
    };
  }
};