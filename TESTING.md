# Testing Guide

## Overview
This document describes how to test the email functionality, waitlist, and chat features.

## Quick Test Commands

### Test Email Function
```bash
npm run test:email
```

This runs a quick test of the email serverless function to ensure:
- ✅ It rejects non-POST requests
- ✅ It validates email parameter is present
- ✅ It has proper error handling
- ✅ It returns correct HTTP status codes

### Test All Features
```bash
npm run test:all
```

This runs both email tests and React component tests.

## Manual Testing

### Email Functionality
1. Start the dev server with Netlify functions:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:8888 (NOT :3000!)

3. Enter your email in the Hero section

4. Check your terminal for logs:
   - Should see successful email send
   - Check your inbox for welcome email

5. Verify email contains:
   - Subject: "Welcome to OpenMedicine - You are on the waitlist!"
   - From: OpenMedicine <hello@openmedicine.io>
   - Menopause-focused content
   - "Chat with Dr. Luna Now" button

### Waitlist Functionality
1. Submit email via Hero section
2. Verify toast notification appears
3. Check Supabase dashboard for new entry
4. Try submitting same email again - should show "already on waitlist"

### Chat Preview
1. Click "Try Demo Now" button
2. Verify Dr. Luna greeting appears
3. Test a sample prompt about menopause symptoms
4. Verify response is menopause-focused

## Common Issues

### Email Not Sending (500 Error)
**Cause:** Syntax error in email template (fancy apostrophes/quotes)
**Fix:** Use standard ASCII apostrophes (') not fancy ones (')

### Function Not Found (404 Error)
**Cause:** Using `npm start` instead of `npm run dev`
**Fix:** Always use `npm run dev` to run Netlify functions locally

### Email Not Configured (500 Error)
**Cause:** RESEND_API_KEY not set
**Fix:** Add to `.env` file:
```
RESEND_API_KEY=your_key_here
```

## Test Files

- `test-email.js` - Quick email function tests
- `tests/send-welcome-email.test.js` - Comprehensive email tests (moved out of functions dir)
- `src/services/__tests__/waitlist.test.js` - Waitlist service tests

**Note:** Test files are kept outside `netlify/functions/` to prevent Netlify from trying to deploy them as serverless functions.

## Before Deploying

Run this checklist:

1. ✅ `npm run build` - Verify build succeeds
2. ✅ `npm run test:email` - Test email function
3. ✅ Manual test at localhost:8888
4. ✅ Check email arrives with correct content
5. ✅ Test waitlist duplicate prevention
6. ✅ Test chat demo works

## Continuous Integration

To add to CI/CD pipeline:

```yaml
- name: Run tests
  run: npm run test:all

- name: Build
  run: npm run build
```
