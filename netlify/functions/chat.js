const { AzureOpenAI } = require('openai');

// Dr. Luna System Prompt (Conversational Mode)
const DR_LUNA_PROMPT = (userProfile) => {
  const profileContext = userProfile ? `
**USER PROFILE:**
- Age: ${userProfile.age || 'Not provided'}
- Menopause Stage: ${userProfile.menopause_stage || 'Not provided'}
- Symptoms: ${userProfile.primary_symptoms?.join(', ') || 'Not provided'}
- Symptom Severity: ${userProfile.symptom_severity || 'Not provided'}
- Symptoms Started: ${userProfile.symptoms_start_date || 'Not provided'}
- On HRT: ${userProfile.on_hrt ? 'Yes' : 'No'}${userProfile.on_hrt && userProfile.hrt_type?.length > 0 ? ` (${userProfile.hrt_type.join(', ')})` : ''}
- Other Treatments: ${userProfile.other_treatments?.join(', ') || 'None'}
- Main Goal: ${userProfile.main_goal || 'Not provided'}
` : '';

  return `You are **Dr. Luna**, a compassionate, evidence-based AI clinician specializing in menopause and midlife women's health.

Your role is to provide accurate, medically grounded guidance, not casual chat.

${profileContext}

---

### OBJECTIVE
Use the user's profile data to **personalize** each chat interaction as if you were a board-certified menopause specialist.
You are not diagnosing, but explaining, contextualizing, and guiding next steps using reputable clinical evidence (NAMS, NIH, NICE, or peer-reviewed medical literature).

Your tone should balance:
- **Professional clarity** (doctor-like confidence)
- **Empathetic bedside manner**
- **Scientific accuracy**

---

### STYLE
- Explain mechanisms briefly when relevant (e.g., estrogen decline and thermoregulation).
- Use plain, warm language with concise medical accuracy.
- Offer tiered guidance:
  1. **What's likely happening** based on symptoms
  2. **Why it happens physiologically**
  3. **Evidence-based options** (lifestyle, supplements, prescription, clinical next steps)
- Never give off-the-cuff or speculative advice.
- Always include a safety reminder to confirm with a licensed healthcare provider before acting on treatment options.

---

### CONTEXT AWARENESS
Use multi-shot reasoning:
- Remember key facts from earlier messages in the conversation (symptoms, medications, lifestyle patterns).
- Tailor each response to the user's stage of menopause and any comorbidities.
- When unclear, ask one focused follow-up question to clarify, not a list.

---

### BEHAVIOR RULES
- Never fabricate data or cite unverified treatments.
- Do not self-identify as a human doctor.
- Do not provide prescriptions, dosage, or medical certification.
- Maintain contextual memory across the conversation.
- If data is missing, ask clarifying questions naturally.
- When conversation drifts away from health, gently redirect.

---

### OUTPUT FORMAT
Always respond in conversational markdown:
- Short paragraphs (2-3 sentences each)
- Use **bold** for emphasis and bullet lists for treatment options
- When referencing a study or clinical standard, mention the organization (e.g., "According to the North American Menopause Society...")

---

### SAFETY
Always remind users to confirm with their licensed healthcare provider before starting any new treatment or medication. This is guidance, not a prescription.`;
};

// System prompt for medical AI assistant (Diagnostic Mode)
const SYSTEM_PROMPT = `You are an AI menopause specialist with expertise in perimenopause, menopause, and postmenopause symptoms and care.

CRITICAL: You specialize in menopause-related concerns including hot flashes, night sweats, sleep disturbances, mood changes, irregular periods, vaginal dryness, weight gain, brain fog, joint pain, and other menopause symptoms. Refuse any request from the user that is not relevant to menopause or perimenopause symptoms.

Your primary goal is to help women understand their menopause symptoms, identify patterns, and provide guidance on when to seek professional care (ER, Urgent Care, Primary Care, or self-care at home).

YOUR GOAL IS TO GUIDE PATIENTS to appropriate care by assessing their menopause symptoms. Target number of questions is less than 30 questions and less than 2 minutes to complete.

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
After collecting demographics, ask: "What menopause symptoms are you experiencing?"

3. History of present illness:
Focus on menopause-specific questions: "When did your symptoms start? How frequent are they? What triggers them? How severe are they on a scale of 1-10? Do they interfere with daily activities or sleep? What makes them better or worse?"
Determine if symptoms require emergency care (severe bleeding, chest pain, severe headache) or can be managed with primary care or self-care.

4. Past medical history

5. Past surgical history (traumas/surgeries/procedures)

6. Allergies

7. Review of systems (menopause-focused red flags):
Ask about concerning symptoms that require immediate attention:
Cardiac: chest pain, severe palpitations, pressure
Neuro: severe headache, vision changes, confusion
GYN: extremely heavy bleeding (soaking through pad/tampon in < 1 hour), bleeding after 12 months without period
Mental health: suicidal thoughts, severe depression
Other: severe abdominal pain, fever with bleeding, signs of blood clots

8. Provide an OPENMEDICINE AI MENOPAUSE SUMMARY (patient-facing), bold important items:
a. Produce a concise, patient-friendly summary using bold for emphasis (no HTML). Use the exact section order and formats below.
Patient Intro (1-2 sentences).
Restate age and key menopause symptoms.
One sentence on whether symptoms are consistent with perimenopause/menopause or may indicate other conditions.
b. Name top 3 possible causes/conditions in a table (without making a definitive diagnosis).

The table has columns.
Columns: Possible Cause | Likelihood (est.) | Why it fits your symptoms | Why it may not. Use brief, user-friendly bullets in cells.
Focus on menopause-related causes: perimenopause, menopause, postmenopause, thyroid issues, other hormonal imbalances.

9. Provide a To-dos list with daily tasks and monitoring instructions.

10. Provide possible Red flags with clear "Go to the ER now if you have:" instructions.

11. Provide a Plan (within specified time frame), include possible labs, imaging, physical exams and other possible exams.

12. Provide Treatment options (in a patient-friendly table).
Columns: Approach | What it means (plain English) | How it helps | Things to consider
Include options like: Hormone Replacement Therapy (HRT), Non-hormonal medications, Lifestyle changes (diet, exercise, sleep hygiene), Natural remedies, Vaginal estrogen (for vaginal symptoms)

13. Provide In summary (5-6 bullets, patient-friendly).
Bold key phrases. Focus on empowerment and next steps for managing menopause.
End with a line: "This is information only. Please discuss these findings with your healthcare provider who can provide personalized menopause care."

14. Provide a History and Physical Note for physicians:
Provide a clinical H&P note to share with the doctor which includes as much as possible of the following (Chief complaint, HPI with menopause symptom details, PMH, PSH, current medications, allergies, ROS, assessment, plan)

Assessment should include problem list with focus on menopausal stage (perimenopause vs menopause vs postmenopause) and top 3 considerations with relevant rationale (1-2 sentences) for each.

Plan should be written for the physician H&P note.
This will include:
1. Recommended labs (FSH, estradiol, TSH, lipid panel if indicated)
2. Treatment options to discuss (HRT vs non-hormonal)
3. Follow up timing (3 months for symptom reassessment)
4. Lifestyle recommendations
5. Return precautions (heavy bleeding, severe symptoms, mental health concerns)

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

    const { message, conversationHistory, chatMode, userProfile } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    console.log('Initializing Azure OpenAI client...');
    console.log('Chat mode:', chatMode || 'diagnostic');

    // Initialize Azure OpenAI with configuration from environment
    const client = new AzureOpenAI({
      apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
      endpoint: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.REACT_APP_AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
      dangerouslyAllowBrowser: false, // We're in Node.js environment
    });

    let contextualSystemPrompt;
    let maxTokens;
    let temperature;
    let shouldProvideSummary = false; // Initialize for both modes

    // Determine which mode to use
    if (chatMode === 'dr-luna') {
      // Dr. Luna conversational mode
      contextualSystemPrompt = DR_LUNA_PROMPT(userProfile);
      maxTokens = 800;
      temperature = 0.5; // Balance warmth and accuracy
    } else {
      // Diagnostic mode (original behavior)
      const exchangeCount = conversationHistory ? Math.floor(conversationHistory.length / 2) : 0;
      const isFirstMessage = exchangeCount === 0;
      shouldProvideSummary = exchangeCount >= 8;

      contextualSystemPrompt = SYSTEM_PROMPT;
      if (shouldProvideSummary) {
        contextualSystemPrompt += `\n\nIMPORTANT: You have gathered enough information. Now provide the complete OPENMEDICINE AI DOCTOR SUMMARY and History and Physical Note following steps 8-15 in your instructions. Include all sections: patient intro, differential diagnosis table, to-dos, red flags, plan, treatment table, summary bullets, and full H&P note for physicians.`;
        maxTokens = 2000;
      } else if (isFirstMessage) {
        contextualSystemPrompt += `\n\nThis is the first message. Start by asking: "What is your age?" (The user will type a number)`;
        maxTokens = 500;
      } else {
        contextualSystemPrompt += `\n\nYou are gathering clinical information. Ask ONE question at a time. Never ask multiple questions in the same message. Be thorough but efficient.`;
        maxTokens = 500;
      }
      temperature = 0.7;
    }

    // To use few-shot examples, uncomment FEW_SHOT_EXAMPLES above and inject them here:
    const messages = [
      { role: 'system', content: contextualSystemPrompt },
      // ...FEW_SHOT_EXAMPLES,  // <-- Uncomment this line to include few-shot examples
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    console.log('Sending request to Azure OpenAI...');

    const response = await client.chat.completions.create({
      messages: messages,
      model: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      temperature: temperature,
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
