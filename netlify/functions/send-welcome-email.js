exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email service not configured' })
      };
    }

    // Simplified email content
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
            <td style="background: linear-gradient(135deg, #c084fc 0%, #f472b6 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">You are In!</h1>
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0;">Welcome to OpenMedicine</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f1435; font-size: 22px; margin: 0 0 20px 0;">Welcome to the future of menopause care</h2>

              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining our mission to transform menopause care. You are among the first to experience our AI menopause specialist built to help you understand, track, and manage your symptoms with expert guidance available 24/7.
              </p>

              <div style="background-color: #f9f5ff; border-left: 4px solid #c084fc; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1f1435; font-size: 18px; margin: 0 0 15px 0;">What you get:</h3>
                <p style="color: #4a5568; font-size: 15px; line-height: 1.8; margin: 0;">
                  <strong>AI Menopause Specialist</strong> - Chat 24/7 about symptoms<br>
                  <strong>Symptom tracking</strong> - Identify patterns and triggers<br>
                  <strong>Expert insights</strong> - Personalized guidance on treatment options<br>
                  <strong>Doctor notes</strong> - Export summaries to share with your healthcare provider
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://cyrusmed.netlify.app" style="display: inline-block; background: linear-gradient(135deg, #c084fc, #f472b6); color: #ffffff; padding: 15px 35px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Chat with Dr. Luna Now →
                </a>
              </div>

              <p style="color: #718096; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
                Questions? Reply to this email anytime.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #faf9fb; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
              <p style="color: #718096; font-size: 13px; margin: 0;">
                <strong>OpenMedicine</strong> - Your AI Menopause Specialist<br>
                © 2025 OpenMedicine. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const emailText = `Welcome to OpenMedicine!

Thank you for joining our mission to transform menopause care. You are among the first to experience our AI menopause specialist.

What you get:
• AI Menopause Specialist - Chat 24/7 about symptoms
• Symptom tracking - Identify patterns and triggers
• Expert insights - Personalized guidance on treatment options
• Doctor notes - Export summaries to share with your healthcare provider

Chat with Dr. Luna now: https://cyrusmed.netlify.app

Questions? Reply to this email anytime.

OpenMedicine - Your AI Menopause Specialist
© 2025 OpenMedicine. All rights reserved.`;

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'OpenMedicine <hello@openmedicine.io>',
        to: email,
        subject: 'Welcome to OpenMedicine - You are on the waitlist!',
        html: emailHtml,
        text: emailText,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Failed to send email',
          details: data.message || 'Unknown error'
        })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: data.id
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
