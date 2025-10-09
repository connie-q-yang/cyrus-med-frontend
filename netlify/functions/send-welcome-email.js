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

    // Email HTML content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #0A2540 0%, #062033 100%); padding: 48px 40px; text-align: center; border-radius: 16px 16px 0 0;">
                            <h1 style="color: white; font-size: 32px; font-weight: 200; margin: 0;">
                                Welcome to <span style="font-weight: 400;">OpenMedicine</span>
                            </h1>
                            <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 12px 0 0 0;">
                                You're part of our exclusive beta community 🎉
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 48px 40px;">
                            <h2 style="color: #0A2540; font-size: 24px; margin: 0 0 24px 0;">You're In!</h2>

                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                Thank you for joining OpenMedicine's exclusive waitlist. You're among the first pioneers to experience the future of AI-powered healthcare guidance.
                            </p>

                            <div style="background: #f7fafc; border-left: 4px solid #4CB3D4; padding: 20px; margin: 32px 0;">
                                <h3 style="color: #0A2540; font-size: 18px; margin: 0 0 12px 0;">Your Beta Benefits</h3>
                                <ul style="color: #4a5568; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                    <li><strong>Priority Access:</strong> Be first to try OpenMedicine when we launch</li>
                                    <li><strong>$50 Free Credits:</strong> Start your journey with complimentary consultations</li>
                                    <li><strong>Shape the Future:</strong> Your feedback directly influences our development</li>
                                    <li><strong>24/7 Support:</strong> Get instant health guidance whenever you need it</li>
                                </ul>
                            </div>

                            <div style="background: linear-gradient(135deg, #8A7CF4 0%, #4CB3D4 100%); padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0;">
                                <p style="color: white; font-size: 16px; margin: 0 0 16px 0; font-weight: 500;">
                                    🚀 Want to Skip the Line?
                                </p>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 20px 0;">
                                    Refer 3 friends and get instant access when we launch
                                </p>
                                <a href="https://openhealth.netlify.app" style="display: inline-block; background: white; color: #0A2540; padding: 12px 32px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    Share with Friends
                                </a>
                            </div>

                            <p style="color: #718096; font-size: 14px; text-align: center; margin: 32px 0 0 0;">
                                Questions? Reply to this email and our team will help you out.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f7fafc; padding: 32px 40px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0;">
                                OpenMedicine - Your AI Health Companion
                            </p>
                            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
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

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'welcome@openhealth.io', // Your verified domain
        to: email,
        subject: 'Welcome to OpenMedicine Beta! 🎉',
        html: emailHtml,
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