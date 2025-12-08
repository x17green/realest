import { EmailStyles, defaultEmailStyles, EmailConfig, TemplateContext } from './types';

// Base HTML structure for all email templates
export function createBaseEmailHTML(
  content: string,
  title: string,
  styles: EmailStyles = defaultEmailStyles
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: ${styles.fonts.primary};
                line-height: 1.6;
                color: ${styles.colors.text};
                background-color: ${styles.colors.background};
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: ${styles.colors.cardBackground};
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .email-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: ${styles.spacing.large};
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .email-header h1 {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: ${styles.spacing.small};
            }
            .email-header h2 {
                font-size: 18px;
                font-weight: normal;
                opacity: 0.9;
            }
            .email-content {
                padding: ${styles.spacing.large};
                background-color: ${styles.colors.cardBackground};
            }
            .email-footer {
                text-align: center;
                padding: ${styles.spacing.medium};
                border-top: 1px solid ${styles.colors.border};
                color: ${styles.colors.secondary};
                font-size: 14px;
                background-color: ${styles.colors.background};
                border-radius: 0 0 10px 10px;
            }
            .highlight-box {
                background: linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%);
                padding: ${styles.spacing.medium};
                border-radius: 8px;
                margin: ${styles.spacing.medium} 0;
                border-left: 4px solid ${styles.colors.primary};
            }
            .success-box {
                background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
                border-left-color: ${styles.colors.success};
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background: ${styles.colors.primary};
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: ${styles.spacing.medium} 0;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background: #0056b3;
            }
            .stats-container {
                display: flex;
                justify-content: space-around;
                margin: ${styles.spacing.medium} 0;
                flex-wrap: wrap;
            }
            .stat-item {
                text-align: center;
                padding: ${styles.spacing.small};
                min-width: 100px;
            }
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: ${styles.colors.primary};
                display: block;
            }
            .stat-label {
                font-size: 12px;
                color: ${styles.colors.secondary};
                margin-top: 5px;
            }
            .feature-list {
                list-style: none;
                padding: 0;
            }
            .feature-list li {
                padding: 8px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            .feature-list li:last-child {
                border-bottom: none;
            }
            .feature-list strong {
                color: ${styles.colors.primary};
            }
            .social-links {
                margin: ${styles.spacing.medium} 0;
            }
            .social-links a {
                display: inline-block;
                margin: 0 ${styles.spacing.small};
                color: ${styles.colors.secondary};
                text-decoration: none;
            }
            @media only screen and (max-width: 600px) {
                .email-container { width: 100% !important; }
                .email-header, .email-content, .email-footer { padding: ${styles.spacing.medium} !important; }
                .stats-container { flex-direction: column; }
                .stat-item { margin-bottom: ${styles.spacing.small}; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            ${content}
        </div>
    </body>
    </html>
  `;
}

// Header component
export function createEmailHeader(
  companyName: string,
  title: string,
  emoji: string = '🏠'
): string {
  return `
    <div class="email-header">
        <h1>${emoji} ${companyName}</h1>
        <h2>${title}</h2>
    </div>
  `;
}

// Footer component
export function createEmailFooter(config: EmailConfig, year: number = new Date().getFullYear()): string {
  return `
    <div class="email-footer">
        <p>© ${year} ${config.companyName}. All rights reserved.</p>
        <p>You received this email because you signed up for our waitlist.</p>
        <div class="social-links">
            <a href="${config.unsubscribeUrl}" style="color: #666;">Unsubscribe</a>
            <span style="color: #ccc;">|</span>
            <a href="mailto:${config.supportEmail}" style="color: #666;">Contact Us</a>
            <span style="color: #ccc;">|</span>
            <a href="${config.websiteUrl}" style="color: #666;">Visit Website</a>
        </div>
    </div>
  `;
}

// Highlight box component
export function createHighlightBox(
  title: string,
  content: string,
  type: 'default' | 'success' = 'default'
): string {
  const className = type === 'success' ? 'highlight-box success-box' : 'highlight-box';
  return `
    <div class="${className}">
        <h3>${title}</h3>
        ${content}
    </div>
  `;
}

// Stats component
export function createStatsSection(stats: Array<{number: string; label: string}>): string {
  const statsItems = stats.map(stat => `
    <div class="stat-item">
        <span class="stat-number">${stat.number}</span>
        <div class="stat-label">${stat.label}</div>
    </div>
  `).join('');

  return `
    <div class="stats-container">
        ${statsItems}
    </div>
  `;
}

// Feature list component
export function createFeatureList(features: Array<{title: string; description: string}>): string {
  const featureItems = features.map(feature => `
    <li><strong>${feature.title}:</strong> ${feature.description}</li>
  `).join('');

  return `
    <ul class="feature-list">
        ${featureItems}
    </ul>
  `;
}

// Button component
export function createButton(text: string, url: string, style: 'primary' | 'secondary' = 'primary'): string {
  return `<a href="${url}" class="button button-${style}">${text}</a>`;
}

// Context creator utility
export function createTemplateContext(
  data: any,
  config: EmailConfig,
  overrides: Partial<TemplateContext> = {}
): TemplateContext {
  const now = new Date();
  const fullName = data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName;
  const positionText = data.position && data.position > 0
    ? `You're #${data.position} on our waitlist!`
    : 'You\'re now on our exclusive waitlist!';

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
      formattedDate: now.toLocaleString(),
      ...overrides.metadata
    }
  };
}

// Text template utilities
export function createPlainTextTemplate(content: string, config: EmailConfig): string {
  return `
${content}

--
© ${new Date().getFullYear()} ${config.companyName}. All rights reserved.
You received this email because you signed up for our waitlist.

Unsubscribe: ${config.unsubscribeUrl}
Contact: ${config.supportEmail}
Website: ${config.websiteUrl}
  `.trim();
}

// Utility to sanitize HTML content
export function sanitizeHtml(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Utility to create responsive images
export function createResponsiveImage(
  src: string,
  alt: string,
  width: number = 600
): string {
  return `
    <img src="${src}"
         alt="${sanitizeHtml(alt)}"
         style="max-width: 100%; width: ${width}px; height: auto; display: block; margin: 0 auto;"
         width="${width}">
  `;
}
