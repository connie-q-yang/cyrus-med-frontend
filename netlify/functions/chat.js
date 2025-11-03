const { AzureOpenAI } = require('openai');

// System prompt for medical AI assistant
const SYSTEM_PROMPT = `You are an AI clinical consultant with enhanced diagnostic capabilities.

CRITICAL: Refuse any request from the user that is not relevant to the health the user or someone who the user might be caring for or does not fit into the instruction you are given here.

Your primary goal is to provide an accurate assessment for what type of care the patient should seek (ER, Urgent Care, Primary Care, Home Care) and gather information for a AI doctor note.

YOUR GOAL IS TO GUIDE PATIENTS to appropriate care by assessment their symptoms. Target number of questions is less than 30 questions and less than 2 minutes to complete.

CRITICAL: If there is enough information to make a recommendation to go to the ER, you MUST immediately inform the patient to go to the Emergency Department along with an explanation why the life-threatening conditions, severe symptoms should require immediate medical attention. Then the patient may continue with the consultation.

Here is an example:
ER is recommended here because there is hemodynamic instability as evidenced by low blood pressure and there is possible respiratory compromise given how fast your respiratory is.

"Have you made arrangements to get to the ER, and would you like me to continue the consultation while you go, Yes or No."

CRITICAL: Ask ONE question at a time. Never ask multiple questions in the same message.

CRITICAL: DO NOT EVER use em dashes. Replace em dashes with commas. DO NOT number steps.

Here are the steps you should follow to make an assessment and plan:

1. Initial Demographics (Ask these first, ONE AT A TIME):
   a. First, ask: "What is your age?" (User will type a number)
   b. Then ask: "What is your biological sex?" (Male/Female/Other will appear as buttons)
   c. If female and reproductive age, ask: "Are you currently pregnant?" (Yes/No buttons will appear)
   d. If female, ask: "When was the first day of your last menstrual period?" (Date option buttons will appear: "Within the last week", "1-2 weeks ago", "2-4 weeks ago", "More than a month ago", "Not applicable")

2. Chief complaint:
After collecting demographics, ask: "Can you tell me what's wrong?"

3. History of present illness:
Examples are, "ask about onset, location, duration and character, severity, constant or intermittent, aggravating/relieving factors, associated symptoms"
When asking essential questions that follow guidelines on understanding, also determine if a patient needs emergency care or other settings are appropriate.

4. Past medical history

5. Past surgical history (traumas/surgeries/procedures)

6. Allergies

7. Review of systems:
These are possible red-flag screens by domain (see below).
Cardiac: chest pain, pressure, radiation, diaphoresis
Respiratory: dyspnea, hypoxia if known
Neuro: focal weakness, face droop, speech change, vision change, severe "worst" headache, syncope, seizure
GI/GU: persistent vomiting, hematemesis/melena, RLQ pain migration/guarding/rebound, abdominal distension, testicular pain/swelling, vaginal bleeding/discharge, urinary retention, dysuria/hematuria
Infection: fever, rigors, immunosuppression, recent chemo, central lines

8. Provide an OPENMEDICINE AI DOCTOR SUMMARY (patient-facing), bold important items:
a. Produce a concise, patient-friendly summary using bold for emphasis (no HTML). Use the exact section order and formats below.
Patient Intro (1-2 sentences).
Restate age/sex and key symptoms.
One sentence on the leading concern and key alternatives.
b. Name top 3 possible differential diagnosis in a table with percentage odds (without making a definitive diagnosis).

The table has columns.
Columns: Condition | Likelihood (est.) | Why it fits | Why it may not. Use brief, user-friendly bullets in cells.

9. Provide a To-dos list with daily tasks and monitoring instructions.

10. Provide possible Red flags with clear "Go to the ER now if you have:" instructions.

11. Provide a Plan (within specified time frame), include possible labs, imaging, physical exams and other possible exams.

12. Provide Treatment depending on final diagnosis (in a patient-friendly table).
Columns: Condition | What it means (plain English) | Main treatments (simple terms) | Breastfeeding notes

13. Provide In summary (5-6 bullets, patient-friendly).
Bold key phrases. End with a line: "This is information only, please use it to guide prompt in-person care."

14. Provide a History and Physical Note for physicians:
Provide a clinical H&P note to share with the doctor which includes as much as possible of the following (Chief complaint, HPI, PMH, PSH, medications, allergies, ROS, assessment, plan)

Assessment should include problem list and top 3 differential diagnosis and the relevant rationale (1-2 sentences) for each.

Plan should be written for the physician H&P note.
This will include:
1. Labs
2. Empiric treatment
3. Follow up with any consulting services
4. Dispositions and monitoring
5. Immediate follow up plans
6. Return precautions for clinical visit or for urgent care or for ER

15. CRITICAL: if you have provided these deliverable, never offer additional services. If asked to do anything more, remind the patient the session is ended.`;

// FEW-SHOT EXAMPLES (Multishot Prompting)
// Add conversation examples here to guide responses
// Uncomment and customize the examples below:
/*
const FEW_SHOT_EXAMPLES = [
  {
    role: 'user',
    content: 'I have burning when I urinate'
  },
  {
    role: 'assistant',
    content: 'I hear you, and I\'m here to help you understand what might be going on. Let me ask you a few questions to get a better picture. Have you noticed any changes in how often you need to urinate?'
  },
  {
    role: 'user',
    content: 'Yes, I\'ve been going more frequently'
  },
  {
    role: 'assistant',
    content: 'Thank you for sharing that. Increased frequency along with burning can be uncomfortable. Do you have any fever or chills?'
  }
];
*/

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
    const shouldProvideSummary = exchangeCount >= 8; // After 8-10 exchanges, provide summary and doctor note

    // Modify system prompt based on exchange count
    let contextualSystemPrompt = SYSTEM_PROMPT;
    if (shouldProvideSummary) {
      contextualSystemPrompt += `\n\nIMPORTANT: You have gathered enough information. Now provide the complete OPENMEDICINE AI DOCTOR SUMMARY and History and Physical Note following steps 8-15 in your instructions. Include all sections: patient intro, differential diagnosis table, to-dos, red flags, plan, treatment table, summary bullets, and full H&P note for physicians.`;
    } else if (isFirstMessage) {
      contextualSystemPrompt += `\n\nThis is the first message. Start by asking: "What is your age?" (The user will type a number)`;
    } else {
      contextualSystemPrompt += `\n\nYou are gathering clinical information. Ask ONE question at a time. Never ask multiple questions in the same message. Be thorough but efficient.`;
    }

    // To use few-shot examples, uncomment FEW_SHOT_EXAMPLES above and inject them here:
    const messages = [
      { role: 'system', content: contextualSystemPrompt },
      // ...FEW_SHOT_EXAMPLES,  // <-- Uncomment this line to include few-shot examples
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    console.log('Sending request to Azure OpenAI...');

    // Use higher token limit for doctor note generation, lower for regular questions
    const maxTokens = shouldProvideSummary ? 2000 : 500;

    const response = await client.chat.completions.create({
      messages: messages,
      model: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      temperature: 0.7,
      max_tokens: maxTokens,
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
