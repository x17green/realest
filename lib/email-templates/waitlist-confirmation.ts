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
 * Email-compatible icon data URLs - SVG converted to base64 data URLs
 * Using consistent #07402F color for better email client compatibility
 */
const ICONS: Record<string, string> = {
  'map-pin': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEwQzIxIDE3IDEyIDIzIDEyIDIzUzMgMTcgMyAxMEEzIDkgMCAwIDEgMjEgMTBaIiBzdHJva2U9IiMwNzQwMkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+',
  'check-circle': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyIDExLjA4VjEyQTEwIDEwIDAgMSAxIDE2LjA3IDIuODYiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBvbHlsaW5lIHBvaW50cz0iMjIsNCA12CwxNC4wMSA5LDExLjAxIiBzdHJva2U9IiMwNzQwMkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
  'trending-up': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBvbHlsaW5lIHBvaW50cz0iMjMsNiAxMy41LDE1LjUgOC41LDEwLjUgMSwxOCIgc3Ryb2tlPSIjMDc0MDJGIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjxwb2x5bGluZSBwb2ludHM9IjE3LDYgMjMsNiAyMywxMiIgc3Ryb2tlPSIjMDc0MDJGIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
  'home': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgOUwxMiAyTDIxIDlWMjBBMiAyIDAgMCAxIDE5IDIySDVBMiAyIDAgMCAxIDMgMjBWOVoiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBvbHlsaW5lIHBvaW50cz0iOSwyMiA5LDEyIDE1LDEyIDE1LDIyIiBzdHJva2U9IiMwNzQwMkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
  'target': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgc3Ryb2tlPSIjMDc0MDJGIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+',
  'shield': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDIyUzIwIDE4IDIwIDEyVjVMMTIgMkw0IDVWMTJDNCA4IDEyIDIyIDEyIDIyWiIgc3Ryb2tlPSIjMDc0MDJGIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
  'flag': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTVTNSAxNCA4IDE0UzEzIDE2IDE2IDE2UzIwIDE1IDIwIDE1VjNTMTkgNCA2IDRTOSAyIDYgMlM0IDMgNCAzWiIgc3Ryb2tlPSIjMDc0MDJGIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxsaW5lIHgxPSI0IiB5MT0iMjIiIHgyPSI0IiB5Mj0iMTUiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'
};

/**
 * Create email-compatible icon element using data URL
 */
function createIconElement(iconKey: string, size: number = 20): string {
  const iconUrl = ICONS[iconKey];
  if (!iconUrl) {
    // Fallback to unicode symbol if icon not found
    const fallbacks: Record<string, string> = {
      'map-pin': '📍',
      'check-circle': '✓',
      'trending-up': '📈',
      'home': '🏠',
      'target': '🎯',
      'shield': '🛡️',
      'flag': '🇳🇬'
    };
    return fallbacks[iconKey] || '•';
  }

  return `<img src="${iconUrl}" alt="" width="${size}" height="${size}" style="display: block; width: ${size}px; height: ${size}px; margin: 0;" />`;
}

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
        <table style="margin: 0 auto; border-collapse: collapse;">
          <tr>
            <td style="
              background: ${realestEmailStyles.colors.cardBackground};
              border: 1px solid ${realestEmailStyles.colors.brandAccent};
              padding: ${realestEmailStyles.spacing.md} ${realestEmailStyles.spacing.lg};
              border-radius: 8px;
            ">
              <table style="border-collapse: collapse;">
                <tr>
                  <td style="vertical-align: middle; padding-right: ${realestEmailStyles.spacing.md};">
                    ${createIconElement('check-circle', 20)}
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="
                      font-family: ${realestEmailStyles.fonts.body};
                      font-weight: 600;
                      font-size: 16px;
                      color: ${realestEmailStyles.colors.brandDark};
                    ">You're In!</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
          ${KEY_METRICS.map((metric, index) => `
            <td style="
              text-align: center;
              padding: ${realestEmailStyles.spacing.lg} ${realestEmailStyles.spacing.md};
              ${index < KEY_METRICS.length - 1 ? `border-right: 1px solid ${realestEmailStyles.colors.border};` : ''}
            ">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding-bottom: ${realestEmailStyles.spacing.md};">
                    <table style="width: 40px; height: 40px; margin: 0 auto; background: ${realestEmailStyles.colors.brandLight}; border-radius: 8px; border-collapse: collapse;">
                      <tr>
                        <td style="text-align: center; vertical-align: middle;">
                          ${createIconElement(metric.icon, 20)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
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
                </tr>
              </table>
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
                    <table style="width: 44px; height: 44px; background: ${realestEmailStyles.colors.brandLight}; border: 1px solid ${realestEmailStyles.colors.brandAccent}; border-radius: 8px; border-collapse: collapse;">
                      <tr>
                        <td style="text-align: center; vertical-align: middle;">
                          ${createIconElement(feature.icon, 20)}
                        </td>
                      </tr>
                    </table>
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
      <table style="margin: 0 auto ${realestEmailStyles.spacing.lg}; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle; padding-right: ${realestEmailStyles.spacing.sm};">
            ${createIconElement('flag', 20)}
          </td>
          <td style="vertical-align: middle;">
            <span style="
              font-family: ${realestEmailStyles.fonts.heading};
              font-weight: 600;
              color: ${realestEmailStyles.colors.brandDark};
              font-size: 16px;
            ">Built for Nigeria</span>
          </td>
        </tr>
      </table>

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
