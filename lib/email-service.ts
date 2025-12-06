import { Resend } from 'resend';

// Email service configuration
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@yourdomain.com';
const COMPANY_NAME = 'RealProof';

interface WaitlistEmailData {
  email: string;
  firstName: string;
  lastName?: string;
  position?: number; // Position in waitlist
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmationEmail(data: WaitlistEmailData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email sending disabled.');
      return { success: false, error: 'Email service not configured' };
    }

    const fullName = data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName;
    const template = getWaitlistConfirmationTemplate(data.firstName, fullName, data.position);

    const { data: emailResult, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Confirmation email sent:', emailResult?.id);
    return { success: true, messageId: emailResult?.id };

  } catch (error) {
    console.error('❌ Unexpected email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    };
  }
}

/**
 * Send admin notification email when someone joins waitlist
 */
export async function sendWaitlistAdminNotification(data: WaitlistEmailData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
      return { success: false, error: 'Admin notifications not configured' };
    }

    const fullName = data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [process.env.ADMIN_EMAIL],
      subject: `New Waitlist Signup - ${fullName}`,
      html: getAdminNotificationTemplate(data),
      text: `New waitlist signup: ${fullName} (${data.email})`,
    });

    if (error) {
      console.error('❌ Admin notification failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Admin notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate waitlist confirmation email template
 */
function getWaitlistConfirmationTemplate(
  firstName: string,
  fullName: string,
  position?: number
): EmailTemplate {
  const positionText = position ? `You're #${position} on our waitlist!` : '';

  const subject = `Welcome to ${COMPANY_NAME} Waitlist! 🎉`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
            .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
            .stat-label { font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏠 ${COMPANY_NAME}</h1>
            <h2>Welcome to the Future of Real Estate!</h2>
        </div>

        <div class="content">
            <h2>Hi ${firstName}! 👋</h2>

            <p>Thank you for joining our waitlist! We're thrilled to have you as part of our community.</p>

            ${position ? `<div class="highlight">
                <h3>🎯 ${positionText}</h3>
                <p>You're one of our early supporters, and we can't wait to show you what we've been building.</p>
            </div>` : ''}

            <div class="highlight">
                <h3>What happens next?</h3>
                <ul>
                    <li>✅ <strong>Confirmation:</strong> You're officially on our waitlist</li>
                    <li>🚀 <strong>Early Access:</strong> You'll be among the first to access our platform</li>
                    <li>📧 <strong>Updates:</strong> We'll keep you informed about our progress</li>
                    <li>🎁 <strong>Exclusive Benefits:</strong> Special launch offers and features</li>
                </ul>
            </div>

            <div class="stats">
                <div class="stat">
                    <div class="stat-number">10K+</div>
                    <div class="stat-label">Properties Ready</div>
                </div>
                <div class="stat">
                    <div class="stat-number">99.9%</div>
                    <div class="stat-label">Verification Accuracy</div>
                </div>
                <div class="stat">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Fake Listings</div>
                </div>
            </div>

            <p><strong>What makes ${COMPANY_NAME} different?</strong></p>
            <ul>
                <li><strong>Geo-Verified Properties:</strong> Every listing is verified with precise location data</li>
                <li><strong>Zero Duplicates:</strong> No more scrolling through the same property multiple times</li>
                <li><strong>Real-Time Market Data:</strong> Live insights and pricing information</li>
                <li><strong>Transparent Process:</strong> No hidden fees, no fake listings, no surprises</li>
            </ul>

            <p>We're working hard to launch soon and we'll notify you the moment we're ready!</p>

            <p>Have questions? Just reply to this email - we'd love to hear from you.</p>

            <p>Best regards,<br>
            The ${COMPANY_NAME} Team</p>
        </div>

        <div class="footer">
            <p>© 2024 ${COMPANY_NAME}. All rights reserved.</p>
            <p>You received this email because you signed up for our waitlist.</p>
            <p><a href="{unsubscribe_url}" style="color: #666;">Unsubscribe</a> | <a href="mailto:hello@realproof.ng" style="color: #666;">Contact Us</a></p>
        </div>
    </body>
    </html>
  `;

  const text = `
Welcome to ${COMPANY_NAME} Waitlist!

Hi ${firstName}!

Thank you for joining our waitlist! We're building Nigeria's most trusted property marketplace with geo-verified listings and zero duplicates.

${positionText}

What happens next:
✅ You're officially on our waitlist
🚀 You'll get early access when we launch
📧 We'll keep you updated on our progress
🎁 Exclusive launch benefits await you

What makes us different:
- Geo-Verified Properties: Every listing verified with precise location
- Zero Duplicates: No more seeing the same property multiple times
- Real-Time Market Data: Live insights and pricing
- Transparent Process: No hidden fees or fake listings

We'll notify you the moment we're ready to launch!

Questions? Just reply to this email.

Best regards,
The ${COMPANY_NAME} Team

© 2024 ${COMPANY_NAME}. All rights reserved.
Unsubscribe: {unsubscribe_url}
  `;

  return { subject, html, text };
}

/**
 * Generate admin notification template
 */
function getAdminNotificationTemplate(data: WaitlistEmailData): string {
  const fullName = data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 10px; }
            .user-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .label { font-weight: bold; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>🎉 New Waitlist Signup</h2>
        </div>

        <div class="content">
            <p>A new user has joined the ${COMPANY_NAME} waitlist!</p>

            <div class="user-info">
                <p><span class="label">Name:</span> ${fullName}</p>
                <p><span class="label">Email:</span> ${data.email}</p>
                ${data.position ? `<p><span class="label">Position:</span> #${data.position}</p>` : ''}
                <p><span class="label">Signed up:</span> ${new Date().toLocaleString()}</p>
            </div>

            <p>Check your admin dashboard for more details.</p>
        </div>
    </body>
    </html>
  `;
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    // Test with a simple API call to Resend
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Invalid API key or configuration' };
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Environment variables needed:
 *
 * RESEND_API_KEY=re_xxxxxxxx (get from resend.com)
 * FROM_EMAIL=hello@yourdomain.com (verified domain in Resend)
 * ADMIN_EMAIL=admin@yourdomain.com (optional, for admin notifications)
 */
