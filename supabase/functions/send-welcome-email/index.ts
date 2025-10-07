import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the webhook payload
    const { record } = await req.json()

    if (!record || !record.email) {
      throw new Error('Invalid webhook payload')
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
                                Welcome to <span style="font-weight: 400;">OpenHealth</span>
                            </h1>
                            <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 12px 0 0 0;">
                                You're part of our exclusive beta community
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 48px 40px;">
                            <h2 style="color: #0A2540; font-size: 24px; margin: 0 0 24px 0;">🎉 You're In!</h2>

                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                Thank you for joining OpenHealth. You're among the first to experience the future of AI-powered healthcare guidance.
                            </p>

                            <div style="background: #f7fafc; border-left: 4px solid #4CB3D4; padding: 20px; margin: 32px 0;">
                                <h3 style="color: #0A2540; font-size: 18px; margin: 0 0 12px 0;">What's Next?</h3>
                                <ul style="color: #4a5568; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                    <li><strong>Priority Access:</strong> First to try OpenHealth when we launch</li>
                                    <li><strong>Free Credits:</strong> $50 in consultation credits for beta users</li>
                                    <li><strong>Shape the Future:</strong> Your feedback drives our development</li>
                                    <li><strong>24/7 Support:</strong> Get help whenever you need it</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin: 40px 0;">
                                <a href="https://openhealth.netlify.app" style="display: inline-block; background: linear-gradient(135deg, #8A7CF4, #4CB3D4); color: white; padding: 16px 48px; border-radius: 100px; text-decoration: none; font-weight: 600;">
                                    Visit OpenHealth
                                </a>
                            </div>

                            <p style="color: #718096; font-size: 14px; text-align: center; margin: 32px 0 0 0;">
                                Questions? Reply to this email and we'll help you out.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f7fafc; padding: 32px 40px; text-align: center; border-radius: 0 0 16px 16px;">
                            <p style="color: #718096; font-size: 13px; margin: 0;">
                                © 2025 OpenHealth. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `

    // Send email using Resend, SendGrid, or any email service
    // For now, we'll just log it (you'll need to integrate your email service)
    console.log(`Sending welcome email to: ${record.email}`)

    // If using Resend (recommended):
    /*
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'OpenHealth <welcome@openhealth.com>',
        to: record.email,
        subject: 'Welcome to OpenHealth Beta 🎉',
        html: emailHtml,
      }),
    })

    const data = await res.json()
    console.log('Email sent:', data)
    */

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome email queued' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})