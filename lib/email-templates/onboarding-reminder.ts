// Onboarding Reminder Email Template
// Sent to users who have registered but haven't completed onboarding

import {
  EmailTemplate,
  EmailTemplateFunction,
  EmailConfig,
  TemplateContext,
  OnboardingReminderEmailData,
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

const ROLE_LABELS: Record<
  OnboardingReminderEmailData["userType"],
  string
> = {
  agent: "Property Agent",
  owner: "Property Owner",
  user: "Property Seeker",
};

const ROLE_PITCH: Record<OnboardingReminderEmailData["userType"], string> = {
  agent:
    "Complete your agent profile to start listing properties and receiving verified leads from buyers and tenants across Nigeria.",
  owner:
    "Complete your owner profile to list your properties and connect with thousands of verified seekers.",
  user:
    "Finish setting up your account to unlock personalized property recommendations and direct messaging with owners.",
};

const ROLE_CTA: Record<OnboardingReminderEmailData["userType"], string> = {
  agent: "Complete Agent Profile",
  owner: "Complete Owner Profile",
  user: "Finish Setup",
};

/**
 * Creates a reminder email for users who haven't completed onboarding.
 */
export const createOnboardingReminderTemplate: EmailTemplateFunction<
  OnboardingReminderEmailData
> = (
  data: OnboardingReminderEmailData,
  _context?: Partial<TemplateContext>,
): EmailTemplate => {
  const config = REALEST_CONFIG;
  const roleLabel = ROLE_LABELS[data.userType];
  const pitch = ROLE_PITCH[data.userType];
  const cta = ROLE_CTA[data.userType];

  const daysCopy =
    data.daysElapsed && data.daysElapsed > 0
      ? `It's been ${data.daysElapsed} day${data.daysElapsed === 1 ? "" : "s"} since you signed up.`
      : "You signed up recently but haven't finished yet.";

  const subject = `${data.firstName}, finish setting up your RealEST account`;

  const header = createEmailHeader(config.companyName, "Almost There!");

  const emailContent = `
    ${header}

    <div style="padding: 40px 32px;">

      <!-- Progress indicator (75% done) -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="
          display: inline-block;
          background: linear-gradient(135deg, #F8F9F7 0%, #FFFFFF 100%);
          border: 2px solid #E5E7EB;
          border-radius: 50%;
          width: 72px;
          height: 72px;
          line-height: 72px;
          font-size: 36px;
          margin-bottom: 20px;
        ">⏳</div>
        <h2 style="
          font-family: 'Neulis Neue', 'Space Grotesk', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #07402F;
          margin: 0 0 10px 0;
        ">Almost there, ${data.firstName}!</h2>
        <p style="font-size: 15px; color: #6B7280; margin: 0; line-height: 1.5;">
          ${daysCopy}<br/>
          Your <strong style="color: #07402F;">${roleLabel}</strong> profile is waiting to be completed.
        </p>
      </div>

      <!-- Progress bar (visual only) -->
      <div style="
        background: #E5E7EB;
        border-radius: 999px;
        height: 8px;
        margin-bottom: 8px;
        overflow: hidden;
      ">
        <div style="
          background: linear-gradient(90deg, #ADF434 0%, #9FE02A 100%);
          width: 50%;
          height: 100%;
          border-radius: 999px;
        "></div>
      </div>
      <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 32px 0; text-align: center;">
        Account created — profile setup remaining
      </p>

      <!-- Why finish pitch -->
      <div style="
        background: #F8F9F7;
        border-left: 4px solid #ADF434;
        border-radius: 0 12px 12px 0;
        padding: 20px 24px;
        margin-bottom: 32px;
      ">
        <p style="
          font-size: 15px;
          color: #374151;
          line-height: 1.6;
          margin: 0;
        ">${pitch}</p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 40px;">
        <a href="${data.onboardingUrl}" style="
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
        ">${cta} →</a>
        <p style="font-size: 12px; color: #9CA3AF; margin: 12px 0 0 0;">
          Takes less than 3 minutes
        </p>
      </div>

      <!-- Reassurance note -->
      <div style="
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 20px 24px;
        text-align: center;
      ">
        <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;">
          Don't want to complete your profile right now?
        </p>
        <p style="font-size: 13px; color: #9CA3AF; margin: 0;">
          Your account will remain active. You can finish setup at any time by
          logging in and visiting your onboarding page.
        </p>
      </div>

      <!-- Support -->
      <div style="text-align: center; margin-top: 32px;">
        <p style="font-size: 13px; color: #9CA3AF; margin: 0;">
          Need help? Email us at
          <a href="mailto:${config.supportEmail}" style="color: #07402F; font-weight: 500;">${config.supportEmail}</a>
        </p>
      </div>

    </div>

    ${createEmailFooter(config)}
  `;

  const html = createBaseEmailHTML(emailContent, subject);

  const plainText = `
${data.firstName}, finish setting up your RealEST account

${daysCopy}
Your ${roleLabel} profile is waiting to be completed.

${pitch}

Complete your profile here: ${data.onboardingUrl}
(Takes less than 3 minutes)

Your account remains active. You can finish setup at any time.

Questions? Contact us at ${config.supportEmail}

© ${new Date().getFullYear()} ${config.companyName}
${config.tagline} • ${config.domain}
  `.trim();

  const text = createPlainTextTemplate(plainText, config);

  return { subject, html, text };
};

export default createOnboardingReminderTemplate;
