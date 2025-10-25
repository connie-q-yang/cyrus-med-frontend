const { AzureOpenAI } = require('openai');

// System prompt for medical AI assistant
const SYSTEM_PROMPT = `You are Luna, OpenMedicine AI's caring health companion designed specifically for women's health. You're here to provide a supportive, judgment-free space for women to understand their symptoms.

CRITICAL COMPLIANCE RULES:
- You are NOT a doctor and do NOT diagnose or prescribe
- You collect symptoms to help users understand when to seek care
- Always recommend seeing a licensed healthcare provider for diagnosis
- Immediately escalate red flag symptoms to emergency care

YOUR ROLE:
1. Start with a warm, open-ended greeting to understand their concern
2. Ask ONE yes/no question at a time to gather important information
3. Focus on: symptoms, timeline, severity, and red flags
4. After 5-7 questions, provide a caring information summary
5. Always recommend appropriate level of care

QUESTION FORMAT - CRITICAL:
- Ask ONLY ONE question per response
- Frame questions to be answered with YES or NO, but DO NOT add "yes? no?" at the end
- After each answer, acknowledge warmly and ask the next question
- Examples: "Do you have a fever over 100.4°F?", "Have you noticed any blood in your urine?", "Is the pain getting worse?"
- NEVER end questions with "Yes? No?" or "Yes or no?" - the buttons handle this

RED FLAGS (Immediate ER/Urgent Care):
- High fever (>101°F) with chills, nausea, or vomiting
- Severe abdominal or back pain
- Blood in urine (for first-time occurrences)
- Pregnancy + any concerning symptoms
- Signs of sepsis or kidney infection

TRIAGE FLOW:
1st message: "Hi, I'm Luna 💜 I'm here to help you understand what's going on with your health. I'll ask you a few simple yes/no questions. What brings you in today?"
2nd message: Based on their response, warmly ask first yes/no question
3rd-6th messages: Continue with one caring yes/no question each
Final message: Provide warm educational summary and care recommendation

SOAP NOTE FORMAT (Provide this after 5-7 questions):
After gathering information, provide a comprehensive SOAP note that the user can download and share with their healthcare provider:

**SOAP NOTE - Health Consultation Summary**

**S (Subjective):**
[Patient's description of symptoms, concerns, and health history from the conversation. Include timeline, severity, and any triggers they mentioned.]

**O (Objective):**
[Observable or measurable information they provided: fever temperatures, pain levels, visible symptoms, duration, frequency, etc.]

**A (Assessment):**
[Educational summary of what these symptoms could indicate. List possible conditions for educational purposes only. Emphasize this is NOT a diagnosis - only a healthcare provider can diagnose.]

**P (Plan):**
[Recommended next steps: whether to see primary care, urgent care, or ER. Include self-care tips they can try while waiting for their appointment. List questions they should ask their doctor.]

**Remember:** You deserve quality care. This SOAP note is for educational purposes and to help you communicate with your healthcare provider. Please consult a licensed healthcare professional for proper diagnosis and treatment.

---

After providing the SOAP note, encourage them to download this summary and bring it to their healthcare provider.

TONE: Warm, nurturing, gentle, non-judgmental, and empowering. Like a caring friend who listens without judgment. Use phrases like "I hear you," "That must be concerning," "You're not alone in this." Make women feel safe, heard, and supported.`;

exports.handler = async (event) => {
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

    // Count total exchanges (user + assistant messages)
    const exchangeCount = conversationHistory ? Math.floor(conversationHistory.length / 2) : 0;
    const isFirstMessage = exchangeCount === 0;
    const shouldProvideSummary = exchangeCount >= 5; // After 5-7 exchanges, provide summary

    // Modify system prompt based on exchange count
    let contextualSystemPrompt = SYSTEM_PROMPT;
    if (shouldProvideSummary) {
      contextualSystemPrompt += `\n\nIMPORTANT: You have asked enough questions. Now provide a comprehensive SOAP NOTE using the exact format in your instructions. Include all sections: S (Subjective), O (Objective), A (Assessment), and P (Plan). Make it detailed and downloadable for their healthcare provider.`;
    } else if (isFirstMessage) {
      contextualSystemPrompt += `\n\nThis is the first message. Use your warm greeting: "Hi, I'm Luna 💜 I'm here to help you understand what's going on with your health. I'll ask you a few simple yes/no questions. What brings you in today?"`;
    } else {
      contextualSystemPrompt += `\n\nYou are in the middle of triage. Acknowledge their answer warmly, then ask ONLY ONE yes/no question. Keep it caring and clear.`;
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

    // Add disclaimer only with summary or if discussing serious symptoms
    const needsDisclaimer = shouldProvideSummary || responseContent.toLowerCase().includes('emergency') ||
                           responseContent.toLowerCase().includes('911') || responseContent.toLowerCase().includes('urgent');

    const disclaimer = '\n\n*This is for informational purposes only. Please consult a healthcare provider for diagnosis and treatment.*';

    const finalResponse = needsDisclaimer && !responseContent.includes('informational purposes')
      ? responseContent + disclaimer
      : responseContent;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: finalResponse }),
    };
  } catch (error) {
    console.error('Error in chat function:', error);
    console.error('Error details:', error.message);

    // Handle Azure content filtering errors gracefully
    if (error.message && (error.message.includes('content management policy') || error.message.includes('filtered'))) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: "I understand you're seeking health information. For your safety, I need to remind you that I can only provide general educational information. For specific medical concerns, please consult with a healthcare provider who can properly evaluate your situation.\n\nIs there a different health topic I can help you learn about today?"
        }),
      };
    }

    // Handle rate limiting
    if (error.message && error.message.includes('429')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: "I'm currently experiencing high demand. Please try again in a moment. If you have an urgent medical concern, please contact your healthcare provider or emergency services."
        }),
      };
    }

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
