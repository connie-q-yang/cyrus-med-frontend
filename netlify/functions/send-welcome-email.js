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
                                Welcome to OpenMedicine Beta
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 48px 40px;">
                            <h2 style="background: linear-gradient(135deg, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 24px; margin: 0 0 24px 0; font-weight: 600;">
                                Your health questions, answered in minutes
                            </h2>

                            <p style="color: #2d3748; font-size: 17px; line-height: 1.7; margin: 0 0 28px 0;">
                                Thank you for joining our mission to transform women's healthcare. You're among the first 2000 women getting priority access to AI-powered health guidance built specifically for you.
                            </p>

                            <div style="background: linear-gradient(135deg, rgba(192, 132, 252, 0.08), rgba(244, 114, 182, 0.08)); border-left: 4px solid #c084fc; border-radius: 8px; padding: 24px; margin: 32px 0;">
                                <h3 style="color: #1f1435; font-size: 19px; margin: 0 0 16px 0; font-weight: 600;">Your Beta Benefits:</h3>
                                <p style="color: #4a5568; font-size: 16px; line-height: 2; margin: 0;">
                                    <strong>Priority access</strong> when we launch<br>
                                    <strong>Free AI consultations</strong> for 1 full year (normally $29/mo)<br>
                                    <strong>Shape our product</strong> - your feedback drives what we build<br>
                                    <strong>24/7 instant answers</strong> to your women's health questions
                                </p>
                            </div>

                            <div style="background-color: #fef3f8; border-radius: 8px; padding: 20px; margin: 28px 0;">
                                <p style="color: #831843; font-size: 15px; line-height: 1.6; margin: 0;">
                                    <strong>Did you know?</strong> Women wait 23 days longer than men for pain diagnosis. We're changing that. Get instant clarity on symptoms like UTIs, PCOS, period pain, birth control options, and more.
                                </p>
                            </div>

                            <div style="text-align: center; margin: 36px 0 32px 0;">
                                <a href="https://openmedicine.io" style="display: inline-block; background: linear-gradient(135deg, #c084fc, #f472b6); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 17px; box-shadow: 0 10px 30px rgba(192, 132, 252, 0.3);">
                                    Try Demo Now →
                                </a>
                            </div>

                            <p style="color: #718096; font-size: 15px; text-align: center; margin: 28px 0 0 0; line-height: 1.6;">
                                Questions? We're here to help!<br>
                                Reply to this email or visit <a href="https://openmedicine.io" style="color: #c084fc; text-decoration: none;">openmedicine.io</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #faf9fb; padding: 32px 40px; text-align: center; border-top: 1px solid #f0e7f5; border-radius: 0 0 16px 16px;">
                            <p style="color: #718096; font-size: 14px; margin: 0; line-height: 1.6;">
                                <strong style="background: linear-gradient(135deg, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OpenMedicine</strong> - Your AI Women's Health Companion<br>
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
    const emailText = `You're In! Welcome to OpenMedicine Beta

Your health questions, answered in minutes

Thank you for joining our mission to transform women's healthcare. You're among the first 2000 women getting priority access to AI-powered health guidance built specifically for you.

Your Beta Benefits:
• Priority access when we launch
• Free AI consultations for life (normally $29/mo)
• Shape our product - your feedback drives what we build
• 24/7 instant answers to your women's health questions

Did you know? Women wait 23 days longer than men for pain diagnosis. We're changing that. Get instant clarity on symptoms like UTIs, PCOS, period pain, birth control options, and more.

Try our demo now: https://openmedicine.io

Questions? We're here to help! Reply to this email or visit openmedicine.io

OpenMedicine - Your AI Women's Health Companion
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
        subject: 'Welcome to OpenMedicine Beta',
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