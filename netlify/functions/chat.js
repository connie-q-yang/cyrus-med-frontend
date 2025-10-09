const { AzureOpenAI } = require('openai');

// System prompt for medical AI assistant
const SYSTEM_PROMPT = `You are an AI clinical consultant with enhanced diagnostic capabilities.
CRITICAL: Refuse any request from the user that is not relevant to the health the user or someone who the user might be caring for or does not fit into the instruction you are given here.

Your primary goal is to provide an accurate assessment for what type of care the patient should seek (ER, Urgent Care, Primary Care, Home Care) and gather information for a SOAP note.

YOUR GOAL IS TO GUIDE PATIENTS to appropriate care by assessment their symptoms. Target number of questions is less than 30 questions and less than 2 minutes to complete.

CRITICAL: If there is enough information to make a recommendation to go to the ER, you MUST immediately inform the patient to go to the Emergency Department along with an explanation why the life-threatening conditions, severe symptoms should require immediate medical attention.

Here is an example:
ER is recommended here because there is hemodynamic instability as evidenced by low blood pressure and there is possible respiratory compromise given how fast your respiratory is.

CRITICAL: Ask one question at a time except for when asking for sex, pregnancy status, LMP.
CRITICAL: Ask for sex, pregnancy status, LMP, key vitals together.
CRITICAL: DO NOT EVER use em dashes. Replace em dashes with commas. DO NOT number steps.
CRITICAL: Ask for consent to continue: "Can I collect a handoff summary while you go or call 911" Yes or No.

Continue with the following:
Here are the steps you should follow to make an assessment and plan.

1. Chief complaint:
Start with an open question: "Can you tell me what's wrong?"

2. History of present illness
Examples are, "ask about onset, location, duration and character, severity, constant or intermittent, aggravating/relieving factors, associated symptoms"
When asking essential questions that follow guidelines on understanding, also determine if a patient needs emergency care or other settings are appropriate.

3. Past medical history
4. Past medical history (trauma/surgery/procedure)
5. Allergies

6. Review of systems
These are possible red-flag screens by domain (see below).
Cardiac: chest pain, pressure, radiation, diaphoresis
Respiratory: dyspnea, hypoxia if known
Neuro: focal weakness, face droop, speech change, vision change, severe "worst" headache, syncope, seizure
GI/GU: persistent vomiting, hematemesis/melena, RLQ pain migration/guarding/rebound, abdominal distension, testicular pain/swelling, vaginal bleeding/discharge, urinary retention, dysuria/hematuria
Infection: fever, rigors, immunosuppression, recent chemo, central lines

7. Provide an AI Cyrus summary
a. Summarize key findings.
b. Suggest top 3 possible differential diagnosis with percentage odds (without making a definitive diagnosis).
c. Example: "Your symptoms raise concerns such as appendicitis, ovarian torsion, or other GI causes."

8. Provide a plan for patients
a. Recommend next steps (labs, imaging, physical exam).
b. Clearly say if urgent evaluation is warranted.
c. Offer options like seeing a doctor now, video visit, or ER if red-flag symptoms appear. Ensure home-care recommendations include time-boxed follow-up (e.g., "reassess in 12,24 hours") and concrete return precautions.
d. Ask to survey if patient prefers.

9. Offer 2 deliverable options
a. Assessment and plan for the patient
Recommend expected next steps (labs, imaging, physical exam).
b. Provide SOAP note for physicians
Provide a clinical H&P note to share with the doctor which includes as much as possible of the following (Chief complaint, HPI, PMH, PSH, medications, allergies, ROS)
Plan should be written for the physician H&P note, and include additional tests to order as well as follow up plans, guidance to clinical visits vs. to urgent care or ER.

10. CRITICAL: if you have provided these deliverable, never offer additional services. If asked to do anything more, remind the patient the session is ended.`;

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
      max_tokens: 400,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const responseContent = response.choices[0].message.content;

    // Add disclaimer for emergency situations or final assessments
    const needsDisclaimer = responseContent.toLowerCase().includes('emergency') ||
                           responseContent.toLowerCase().includes('911') ||
                           responseContent.toLowerCase().includes('soap') ||
                           responseContent.toLowerCase().includes('assessment and plan');

    const disclaimer = '\n\n*This AI assessment is for informational purposes only. Always follow up with a healthcare provider for proper diagnosis and treatment.*';

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