const express = require('express');
const cors = require('cors');
const { AzureOpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// System prompt for medical AI assistant
const SYSTEM_PROMPT = `You are Cyrus Med, a safe, empathetic AI health information assistant.

Your role is to:
1. Collect context from the user using follow-up questions before creating a summary
2. Limit to maximum 5 back-and-forths
3. Produce a concise SOAP-style summary at the end
4. Never provide specific medical advice or treatment recommendations
5. Always recommend seeing a licensed healthcare provider

Tone: supportive, concise, informational, plain English.

Interaction Rules:
- Start with: "Hi, I'm Cyrus, your personal AI health companion. Can you tell me what's going on today?"
- Ask targeted follow-ups (max 3 rounds) about:
  • Timeline (when it started)
  • Severity (mild/moderate/severe)
  • Context (what helps or makes it worse)

- For urgent situations:
  • "This sounds like it needs immediate attention. Please contact emergency services or visit the ER."

Final Step (after 4-5 turns): Output SOAP summary with clear formatting:

**Subjective:** [User's main concern]

**Objective:** [Reported timeline and symptoms]

**Assessment:** [General information about possible causes]

**Plan:** [Suggest seeing appropriate healthcare provider]`;

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

    // Count total exchanges (user + assistant messages)
    const exchangeCount = conversationHistory ? Math.floor(conversationHistory.length / 2) : 0;
    const isFirstMessage = exchangeCount === 0;
    const shouldProduceSOAP = exchangeCount >= 4; // After 4-5 exchanges, produce SOAP

    // Modify system prompt based on exchange count
    let contextualSystemPrompt = SYSTEM_PROMPT;
    if (shouldProduceSOAP) {
      contextualSystemPrompt += `\n\nIMPORTANT: You have collected enough information. Now provide a SOAP summary with clear formatting using markdown bold headers:\n\n**Subjective:** [User's main concern in their own words]\n\n**Objective:** [Facts about timing, duration, and reported symptoms]\n\n**Assessment:** [General information about possible causes - NOT a diagnosis]\n\n**Plan:** [Recommendations for appropriate care level and when to seek help]`;
    } else if (isFirstMessage) {
      contextualSystemPrompt += `\n\nThis is the first message. Start with your greeting and ask what's going on.`;
    }

    const messages = [
      { role: 'system', content: contextualSystemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    console.log('Sending request to Azure OpenAI...');

    const response = await client.chat.completions.create({
      messages: messages,
      model: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      temperature: 0.7,
      max_tokens: 400,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const responseContent = response.choices[0].message.content;

    // Add disclaimer only with SOAP note or if discussing serious symptoms
    const needsDisclaimer = shouldProduceSOAP || responseContent.toLowerCase().includes('emergency') ||
                           responseContent.toLowerCase().includes('911') || responseContent.toLowerCase().includes('urgent');

    const disclaimer = '\n\n*This is for informational purposes only. Please consult a healthcare provider for diagnosis and treatment.*';

    const finalResponse = needsDisclaimer && !responseContent.includes('informational purposes')
      ? responseContent + disclaimer
      : responseContent;

    res.json({ response: finalResponse });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    console.error('Error details:', error.message);

    // Handle Azure content filtering errors
    if (error.message && (error.message.includes('content management policy') || error.message.includes('filtered'))) {
      return res.status(200).json({
        response: "I understand you're seeking health information. For your safety, I need to remind you that I can only provide general educational information. For specific medical concerns, please consult with a healthcare provider who can properly evaluate your situation.\n\nIs there a different health topic I can help you learn about today?"
      });
    }

    // Handle rate limiting
    if (error.message && error.message.includes('429')) {
      return res.status(200).json({
        response: "I'm currently experiencing high demand. Please try again in a moment. If you have an urgent medical concern, please contact your healthcare provider or emergency services."
      });
    }

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