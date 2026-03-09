// Welcome Email Template
// Sent when a user completes their onboarding (agent, owner, or regular user)

import {
  EmailTemplate,
  EmailTemplateFunction,
  EmailConfig,
  TemplateContext,
  WelcomeEmailData,
} from "./types";
import {
  createBaseEmailHTML,
  createEmailHeader,
  createEmailFooter,
  createPlainTextTemplate,
} from "./base-template";

const REALEST_CONFIG: EmailConfig = {
  companyName: "RealEST Connect",
  tagline: "Nigeria's Trusted Property Marketplace",
  domain: "realest.ng",
  fromEmail: process.env.FROM_EMAIL_AUTH || "hello@realest.ng",
  supportEmail: "hello@realest.ng",
  unsubscribeUrl: "{unsubscribe_url}",
  websiteUrl: "https://realest.ng",
  logoUrl: "https://realest.ng/realest-logo.svg",
};

/** Human-readable role labels */
const ROLE_LABELS: Record<WelcomeEmailData["userType"], string> = {
  agent: "Property Agent",
  owner: "Property Owner",
  user: "Property Seeker",
};

/** Next-step call-to-action copy per role */
const ROLE_CTA: Record<WelcomeEmailData["userType"], string> = {
  agent: "Go to Agent Dashboard",
  owner: "Go to Owner Dashboard",
  user: "Start Searching",
};

/** Short benefit copy per role */
const ROLE_BENEFITS: Record<WelcomeEmailData["userType"], string[]> = {
  agent: [
    "List and manage properties on behalf of owners",
    "Receive inquiries directly from verified buyers and tenants",
    "Build your professional profile and grow your network",
  ],
  owner: [
    "List your properties and reach thousands of verified seekers",
    "Manage inquiries and track listing performance",
    "Get your listings verified for maximum trust and visibility",
  ],
  user: [
    "Browse verified properties across Nigeria",
    "Send inquiries directly to owners and agents",
    "Save your favourite listings and get alerts",
  ],
};

/**
 * Creates the welcome email sent after onboarding completion.
 */
export const createWelcomeTemplate: EmailTemplateFunction<WelcomeEmailData> = (
  data: WelcomeEmailData,
  _context?: Partial<TemplateContext>,
): EmailTemplate => {
  const config = REALEST_CONFIG;
  const roleLabel = ROLE_LABELS[data.userType];
  const ctaLabel = ROLE_CTA[data.userType];
  const benefits = ROLE_BENEFITS[data.userType];

  const subject = `Welcome to RealEST, ${data.firstName}! 🎉`;

  const header = createEmailHeader(config.companyName, "Welcome to RealEST");

  const benefitRows = benefits
    .map(
      (b) => `
      <tr>
        <td style="padding: 8px 0; vertical-align: top;">
          <span style="
            display: inline-block;
            width: 22px;
            height: 22px;
            background: #ADF434;
            border-radius: 50%;
            text-align: center;
            line-height: 22px;
            font-size: 12px;
            font-weight: 700;
            color: #07402F;
            margin-right: 10px;
            flex-shrink: 0;
          ">✓</span>
          <span style="font-size: 14px; color: #374151; line-height: 1.5;">${b}</span>
        </td>
      </tr>`,
    )
    .join("");

  const emailContent = `
    ${header}

    <div style="padding: 40px 32px;">

      <!-- Hero greeting -->
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="
          display: inline-block;
          background: linear-gradient(135deg, #ADF434 0%, #9FE02A 100%);
          border-radius: 50%;
          width: 72px;
          height: 72px;
          line-height: 72px;
          font-size: 36px;
          margin-bottom: 20px;
        ">🎉</div>
        <h2 style="
          font-family: 'Neulis Neue', 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #07402F;
          margin: 0 0 10px 0;
        ">You're all set, ${data.firstName}!</h2>
        <p style="
          font-size: 16px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        ">
          Your <strong style="color: #07402F;">${roleLabel}</strong> account is now active.<br/>
          Here's what you can do on RealEST:
        </p>
      </div>

      <!-- Benefits list -->
      <div style="
        background: #F8F9F7;
        border: 1px solid #E5E7EB;
        border-radius: 16px;
        padding: 28px 28px 20px;
        margin-bottom: 32px;
      ">
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${benefitRows}
          </tbody>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 40px;">
        <a href="${data.dashboardUrl}" style="
          background: linear-gradient(135deg, #ADF434 0%, #9FE02A 100%);
          color: #07402F;
          text-decoration: none;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 16px;
          padding: 16px 40px;
          border-radius: 8px;
          display: inline-block;
          box-shadow: 0 4px 14px rgba(173, 244, 52, 0.4);
        ">${ctaLabel} →</a>
      </div>

      <!-- Verification note for agents/owners -->
      ${data.userType !== "user" ? `
      <div style="
        background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
        border: 1px solid #BFDBFE;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 32px;
      ">
        <p style="
          font-size: 14px;
          color: #1E40AF;
          margin: 0 0 4px 0;
          font-weight: 600;
        ">🔍 Verification Coming Soon</p>
        <p style="
          font-size: 13px;
          color: #1D4ED8;
          margin: 0;
          line-height: 1.5;
        ">
          Our team will review your profile for verification, which enables the full
          trust badge on your listings. We'll notify you once it's complete.
        </p>
      </div>
      ` : ""}

      <!-- Support -->
      <div style="text-align: center;">
        <p style="font-size: 13px; color: #9CA3AF; margin: 0;">
          Questions? Email us at
          <a href="mailto:${config.supportEmail}" style="color: #07402F; font-weight: 500;">${config.supportEmail}</a>
        </p>
      </div>

    </div>

    ${createEmailFooter(config)}
  `;

  const html = createBaseEmailHTML(emailContent, subject);

  const plainText = `
Welcome to RealEST, ${data.firstName}!

Your ${roleLabel} account is now active.

What you can do on RealEST:
${benefits.map((b) => `• ${b}`).join("\n")}

${ctaLabel}: ${data.dashboardUrl}

${data.userType !== "user" ? "Note: Our team will review your profile for verification shortly. We'll notify you once complete.\n\n" : ""}Questions? Contact us at ${config.supportEmail}

© ${new Date().getFullYear()} ${config.companyName}
${config.tagline} • ${config.domain}
  `.trim();

  const text = createPlainTextTemplate(plainText, config);

  return { subject, html, text };
};

export default createWelcomeTemplate;
