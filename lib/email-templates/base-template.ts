import { EmailStyles, realestEmailStyles, EmailConfig, TemplateContext } from './types';

/**
 * Modern, minimal base HTML structure with enhanced responsive design
 */
export function createBaseEmailHTML(
  content: string,
  title: string,
  styles: EmailStyles = realestEmailStyles
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset & Base Styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: ${styles.fonts.body};
            line-height: 1.6;
            color: ${styles.colors.text};
            background-color: ${styles.colors.background};
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        /* Main Container */
        .email-wrapper {
            width: 100%;
            background-color: ${styles.colors.background};
            padding: ${styles.spacing.lg} 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${styles.colors.cardBackground};
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Header Styles */
        .email-header {
            background: linear-gradient(135deg, ${styles.colors.brandDark} 0%, ${styles.colors.brandNeutral} 100%);
            color: white;
            padding: ${styles.spacing.xl} ${styles.spacing.lg};
            text-align: center;
            position: relative;
        }

        .brand-logo {
            display: inline-block;
            margin-bottom: ${styles.spacing.md};
            width: 56px;
            height: 56px;
            border-radius: 12px;
        }

        .email-header h1 {
            font-family: ${styles.fonts.heading};
            font-size: 26px;
            font-weight: 700;
            margin: 0 0 ${styles.spacing.xs} 0;
            letter-spacing: -0.5px;
        }

        .email-header h2 {
            font-family: ${styles.fonts.body};
            font-size: 14px;
            font-weight: 400;
            margin: 0;
            opacity: 0.85;
            letter-spacing: 0.3px;
        }

        /* Content Styles */
        .email-content {
            padding: ${styles.spacing.xl} ${styles.spacing.lg};
            background-color: ${styles.colors.cardBackground};
        }

        /* Footer Styles */
        .email-footer {
            text-align: center;
            padding: ${styles.spacing.xl} ${styles.spacing.lg};
            background: ${styles.colors.brandLight};
            border-top: 1px solid ${styles.colors.border};
            color: ${styles.colors.textMuted};
            font-size: 13px;
        }

        .email-footer p {
            margin: 0 0 ${styles.spacing.md} 0;
        }

        /* Position Badge */
        .position-badge {
            display: inline-flex;
            align-items: center;
            gap: ${styles.spacing.sm};
            background: linear-gradient(135deg, ${styles.colors.brandAccent} 0%, #9FE02A 100%);
            color: ${styles.colors.brandDark};
            padding: ${styles.spacing.md} ${styles.spacing.xl};
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px ${styles.colors.brandAccent}40;
        }

        .verification-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            background: ${styles.colors.brandDark};
            border-radius: 50%;
            color: ${styles.colors.brandAccent};
        }

        /* Social Links */
        .social-links {
            margin: ${styles.spacing.lg} 0 0;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: ${styles.spacing.md};
            flex-wrap: wrap;
        }

        .social-links a {
            color: ${styles.colors.textMuted};
            text-decoration: none;
            font-size: 13px;
            padding: ${styles.spacing.xs} ${styles.spacing.sm};
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .social-links a:hover {
            color: ${styles.colors.brandDark};
            background: ${styles.colors.brandAccent}20;
        }

        .divider {
            color: ${styles.colors.border};
            user-select: none;
        }

        /* Responsive Design */
        @media only screen and (max-width: 640px) {
            .email-wrapper {
                padding: ${styles.spacing.sm} 0;
            }

            .email-container {
                border-radius: 0;
                margin: 0;
            }

            .email-header,
            .email-content,
            .email-footer {
                padding-left: ${styles.spacing.md};
                padding-right: ${styles.spacing.md};
            }

            .email-header h1 {
                font-size: 22px;
            }

            .email-header h2 {
                font-size: 13px;
            }

            .brand-logo {
                width: 48px;
                height: 48px;
            }

            .position-badge {
                font-size: 15px;
                padding: ${styles.spacing.sm} ${styles.spacing.lg};
            }

            /* Stack grid layouts on mobile */
            [style*="display: grid"] {
                display: block !important;
            }

            [style*="display: grid"] > div {
                margin-bottom: ${styles.spacing.md};
            }

            [style*="display: grid"] > div:last-child {
                margin-bottom: 0;
            }
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            .email-container {
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
            .email-container {
                border: 2px solid ${styles.colors.brandDark};
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            ${content}
        </div>
    </div>
</body>
</html>
  `.trim();
}

/**
 * Minimal email header component
 */
export function createEmailHeader(
  companyName: string,
  tagline: string,
  logoUrl?: string
): string {
  const logoElement = logoUrl
    ? `<img src="${logoUrl}" alt="${companyName}" class="brand-logo" style="display: block;" />`
    : `<div class="brand-logo" style="
        background: linear-gradient(135deg, ${realestEmailStyles.colors.brandAccent}, #9FE02A);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 700;
        color: ${realestEmailStyles.colors.brandDark};
        font-family: ${realestEmailStyles.fonts.heading};
      ">RE</div>`;

  return `
    <div class="email-header">
        ${logoElement}
        <h1>${companyName}</h1>
        <h2>${tagline}</h2>
    </div>
  `;
}

/**
 * Clean email footer component
 */
export function createEmailFooter(
  config: EmailConfig,
  year: number = new Date().getFullYear()
): string {
  return `
    <div class="email-footer">
        <p style="
          font-weight: 600;
          color: ${realestEmailStyles.colors.text};
          margin-bottom: ${realestEmailStyles.spacing.md};
        ">
            © ${year} ${config.companyName}
        </p>
        <p style="
          font-size: 12px;
          color: ${realestEmailStyles.colors.textMuted};
          margin-bottom: ${realestEmailStyles.spacing.lg};
        ">
            ${config.tagline} • ${config.domain}
        </p>
        <p style="
          font-size: 12px;
          color: ${realestEmailStyles.colors.textMuted};
          margin-bottom: ${realestEmailStyles.spacing.md};
        ">
            You're receiving this because you joined our waitlist
        </p>
        <div class="social-links">
            <a href="${config.unsubscribeUrl}">Unsubscribe</a>
            <span class="divider">•</span>
            <a href="mailto:${config.supportEmail}">Support</a>
            <span class="divider">•</span>
            <a href="${config.websiteUrl}">Visit Site</a>
        </div>
    </div>
  `;
}

/**
 * Position badge with clean icon
 */
export function createPositionBadge(position: number): string {
  const checkIconDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBvbHlsaW5lIHBvaW50cz0iMjAsNiA5LDE3IDQsMTIiIHN0cm9rZT0iIzA3NDAyRiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';

  return `
    <div style="text-align: center; margin: ${realestEmailStyles.spacing.xl} 0;">
      <table style="margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td style="
            background: linear-gradient(135deg, ${realestEmailStyles.colors.brandAccent} 0%, #9FE02A 100%);
            color: ${realestEmailStyles.colors.brandDark};
            padding: ${realestEmailStyles.spacing.md} ${realestEmailStyles.spacing.xl};
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
          ">
            <table style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: ${realestEmailStyles.spacing.sm};">
                  <table style="width: 20px; height: 20px; background: ${realestEmailStyles.colors.brandDark}; border-radius: 50%; border-collapse: collapse;">
                    <tr>
                      <td style="text-align: center; vertical-align: middle;">
                        <img src="${checkIconDataUrl}" alt="✓" width="16" height="16" style="display: block; width: 16px; height: 16px; margin: 0;" />
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="vertical-align: middle;">
                  <span>You're #${position} on the waitlist</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="
        color: ${realestEmailStyles.colors.textMuted};
        margin-top: ${realestEmailStyles.spacing.md};
        font-size: 14px;
      ">
        ${getPositionMessage(position)}
      </p>
    </div>
  `;
}

/**
 * Get contextual message based on position
 */
function getPositionMessage(position: number): string {
  if (position <= 10) return "You're among the first! Priority access guaranteed";
  if (position <= 50) return "Early supporter - exclusive founding member benefits";
  if (position <= 100) return "Part of our founding community";
  if (position <= 500) return "You'll be notified when we launch";
  return "Welcome to the community";
}

/**
 * Create template context with enhanced defaults
 */
export function createTemplateContext(
  data: any,
  config: EmailConfig,
  overrides: Partial<TemplateContext> = {}
): TemplateContext {
  const now = new Date();
  const fullName = data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName;

  let positionText = "You're now on our waitlist";

  if (data.position && data.position > 0) {
    if (data.position <= 10) {
      positionText = `You're #${data.position} - among the very first!`;
    } else if (data.position <= 50) {
      positionText = `You're #${data.position} - early supporter status`;
    } else if (data.position <= 100) {
      positionText = `You're #${data.position} - founding member`;
    } else {
      positionText = `You're #${data.position} on the waitlist`;
    }
  }

  return {
    user: {
      firstName: data.firstName,
      fullName,
      email: data.email,
      ...overrides.user
    },
    waitlist: {
      position: data.position,
      positionText,
      totalCount: data.totalCount,
      ...overrides.waitlist
    },
    company: {
      ...config,
      ...overrides.company
    },
    metadata: {
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleString('en-NG', {
        dateStyle: 'long',
        timeStyle: 'short'
      }),
      ...overrides.metadata
    }
  };
}

/**
 * Plain text template with clean formatting
 */
export function createPlainTextTemplate(content: string, config: EmailConfig): string {
  const year = new Date().getFullYear();
  return `
${content}

────────────────────────────────────────

© ${year} ${config.companyName}
${config.tagline} • ${config.domain}

You're receiving this because you joined our waitlist.

Unsubscribe: ${config.unsubscribeUrl}
Support: ${config.supportEmail}
Website: ${config.websiteUrl}
  `.trim();
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Create responsive image element
 */
export function createResponsiveImage(
  src: string,
  alt: string,
  width: number = 600
): string {
  return `
    <img
      src="${src}"
      alt="${sanitizeHtml(alt)}"
      style="
        max-width: 100%;
        width: ${width}px;
        height: auto;
        display: block;
        margin: 0 auto;
        border-radius: 12px;
      "
      width="${width}"
    />
  `;
}
