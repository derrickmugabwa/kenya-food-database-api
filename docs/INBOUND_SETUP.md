# Inbound.new Email Provider Setup

## Overview

This application supports two email providers that can be switched via environment variable:
- **SMTP** (Resend or any SMTP server) - Requires domain verification for production
- **Inbound.new** - No domain verification required, perfect for development

## Quick Setup - Inbound.new

### 1. Get Your Inbound API Key

1. Sign up at [inbound.new](https://inbound.new)
2. Navigate to your dashboard
3. Copy your API key

### 2. Configure Environment Variables

```env
# Email Provider Selection
EMAIL_PROVIDER=inbound

# Inbound.new Configuration
INBOUND_API_KEY=your_inbound_api_key_here

# Sender Information (used by both providers)
MAIL_DEFAULT_EMAIL=noreply@yourdomain.com
MAIL_DEFAULT_NAME=Chakula API
```

### 3. Restart Your Application

The mailer service will automatically use Inbound.new for sending emails.

## SMTP Configuration (Alternative)

To use SMTP (Resend or other):

```env
# Email Provider Selection
EMAIL_PROVIDER=smtp

# SMTP Configuration
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USER=resend
MAIL_PASSWORD=re_your_api_key_here
MAIL_SECURE=true
MAIL_REQUIRE_TLS=false
MAIL_IGNORE_TLS=false

# Sender Information
MAIL_DEFAULT_EMAIL=noreply@yourdomain.com
MAIL_DEFAULT_NAME=Chakula API
```

## Provider Comparison

| Feature | Inbound.new | SMTP (Resend) |
|---------|-------------|---------------|
| **Domain Verification** | ❌ Not required | ✅ Required for production |
| **Setup Complexity** | ⭐ Simple (just API key) | ⭐⭐ Moderate (SMTP config) |
| **Best For** | Development & Testing | Production |
| **Email Delivery** | ✅ Fast, reliable | ✅ Fast, reliable |
| **Free Tier** | Generous | 100 emails/day |
| **Receive Emails** | ✅ Supported | ❌ Send only |

## Switching Between Providers

Simply change the `EMAIL_PROVIDER` environment variable:

```bash
# Development - Use Inbound
EMAIL_PROVIDER=inbound

# Production - Use SMTP
EMAIL_PROVIDER=smtp
```

No code changes required! The application automatically routes emails to the selected provider.

## Logging

The mailer service provides detailed logging for both providers:

### Inbound.new Logs
```
[MailerService] Email provider: inbound
[MailerService] Inbound client initialized successfully
[MailerService] Attempting to send email to: user@example.com via inbound
[MailerService] Email queued for async delivery to: user@example.com
[MailerService] [Inbound] Email sent successfully in 1234ms. ID: em_xxx
```

### SMTP Logs
```
[MailerService] Email provider: smtp
[MailerService] Initializing SMTP transport with config: {...}
[MailerService] Attempting to send email to: user@example.com via smtp
[MailerService] Email queued for async delivery to: user@example.com
[MailerService] [SMTP] Email sent successfully in 1234ms. MessageId: xxx
```

## Troubleshooting

### Inbound.new Issues

**Error: "Inbound client not initialized"**
- Check that `INBOUND_API_KEY` is set in your environment
- Verify the API key is valid
- Ensure `EMAIL_PROVIDER=inbound`

**Emails not being delivered**
- Check Inbound.new dashboard for delivery status
- Verify sender email is configured
- Check application logs for error messages

### SMTP Issues

**Connection Timeout**
- Try port 465 instead of 587
- Check firewall settings
- Verify SMTP credentials

**Authentication Failed**
- Double-check `MAIL_USER` and `MAIL_PASSWORD`
- Regenerate API key if using Resend

## Recommended Setup

### Development
```env
EMAIL_PROVIDER=inbound
INBOUND_API_KEY=your_key
MAIL_DEFAULT_EMAIL=dev@yourapp.com
MAIL_DEFAULT_NAME=Your App (Dev)
```

### Production
```env
EMAIL_PROVIDER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USER=resend
MAIL_PASSWORD=re_your_production_key
MAIL_SECURE=true
MAIL_REQUIRE_TLS=false
MAIL_DEFAULT_EMAIL=noreply@yourdomain.com  # Verified domain
MAIL_DEFAULT_NAME=Your App
```

## Additional Resources

- [Inbound.new Documentation](https://docs.inbound.new/)
- [Resend Documentation](https://resend.com/docs)
- [Resend SMTP Setup Guide](./RESEND_SETUP.md)
