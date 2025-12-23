// Password Reset Email Template - Hybrid OTP + Link Approach
// Provides users with both OTP code entry and direct reset link options

import {
  EmailTemplate,
  EmailTemplateFunction,
  EmailConfig,
  TemplateContext,
} from "./types";
import {
  createBaseEmailHTML,
  createEmailHeader,
  createEmailFooter,
  createTemplateContext,
  createPlainTextTemplate,
} from "./base-template";

// Password reset specific data interface
export interface PasswordResetEmailData {
  email: string;
  firstName: string;
  otpCode: string; // 6-digit OTP code
  resetLink: string; // Direct reset link URL
  expiryMinutes?: number; // Default 15 minutes
}

// RealEST configuration for password reset emails
const REALEST_CONFIG: EmailConfig = {
  companyName: "RealEST",
  tagline: "Secure Property Platform",
  domain: "realest.ng",
  fromEmail: process.env.FROM_EMAIL || "hello@realest.ng",
  supportEmail: "hello@realest.ng",
  unsubscribeUrl: "{unsubscribe_url}",
  websiteUrl: "https://realest.ng",
  logoUrl: "https://realest.ng/realest-logo.svg",
};

// Security-focused icons (data URLs for email compatibility)
const ICONS = {
  shield:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgMTJ2NmMwIDYuMTI1LTQuODc1IDEwLTEwIDEwcy0xMC00Ljg3NS0xMC0xMFYxMkwxMiAyWiIgc3Ryb2tlPSIjQURGNDM0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJtMTIgMTJ2NmwxLTQgNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQURGNDM0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K",
  lock: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMTEiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxMSIgcng9IjIiIHJ5PSIyIiBzdHJva2U9IiMwNzQwMkYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjE2IiByPSI0IiBzdHJva2U9IiMwNzQwMkYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJtOSAxMWg2YTIgMiAwIDAgMSAyIDJ2NWEyIDIgMCAwIDEtMiAySDlhMiAyIDAgMCAxLTItMlYxM2EyIDIgMCAwIDEgMi0yaCIiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo8L3N2Zz4K",
  clock:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KPHBhdGggZD0iTTkgMTJ2NmwxIDQgNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDc0MDJGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K",
  key: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDJ2NmE4IDggMCAwIDEtOCA4djJhMiAyIDAgMCAxLTQgMHYtMmE4IDggMCAwIDEtOCA4VjJhMiAyIDAgMCAxLTQgMHYtNmEyIDIgMCAwIDEgNC0waDgiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIyIiBmaWxsPSIjMDc0MDJGIi8+Cjwvc3ZnPgo8L3N2Zz4K",
};

/**
 * Create password reset email template with hybrid OTP + link approach
 */
export const createPasswordResetTemplate: EmailTemplateFunction<
  PasswordResetEmailData
> = (
  data: PasswordResetEmailData,
  context?: Partial<TemplateContext>,
): EmailTemplate => {
  const config = { ...REALEST_CONFIG, ...context?.company };
  const expiryMinutes = data.expiryMinutes || 15;

  // Create template context
  const templateContext = createTemplateContext(data, config, context);

  const subject = `Reset Your RealEST Password - ${data.otpCode}`;

  // Email header
  const header = createEmailHeader(
    config.companyName,
    "Password Reset Request",
  );

  // OTP Code Section
  const otpSection = `
    <div style="
      background: linear-gradient(135deg, #F8F9F7 0%, #FFFFFF 100%);
      border: 2px solid #E5E7EB;
      border-radius: 16px;
      padding: 32px 24px;
      margin: 24px 0;
      text-align: center;
    ">
      <div style="margin-bottom: 16px;">
        <img src="${ICONS.shield}" alt="Security Shield" width="48" height="48" style="display: block; margin: 0 auto;" />
      </div>
      <h3 style="
        font-family: 'Neulis Neue', 'Space Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 700;
        color: #07402F;
        margin: 0 0 8px 0;
      ">
        Your Security Code
      </h3>
      <p style="
        font-size: 14px;
        color: #6B7280;
        margin: 0 0 24px 0;
      ">
        Enter this code to reset your password
      </p>

      <!-- OTP Code Display -->
      <div style="
        background: linear-gradient(135deg, #07402F 0%, #2E322E 100%);
        color: #ADF434;
        font-family: 'JetBrains Mono', monospace;
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 8px;
        padding: 20px 32px;
        border-radius: 12px;
        display: inline-block;
        margin: 0 auto;
        box-shadow: 0 4px 12px rgba(7, 64, 47, 0.3);
      ">
        ${data.otpCode.split("").join(" ")}
      </div>

      <p style="
        font-size: 12px;
        color: #9CA3AF;
        margin: 16px 0 0 0;
        font-family: 'JetBrains Mono', monospace;
      ">
        Expires in ${expiryMinutes} minutes
      </p>
    </div>
  `;

  // Reset Link Section
  const resetLinkSection = `
    <div style="
      background: #F8F9F7;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    ">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <img src="${ICONS.key}" alt="Reset Key" width="24" height="24" />
        <h4 style="
          font-family: 'Neulis Neue', 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #07402F;
          margin: 0;
        ">
          Alternative: Direct Reset Link
        </h4>
      </div>

      <p style="
        font-size: 14px;
        color: #374151;
        margin: 0 0 20px 0;
        line-height: 1.5;
      ">
        If entering the code doesn't work, click the button below to reset your password directly:
      </p>

      <div style="text-align: center;">
        <a href="${data.resetLink}" style="
          background: linear-gradient(135deg, #ADF434 0%, #9FE02A 100%);
          color: #07402F;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          padding: 16px 32px;
          border-radius: 8px;
          display: inline-block;
          box-shadow: 0 4px 12px rgba(173, 244, 52, 0.3);
          transition: all 0.2s ease;
        ">
          🔐 Reset Password Now
        </a>
      </div>

      <p style="
        font-size: 12px;
        color: #9CA3AF;
        margin: 16px 0 0 0;
        text-align: center;
      ">
        Link expires in ${expiryMinutes} minutes
      </p>
    </div>
  `;

  // Security Notice
  const securityNotice = `
    <div style="
      background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
      border: 1px solid #F59E0B;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    ">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <img src="${ICONS.clock}" alt="Time Warning" width="20" height="20" style="margin-top: 2px;" />
        <div>
          <p style="
            font-size: 14px;
            font-weight: 600;
            color: #92400E;
            margin: 0 0 4px 0;
          ">
            ⏰ Time-Sensitive Security Action
          </p>
          <p style="
            font-size: 13px;
            color: #78350F;
            margin: 0;
            line-height: 1.4;
          ">
            This code and link will expire in ${expiryMinutes} minutes for your security.
            If you didn't request this reset, please ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;

  // Support Information
  const supportSection = `
    <div style="text-align: center; margin: 32px 0;">
      <p style="
        font-size: 14px;
        color: #6B7280;
        margin: 0 0 16px 0;
      ">
        Having trouble? Contact our support team
      </p>
      <a href="mailto:${config.supportEmail}" style="
        color: #07402F;
        text-decoration: none;
        font-weight: 500;
        font-size: 14px;
        padding: 8px 16px;
        border: 1px solid #E5E7EB;
        border-radius: 6px;
        display: inline-block;
      ">
        📧 Get Help
      </a>
    </div>
  `;

  // Assemble email content
  const emailContent = `
    ${header}

    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="
          font-family: 'Neulis Neue', 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #07402F;
          margin: 0 0 8px 0;
        ">
          Reset Your Password
        </h2>
        <p style="
          font-size: 16px;
          color: #6B7280;
          margin: 0;
        ">
          Hi ${data.firstName}, we received a password reset request for your RealEST account.
        </p>
      </div>

      ${otpSection}
      ${resetLinkSection}
      ${securityNotice}
      ${supportSection}
    </div>

    ${createEmailFooter(config)}
  `;

  // Create HTML email
  const html = createBaseEmailHTML(emailContent, subject);

  // Create plain text version
  const textContent = `
Password Reset Request - RealEST

Hi ${data.firstName},

We received a password reset request for your RealEST account.

SECURITY CODE: ${data.otpCode}
Expires in: ${expiryMinutes} minutes

Enter this code on our website to reset your password, or use the direct link below:

Reset Password: ${data.resetLink}
Link expires in: ${expiryMinutes} minutes

For your security, both the code and link will expire in ${expiryMinutes} minutes.
If you didn't request this reset, please ignore this email.

Need help? Contact us at: ${config.supportEmail}

© ${new Date().getFullYear()} ${config.companyName}
${config.tagline} • ${config.domain}
  `.trim();

  const text = createPlainTextTemplate(textContent, config);

  return { subject, html, text };
};

// Default export for backward compatibility
export default createPasswordResetTemplate;
