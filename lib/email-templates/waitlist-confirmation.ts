import {
  EmailTemplate,
  WaitlistEmailData,
  EmailConfig,
  TemplateContext,
  EmailTemplateFunction,
  realestEmailStyles
} from './types';
import {
  createBaseEmailHTML,
  createEmailHeader,
  createEmailFooter,
  createTemplateContext,
  createPlainTextTemplate,
  createPositionBadge
} from './base-template';

// RealEST configuration
const REALEST_CONFIG: EmailConfig = {
  companyName: 'RealEST',
  tagline: 'Find Your Next Move',
  domain: 'realest.ng',
  fromEmail: 'hello@realest.ng',
  supportEmail: 'hello@realest.ng',
  unsubscribeUrl: '{unsubscribe_url}',
  websiteUrl: 'https://realest.ng',
  logoUrl: 'https://realest.ng/realest-logo.svg'
};

// Simplified key metrics
const KEY_METRICS = [
  { value: '10K+', label: 'Properties', icon: 'home' },
  { value: '99.9%', label: 'Accuracy', icon: 'target' },
  { value: '0', label: 'Fake Listings', icon: 'shield' }
];

// Core features - minimal and focused
const CORE_FEATURES = [
  {
    icon: 'map-pin',
    title: 'Geo-Verified',
    description: 'Every property verified with precise GPS coordinates'
  },
  {
    icon: 'check-circle',
    title: 'Zero Duplicates',
    description: 'Each listing is unique and authenticated'
  },
  {
    icon: 'trending-up',
    title: 'Live Insights',
    description: 'Real-time market data and pricing trends'
  }
];

/**
 * SVG Icons - Lucide-inspired minimal icons
 */
const ICONS: Record<string, string> = {
  'map-pin': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  'check-circle': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
  'trending-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
  'home': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  'target': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  'shield': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  'flag': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>'
};

/**
 * Generate minimal, modern waitlist confirmation email
 */
export const createWaitlistConfirmationTemplate: EmailTemplateFunction<WaitlistEmailData> = (
  data: WaitlistEmailData,
  contextOverrides: Partial<TemplateContext> = {}
): EmailTemplate => {
  const config = REALEST_CONFIG;
  const context = createTemplateContext(data, config, contextOverrides);

  const subject = `You're on the RealEST Waitlist!`;

  // Minimal header
  const header = createEmailHeader(
    context.company.companyName,
    context.company.tagline,
    context.company.logoUrl
  );

  // Conservative position badge with minimal design
  const positionContent = data.position
    ? createPositionBadge(data.position)
    : `
      <div style="text-align: center; margin: ${realestEmailStyles.spacing.xxl} 0;">
        <div style="
          display: inline-flex;
          align-items: center;
          gap: ${realestEmailStyles.spacing.md};
          background: ${realestEmailStyles.colors.cardBackground};
          border: 1px solid ${realestEmailStyles.colors.brandAccent};
          padding: ${realestEmailStyles.spacing.md} ${realestEmailStyles.spacing.lg};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(7, 64, 47, 0.08);
        ">
          <div style="
            width: 20px;
            height: 20px;
            color: ${realestEmailStyles.colors.brandAccent};
          ">${ICONS['check-circle']}</div>
          <span style="
            font-family: ${realestEmailStyles.fonts.body};
            font-weight: 600;
            font-size: 16px;
            color: ${realestEmailStyles.colors.brandDark};
          ">You're In!</span>
        </div>
      </div>
    `;

  // Conservative metrics section with consistent spacing
  const metricsSection = `
    <div style="
      background: ${realestEmailStyles.colors.cardBackground};
      border: 1px solid ${realestEmailStyles.colors.border};
      border-radius: 8px;
      padding: ${realestEmailStyles.spacing.xl};
      margin: ${realestEmailStyles.spacing.xxl} 0;
    ">
      <h3 style="
        font-family: ${realestEmailStyles.fonts.heading};
        font-size: 18px;
        font-weight: 600;
        color: ${realestEmailStyles.colors.brandDark};
        text-align: center;
        margin: 0 0 ${realestEmailStyles.spacing.xl};
      ">Our Commitment</h3>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          ${KEY_METRICS.map(metric => `
            <td style="
              text-align: center;
              padding: ${realestEmailStyles.spacing.lg} ${realestEmailStyles.spacing.md};
              border-right: 1px solid ${realestEmailStyles.colors.border};
            ">
              <div style="
                width: 40px;
                height: 40px;
                margin: 0 auto ${realestEmailStyles.spacing.md};
                background: ${realestEmailStyles.colors.brandLight};
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${realestEmailStyles.colors.brandDark};
              ">
                ${ICONS[metric.icon]}
              </div>
              <div style="
                font-family: ${realestEmailStyles.fonts.heading};
                font-size: 24px;
                font-weight: 700;
                color: ${realestEmailStyles.colors.brandDark};
                margin-bottom: ${realestEmailStyles.spacing.xs};
              ">${metric.value}</div>
              <div style="
                font-size: 12px;
                color: ${realestEmailStyles.colors.textMuted};
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
              ">${metric.label}</div>
            </td>
          `).join('')}
        </tr>
      </table>
    </div>
  `;

  // Conservative features section with minimal design
  const featuresSection = `
    <div style="margin: ${realestEmailStyles.spacing.xxl} 0;">
      <h3 style="
        font-family: ${realestEmailStyles.fonts.heading};
        font-size: 18px;
        font-weight: 600;
        color: ${realestEmailStyles.colors.brandDark};
        text-align: center;
        margin: 0 0 ${realestEmailStyles.spacing.xl};
      ">What Makes Us Different</h3>

      <table style="width: 100%; border-collapse: collapse; max-width: 500px; margin: 0 auto;">
        ${CORE_FEATURES.map((feature, index) => `
          <tr>
            <td style="
              padding: ${realestEmailStyles.spacing.lg} 0;
              border-bottom: ${index < CORE_FEATURES.length - 1 ? `1px solid ${realestEmailStyles.colors.border}` : 'none'};
            ">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 60px; vertical-align: top; padding-right: ${realestEmailStyles.spacing.lg};">
                    <div style="
                      width: 44px;
                      height: 44px;
                      background: ${realestEmailStyles.colors.brandLight};
                      border: 1px solid ${realestEmailStyles.colors.brandAccent};
                      border-radius: 8px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: ${realestEmailStyles.colors.brandDark};
                    ">
                      ${ICONS[feature.icon]}
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <div style="
                      font-family: ${realestEmailStyles.fonts.heading};
                      font-weight: 600;
                      color: ${realestEmailStyles.colors.brandDark};
                      font-size: 16px;
                      margin-bottom: ${realestEmailStyles.spacing.sm};
                      line-height: 1.3;
                    ">${feature.title}</div>
                    <div style="
                      font-size: 14px;
                      color: ${realestEmailStyles.colors.textMuted};
                      line-height: 1.5;
                      font-weight: 400;
                    ">${feature.description}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;

  // Conservative Nigerian context section
  const nigerianBadge = `
    <div style="
      text-align: center;
      margin: ${realestEmailStyles.spacing.xxl} 0;
      padding: ${realestEmailStyles.spacing.xl};
      background: ${realestEmailStyles.colors.cardBackground};
      border: 1px solid ${realestEmailStyles.colors.success};
      border-radius: 8px;
    ">
      <div style="
        display: inline-flex;
        align-items: center;
        gap: ${realestEmailStyles.spacing.sm};
        margin-bottom: ${realestEmailStyles.spacing.lg};
      ">
        <div style="
          width: 20px;
          height: 20px;
          color: ${realestEmailStyles.colors.success};
        ">${ICONS.flag}</div>
        <span style="
          font-family: ${realestEmailStyles.fonts.heading};
          font-weight: 600;
          color: ${realestEmailStyles.colors.brandDark};
          font-size: 16px;
        ">Built for Nigeria</span>
      </div>

      <p style="
        color: ${realestEmailStyles.colors.textMuted};
        font-size: 14px;
        margin: 0;
        line-height: 1.6;
        max-width: 400px;
        margin: 0 auto;
      ">Understanding Lagos traffic, Abuja layouts, Port Harcourt neighborhoods, and Kano markets</p>
    </div>
  `;

  // Professional conservative email layout
  const emailContent = `
    ${header}
    <div style="
      padding: ${realestEmailStyles.spacing.xxl} ${realestEmailStyles.spacing.xl};
      max-width: 560px;
      margin: 0 auto;
      background: ${realestEmailStyles.colors.cardBackground};
    ">

      <div style="text-align: center; margin-bottom: ${realestEmailStyles.spacing.xxl};">
        <h2 style="
          font-family: ${realestEmailStyles.fonts.heading};
          font-size: 24px;
          font-weight: 600;
          color: ${realestEmailStyles.colors.brandDark};
          margin: 0 0 ${realestEmailStyles.spacing.lg};
          line-height: 1.3;
        ">Welcome, ${context.user.firstName}!</h2>

        <p style="
          color: ${realestEmailStyles.colors.textMuted};
          line-height: 1.6;
          margin: 0;
          font-size: 15px;
          font-weight: 400;
        ">
          You're now part of Nigeria's most trusted property marketplace
        </p>
      </div>

      ${positionContent}

      ${metricsSection}

      ${featuresSection}

      ${nigerianBadge}

      <div style="
        text-align: center;
        margin-top: ${realestEmailStyles.spacing.xxl};
        padding-top: ${realestEmailStyles.spacing.xxl};
        border-top: 1px solid ${realestEmailStyles.colors.border};
      ">
        <p style="
          color: ${realestEmailStyles.colors.text};
          line-height: 1.6;
          margin: 0;
          font-size: 15px;
          font-weight: 400;
        ">
          We'll notify you when we launch. Get ready for a better way to find property in Nigeria.
        </p>
      </div>
    </div>
  `;

  const html = createBaseEmailHTML(
    emailContent + createEmailFooter(context.company),
    subject,
    realestEmailStyles
  );

  // Plain text version
  const textContent = `
Welcome to RealEST, ${context.user.firstName}!

You're now part of Nigeria's most trusted property marketplace.

${context.waitlist.positionText}

WHAT MAKES US DIFFERENT
========================

Geo-Verified Properties
Every property verified with precise GPS coordinates

Zero Duplicates Guarantee
Each listing is unique and authenticated

Live Market Insights
Real-time market data and pricing trends

OUR COMMITMENT
===============
• 10K+ Properties ready to verify
• 99.9% Location accuracy goal
• 0 Fake listings tolerance

Built for Nigeria - From Lagos to Abuja, Port Harcourt to Kano

We'll notify you when we launch. Get ready for a better way to find property.

Questions? Reply to this email anytime.

Best regards,
The RealEST Team
  `;

  const text = createPlainTextTemplate(textContent, context.company);

  return { subject, html, text };
};

export default createWaitlistConfirmationTemplate;
