# Email Setup for Waitlist Notifications

This guide explains how to set up email notifications for your waitlist functionality using Resend (recommended) or other email services.

## Quick Summary

**Currently, your waitlist only stores data in the database.** To send confirmation emails when users subscribe, you need to:

1. Choose an email service (Resend recommended)
2. Get API credentials 
3. Add environment variables
4. Install the email package
5. Update your API route

## Option 1: Resend (Recommended)

Resend is developer-friendly and has excellent deliverability.

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain (or use their test domain for development)

### Step 2: Get Your API Key

1. In your Resend dashboard, go to **API Keys**
2. Create a new API key
3. Copy the key (starts with `re_`)

### Step 3: Install Resend Package

```bash
npm install resend
```

### Step 4: Add Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=hello@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### Step 5: Update Your API Route

Modify `/app/api/waitlist/route.ts` to send emails:

```typescript
import { sendWaitlistConfirmationEmail, sendWaitlistAdminNotification } from '@/lib/email-service';

// Add this after successful subscription in the POST function:
if (result.success && result.data) {
  // Send confirmation email (don't block the response)
  sendWaitlistConfirmationEmail({
    email: subscriptionData.email,
    firstName: subscriptionData.firstName,
    lastName: subscriptionData.lastName,
  }).catch(console.error);

  // Send admin notification (optional)
  sendWaitlistAdminNotification({
    email: subscriptionData.email,
    firstName: subscriptionData.firstName,
    lastName: subscriptionData.lastName,
  }).catch(console.error);
}
```

## Option 2: SendGrid

If you prefer SendGrid:

### Install SendGrid

```bash
npm install @sendgrid/mail
```

### Environment Variables

```env
SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=hello@yourdomain.com
```

### Example SendGrid Integration

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
  const msg = {
    to,
    from: process.env.FROM_EMAIL!,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error };
  }
}
```

## Option 3: Nodemailer (SMTP)

For custom SMTP or services like Gmail:

### Install Nodemailer

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### Environment Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### Example Nodemailer Setup

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('SMTP error:', error);
    return { success: false, error };
  }
}
```

## Testing Email Setup

1. **Test API Key**: Visit `/api/waitlist?test=email` (you'll need to add this endpoint)
2. **Test Subscription**: Use your waitlist form with a real email
3. **Check Logs**: Look for email success/error messages in your console

## Email Templates

Your emails should include:

- **Welcome message** with user's name
- **What happens next** (when they'll hear from you)
- **Unsubscribe link** (required for compliance)
- **Company branding**
- **Contact information**

## Best Practices

### 1. Domain Verification
- Verify your sending domain for better deliverability
- Use a professional email address (not Gmail for production)

### 2. Email Compliance
- Include unsubscribe links
- Add your company address
- Follow CAN-SPAM Act guidelines

### 3. Error Handling
- Don't let email failures break the signup process
- Log email errors for debugging
- Have fallback options

### 4. Rate Limiting
- Be mindful of email service limits
- Consider queuing for high-volume signups

## Troubleshooting

### Common Issues

**"Invalid API Key"**
- Double-check your API key in Resend dashboard
- Ensure no extra spaces in `.env.local`

**"Domain not verified"**
- Verify your domain in Resend
- Or use `onboarding@resend.dev` for testing

**"Emails not arriving"**
- Check spam folders
- Verify recipient email address
- Check Resend logs for delivery status

### Development vs Production

**Development:**
- Use test email addresses
- Monitor console logs
- Use Resend's test domain

**Production:**
- Set up proper domain verification
- Monitor email delivery rates
- Set up proper error logging

## Cost Considerations

- **Resend**: 3,000 emails/month free, then $0.0004 per email
- **SendGrid**: 100 emails/day free, then paid plans
- **SMTP**: Usually free with hosting providers

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate API keys regularly
- Monitor email sending for abuse

## Next Steps

After setting up emails, consider:

1. **Email analytics** - Track open rates, clicks
2. **Drip campaigns** - Send follow-up emails
3. **Segmentation** - Different emails for different user types
4. **A/B testing** - Test different email content
5. **Integration** - Connect with marketing tools like Mailchimp

---

## Quick Start (Resend)

If you want to get started quickly:

1. `npm install resend`
2. Get API key from [resend.com](https://resend.com)
3. Add `RESEND_API_KEY=re_xxx` to `.env.local`
4. Add `FROM_EMAIL=hello@yourdomain.com` to `.env.local`
5. The email service is already coded in `/lib/email-service.ts`
6. Just uncomment the email sending lines in your API route

That's it! Your users will now receive beautiful confirmation emails when they join your waitlist. 🎉