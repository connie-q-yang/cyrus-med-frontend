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
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
                    <tr>
                        <td style="background-color: #0A2540; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: normal; margin: 0;">
                                Welcome to OpenMedicine
                            </h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 12px 0 0 0;">
                                You're part of our exclusive beta community
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #0A2540; font-size: 22px; margin: 0 0 20px 0;">Thank you for joining!</h2>

                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                You're among the first to experience AI-powered healthcare guidance with OpenMedicine.
                            </p>

                            <div style="background-color: #f7fafc; border-left: 4px solid #4CB3D4; padding: 20px; margin: 32px 0;">
                                <h3 style="color: #0A2540; font-size: 18px; margin: 0 0 12px 0;">Your Beta Benefits:</h3>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.8; margin: 0;">
                                    • Priority Access when we launch<br>
                                    • $50 in free consultation credits<br>
                                    • Help shape our development<br>
                                    • 24/7 health guidance support
                                </p>
                            </div>

                            <div style="text-align: center; margin: 32px 0;">
                                <a href="https://openmedicine.io" style="display: inline-block; background-color: #4CB3D4; color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">
                                    Visit OpenMedicine
                                </a>
                            </div>

                            <p style="color: #718096; font-size: 14px; text-align: center; margin: 32px 0 0 0;">
                                Have questions? Simply reply to this email and we'll help you out.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #718096; font-size: 13px; margin: 0;">
                                OpenMedicine - Your AI Health Companion<br>
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
    const emailText = `Welcome to OpenMedicine!

Thank you for joining our exclusive beta community.

Your Beta Benefits:
• Priority Access when we launch
• $50 in free consultation credits
• Help shape our development
• 24/7 health guidance support

Visit OpenMedicine: https://openmedicine.io

Have questions? Simply reply to this email and we'll help you out.

OpenMedicine - Your AI Health Companion
© 2025 OpenMedicine. All rights reserved.`;

    // Send email using Resend with improved headers for better deliverability
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'OpenMedicine <noreply@openmedicine.io>', // Use noreply for automated emails
        to: email,
        reply_to: 'hello@openmedicine.io', // Users can reply to hello@
        subject: 'Welcome to OpenMedicine Beta', // Removed emoji to avoid spam filters
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