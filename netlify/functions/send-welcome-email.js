const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Your Resend API Key
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Email service not configured. Please add RESEND_API_KEY to Netlify environment variables.' })
      };
    }

    // Simplified HTML for better deliverability (avoiding spam filters)
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #1f1435;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1f1435 0%, #0f0c29 100%);">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: rgba(255, 255, 255, 0.98); border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #c084fc 0%, #f472b6 100%); padding: 48px 40px; text-align: center; border-radius: 16px 16px 0 0;">
                            <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                                You're In!
                            </h1>
                            <p style="color: rgba(255, 255, 255, 0.95); font-size: 18px; margin: 16px 0 0 0; font-weight: 500;">
                                Welcome to the Waitlist
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 48px 40px;">
                            <h2 style="background: linear-gradient(135deg, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 24px; margin: 0 0 24px 0; font-weight: 600;">
                                Welcome to the future of menopause care
                            </h2>

                            <p style="color: #2d3748; font-size: 17px; line-height: 1.7; margin: 0 0 28px 0;">
                                Thank you for joining our mission to transform menopause care. You're among the first to experience our AI menopause specialist—built to help you understand, track, and manage your symptoms with expert guidance available 24/7.
                            </p>

                            <div style="background: linear-gradient(135deg, rgba(192, 132, 252, 0.08), rgba(244, 114, 182, 0.08)); border-left: 4px solid #c084fc; border-radius: 8px; padding: 24px; margin: 32px 0;">
                                <h3 style="color: #1f1435; font-size: 19px; margin: 0 0 16px 0; font-weight: 600;">What you get as an early member:</h3>
                                <p style="color: #4a5568; font-size: 16px; line-height: 2; margin: 0;">
                                    <strong>AI Menopause Specialist</strong> - Chat 24/7 about hot flashes, sleep, mood changes, and more<br>
                                    <strong>Symptom tracking</strong> - Identify patterns and triggers in your symptoms<br>
                                    <strong>Expert insights</strong> - Get personalized guidance on treatment options<br>
                                    <strong>Doctor notes</strong> - Export summaries to share with your healthcare provider
                                </p>
                            </div>

                            <div style="background-color: #fef3f8; border-radius: 8px; padding: 20px; margin: 28px 0;">
                                <p style="color: #831843; font-size: 15px; line-height: 1.6; margin: 0;">
                                    <strong>Why OpenMedicine?</strong> Most women wait months to see a menopause specialist. Our AI gives you instant access to expert menopause guidance—helping you understand if you're in perimenopause or menopause, what's causing your symptoms, and what treatment options might help. All available 24/7.
                                </p>
                            </div>

                            <div style="text-align: center; margin: 36px 0 32px 0;">
                                <a href="https://cyrusmed.netlify.app" style="display: inline-block; background: linear-gradient(135deg, #c084fc, #f472b6); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 17px; box-shadow: 0 10px 30px rgba(192, 132, 252, 0.3);">
                                    Chat with Dr. Luna Now →
                                </a>
                            </div>

                            <p style="color: #718096; font-size: 15px; text-align: center; margin: 28px 0 0 0; line-height: 1.6;">
                                Questions? We're here to help!<br>
                                Reply to this email or visit <a href="https://cyrusmed.netlify.app" style="color: #c084fc; text-decoration: none;">our website</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #faf9fb; padding: 32px 40px; text-align: center; border-top: 1px solid #f0e7f5; border-radius: 0 0 16px 16px;">
                            <p style="color: #718096; font-size: 14px; margin: 0; line-height: 1.6;">
                                <strong style="background: linear-gradient(135deg, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OpenMedicine</strong> - Your AI Menopause Specialist<br>
                                © 2025 OpenMedicine. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    // Plain text version for better deliverability
    const emailText = `You're In! Welcome to the Waitlist

Welcome to the future of menopause care

Thank you for joining our mission to transform menopause care. You're among the first to experience our AI menopause specialist—built to help you understand, track, and manage your symptoms with expert guidance available 24/7.

What you get as an early member:
• AI Menopause Specialist - Chat 24/7 about hot flashes, sleep, mood changes, and more
• Symptom tracking - Identify patterns and triggers in your symptoms
• Expert insights - Get personalized guidance on treatment options
• Doctor notes - Export summaries to share with your healthcare provider

Why OpenMedicine? Most women wait months to see a menopause specialist. Our AI gives you instant access to expert menopause guidance—helping you understand if you're in perimenopause or menopause, what's causing your symptoms, and what treatment options might help. All available 24/7.

Chat with Dr. Luna now: https://cyrusmed.netlify.app

Questions? We're here to help! Reply to this email or visit our website.

OpenMedicine - Your AI Menopause Specialist
© 2025 OpenMedicine. All rights reserved.`;

    // Send email using Resend with improved headers for better deliverability
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'OpenMedicine <hello@openmedicine.io>',
        to: email,
        reply_to: 'hello@openmedicine.io',
        subject: 'Welcome to OpenMedicine - You're on the waitlist!',
        html: emailHtml,
        text: emailText, // Include plain text version
        headers: {
          'X-Entity-Ref-ID': new Date().getTime().toString(), // Unique ID for tracking
          'List-Unsubscribe': '<https://openmedicine.io/unsubscribe>' // Unsubscribe header
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to send email', details: data })
      };
    }

    console.log('Email sent successfully:', data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: data.id
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};