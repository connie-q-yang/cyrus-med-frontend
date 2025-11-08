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
    const { name, email, subject, message } = JSON.parse(event.body);

    // Validation
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Name, email, and message are required' })
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

    // Email HTML for the internal notification
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #c084fc 0%, #f472b6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">New Contact Form Submission</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h3 style="color: #1f1435; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">From</h3>
                    <p style="color: #4a5568; font-size: 16px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h3 style="color: #1f1435; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">Email</h3>
                    <p style="color: #4a5568; font-size: 16px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      <a href="mailto:${email}" style="color: #c084fc; text-decoration: none;">${email}</a>
                    </p>
                  </td>
                </tr>
                ${subject ? `
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h3 style="color: #1f1435; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">Subject</h3>
                    <p style="color: #4a5568; font-size: 16px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">${subject}</p>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h3 style="color: #1f1435; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">Message</h3>
                    <div style="background-color: #f9f5ff; border-left: 4px solid #c084fc; padding: 20px; margin: 10px 0;">
                      <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">${message}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your contact form submission')}" style="display: inline-block; background: linear-gradient(135deg, #c084fc, #f472b6); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                  Reply to ${name}
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #faf9fb; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
              <p style="color: #718096; font-size: 13px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                <strong>OpenMedicine</strong> Contact Form Notification<br>
                Sent from your website contact form
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const emailText = `New Contact Form Submission

From: ${name}
Email: ${email}
${subject ? `Subject: ${subject}\n` : ''}
Message:
${message}

---
Reply to: ${email}`;

    // Send email via Resend to your team inbox
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'OpenMedicine Contact Form <hello@openmedicine.io>',
        to: 'hello@openmedicine.io',
        reply_to: email,
        subject: subject ? `Contact Form: ${subject}` : `New message from ${name}`,
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
        message: 'Contact form submitted successfully',
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
