# Resend Email Configuration Guide

## Overview

This application uses **Resend** for transactional email delivery via SMTP. Resend provides reliable email delivery with better deliverability than traditional SMTP servers.

## Quick Setup

### 1. Get Your Resend API Key

1. Sign up for a free account at [resend.com](https://resend.com)
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Copy the API key (starts with `re_`)

### 2. Configure Environment Variables

Update your `.env` file with the following settings:

#### Recommended: Port 465 with SSL (Most Reliable)

```env
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USER=resend
MAIL_PASSWORD=re_your_api_key_here
MAIL_SECURE=true
MAIL_REQUIRE_TLS=false
MAIL_IGNORE_TLS=false
MAIL_DEFAULT_EMAIL=noreply@yourdomain.com
MAIL_DEFAULT_NAME=Your App Name
```

#### Alternative: Port 587 with STARTTLS

```env
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USER=resend
MAIL_PASSWORD=re_your_api_key_here
MAIL_SECURE=false
MAIL_REQUIRE_TLS=true
MAIL_IGNORE_TLS=false
MAIL_DEFAULT_EMAIL=noreply@yourdomain.com
MAIL_DEFAULT_NAME=Your App Name
```

### 3. Sender Email Configuration

**For Development/Testing:**
- Use `onboarding@resend.dev` as your `MAIL_DEFAULT_EMAIL`
- This works immediately without domain verification

**For Production:**
- Verify your domain in the Resend dashboard
- Use your verified domain email (e.g., `noreply@yourdomain.com`)

## Troubleshooting

### Connection Timeout Errors

If you see `ETIMEDOUT` errors in your logs:

1. **Try Port 465**: Some hosting providers (Railway, Heroku) block port 587
   ```env
   MAIL_PORT=465
   MAIL_SECURE=true
   MAIL_REQUIRE_TLS=false
   ```

2. **Check Firewall**: Ensure your hosting provider allows outbound SMTP connections

3. **Verify API Key**: Make sure your `MAIL_PASSWORD` is a valid Resend API key

### Authentication Errors

If you see `EAUTH` errors:
- Double-check your API key is correct
- Ensure `MAIL_USER=resend` (exactly as shown)
- Regenerate your API key in Resend dashboard if needed

### Email Not Received

1. Check Resend dashboard for delivery status
2. Verify sender email is either `onboarding@resend.dev` or a verified domain
3. Check spam folder
4. Review application logs for error messages

## How It Works

### Async Email Sending

The mailer service sends emails **asynchronously** to prevent blocking API requests:

- Registration/login requests return immediately
- Emails are sent in the background
- Errors are logged but don't affect user experience
- Check application logs to monitor email delivery

### Logging

The mailer service provides detailed logging:

```
[MailerService] Initializing mail transport with config: {...}
[MailerService] Attempting to send email to: user@example.com
[MailerService] Email queued for async delivery to: user@example.com
[MailerService] Email sent successfully in 1234ms. MessageId: abc123
```

If errors occur, you'll see detailed error information including:
- Error code (ETIMEDOUT, EAUTH, etc.)
- Duration before failure
- Suggested troubleshooting steps

## Resend Dashboard

Monitor your emails at [resend.com/emails](https://resend.com/emails):
- View delivery status
- Check bounce/complaint rates
- Debug failed deliveries
- Monitor API usage

## Free Tier Limits

- **100 emails per day**
- **3,000 emails per month**
- Sufficient for development and small production apps
- Upgrade to paid plan for higher volumes
