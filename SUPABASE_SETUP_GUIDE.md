# Supabase Setup Guide for Cyrus Med Waitlist

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Name it "cyrusmed" (or your preference)
4. Choose a strong database password (save this!)
5. Select your region (choose closest to your users)
6. Click "Create Project" and wait ~2 minutes

### 2. Get Your API Keys
1. Go to Settings (gear icon) → API
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Create the Database Table
1. Go to SQL Editor (left sidebar)
2. Click "New Query"
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "Run" to create the waitlist table and policies

### 4. Set Up Environment Variables
1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:
```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. (Optional) Set Up Automatic Emails

#### Option A: Using Supabase Database Webhooks
1. Go to Database → Webhooks
2. Create new webhook:
   - Name: "send-welcome-email"
   - Table: "waitlist"
   - Events: Insert
   - URL: Your email service webhook URL

#### Option B: Using Resend (Recommended)
1. Sign up at [resend.com](https://resend.com) (free tier available)
2. Get your API key
3. Deploy the Edge Function:
```bash
supabase functions deploy send-welcome-email
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

#### Option C: Using SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Update the edge function to use SendGrid's API

### 6. Test the Integration
1. Start your app: `npm start`
2. Go to the waitlist section
3. Enter an email and submit
4. Check your Supabase dashboard → Table Editor → waitlist
5. You should see the new entry!

## Features Included

✅ **Save emails to Supabase database**
- Automatic duplicate detection
- Timestamp tracking
- Status management

✅ **Real-time waitlist counter**
- Shows actual signup count
- Updates after each new signup

✅ **Welcome email template**
- Professional HTML email
- Mobile responsive
- Includes beta perks info

✅ **Security**
- Row Level Security enabled
- Anonymous users can only insert
- Email validation
- CORS configured

## Database Schema

The waitlist table includes:
- `id`: Unique identifier (UUID)
- `email`: User's email (unique)
- `joined_at`: Signup timestamp
- `source`: Where they signed up from (default: 'website')
- `status`: Current status (default: 'pending')
- `referral_code`: For referral tracking (optional)
- `metadata`: Additional data in JSON format (optional)

## Troubleshooting

### "Supabase URL or Key not configured"
- Make sure your `.env` file exists and has the correct values
- Restart your development server after adding environment variables

### Emails not being saved
- Check browser console for errors
- Verify your Supabase project is running
- Check Table Editor in Supabase to see if RLS policies are correct

### Welcome emails not sending
- This requires additional setup with an email service
- Check the Edge Function logs in Supabase dashboard
- Verify your email service API key is correct

## Next Steps

1. **Customize the welcome email** in `email-templates/welcome-email.html`
2. **Add admin dashboard** to view and manage waitlist entries
3. **Set up analytics** to track conversion rates
4. **Add referral system** for viral growth
5. **Export functionality** to download emails as CSV

## Support

If you need help:
1. Check Supabase docs: https://supabase.com/docs
2. Check the browser console for errors
3. Verify all environment variables are set correctly