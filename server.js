const express = require('express');
const cors = require('cors');
const { AzureOpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// System prompt for medical AI assistant
const SYSTEM_PROMPT = `You are Cyrus, an AI medical assistant. You provide helpful, accurate, and empathetic medical information while always reminding users that you're not a replacement for professional medical care. Be conversational, caring, and clear in your responses. Keep responses concise but informative.

Important guidelines:
- Always remind users to consult healthcare professionals for serious concerns
- Be empathetic and understanding
- Provide evidence-based information when possible
- Avoid definitive diagnoses
- Suggest when emergency care might be needed`;

// Chat endpoint
app.post('/.netlify/functions/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if environment variables are set
    if (!process.env.REACT_APP_AZURE_OPENAI_API_KEY) {
      console.error('Missing REACT_APP_AZURE_OPENAI_API_KEY');
      return res.status(500).json({
        error: 'Azure OpenAI API key is not configured. Please check your .env file.'
      });
    }

    console.log('Initializing Azure OpenAI client...');

    // Initialize Azure OpenAI with configuration from environment
    const client = new AzureOpenAI({
      apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
      endpoint: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.REACT_APP_AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
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

    res.json({ response: finalResponse });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    console.error('Error details:', error.message);

    res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Local development server running on http://localhost:${PORT}`);
  console.log(`Chat endpoint: http://localhost:${PORT}/.netlify/functions/chat`);
});