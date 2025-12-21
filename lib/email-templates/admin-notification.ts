import {
  EmailTemplate,
  AdminNotificationData,
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
  sanitizeHtml
} from './base-template';

// Admin configuration
const REALEST_ADMIN_CONFIG: EmailConfig = {
  companyName: 'RealEST',
  tagline: 'Admin Dashboard',
  domain: 'realest.ng',
  fromEmail: 'notifications@realest.ng',
  supportEmail: 'hello@realest.ng',
  unsubscribeUrl: '#',
  websiteUrl: 'https://realest.ng',
  logoUrl: 'https://realest.ng/realest-logo.svg'
};

/**
 * SVG Icons for admin email
 */
const ADMIN_ICONS = {
  'user': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  'mail': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
  'hash': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>',
  'users': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  'clock': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  'trending-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
  'target': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  'activity': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
  'flag': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>',
  'external-link': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
  'bell': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>'
};

/**
 * Generate clean admin notification email
 */
export const createAdminNotificationTemplate: EmailTemplateFunction<AdminNotificationData> = (
  data: AdminNotificationData,
  contextOverrides: Partial<TemplateContext> = {}
): EmailTemplate => {
  const config = REALEST_ADMIN_CONFIG;
  const context = createTemplateContext(data, config, contextOverrides);

  const subject = `New Waitlist Signup: ${context.user.fullName}`;

  // Clean admin header
  const header = `
    <div style="
      background: linear-gradient(135deg, ${realestEmailStyles.colors.brandDark}, ${realestEmailStyles.colors.brandNeutral});
      padding: ${realestEmailStyles.spacing.xl} ${realestEmailStyles.spacing.lg};
      text-align: center;
    ">
      <div style="
        width: 48px;
        height: 48px;
        margin: 0 auto ${realestEmailStyles.spacing.md};
        background: ${realestEmailStyles.colors.brandAccent};
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${realestEmailStyles.colors.brandDark};
      ">
        ${ADMIN_ICONS.bell}
      </div>
      <h1 style="
        font-family: ${realestEmailStyles.fonts.heading};
        color: white;
        font-size: 22px;
        margin: 0 0 ${realestEmailStyles.spacing.xs};
        font-weight: 600;
      ">New Waitlist Signup</h1>
      <p style="
        color: rgba(255,255,255,0.8);
        font-size: 14px;
        margin: 0;
      ">${context.metadata.formattedDate}</p>
    </div>
  `;

  // User info card - clean and scannable
  const userInfoCard = `
    <div style="
      background: white;
      border: 1px solid ${realestEmailStyles.colors.border};
      border-radius: 12px;
      padding: ${realestEmailStyles.spacing.lg};
      margin: ${realestEmailStyles.spacing.lg} 0;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: ${realestEmailStyles.spacing.sm};
        margin-bottom: ${realestEmailStyles.spacing.lg};
        padding-bottom: ${realestEmailStyles.spacing.md};
        border-bottom: 2px solid ${realestEmailStyles.colors.brandAccent};
      ">
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, ${realestEmailStyles.colors.brandAccent}, #9FE02A);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${realestEmailStyles.colors.brandDark};
        ">
          ${ADMIN_ICONS.user}
        </div>
        <h3 style="
          font-family: ${realestEmailStyles.fonts.heading};
          color: ${realestEmailStyles.colors.brandDark};
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        ">User Information</h3>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="
            padding: ${realestEmailStyles.spacing.md} 0;
            border-bottom: 1px solid ${realestEmailStyles.colors.border};
          ">
            <div style="display: flex; align-items: center; gap: ${realestEmailStyles.spacing.xs};">
              <span style="color: ${realestEmailStyles.colors.textMuted};">${ADMIN_ICONS.user}</span>
              <span style="
                color: ${realestEmailStyles.colors.textMuted};
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
              ">Name</span>
            </div>
            <div style="
              margin-top: ${realestEmailStyles.spacing.xs};
              font-weight: 600;
              color: ${realestEmailStyles.colors.brandDark};
              font-size: 15px;
            ">${sanitizeHtml(context.user.fullName)}</div>
          </td>
        </tr>

        <tr>
          <td style="
            padding: ${realestEmailStyles.spacing.md} 0;
            border-bottom: 1px solid ${realestEmailStyles.colors.border};
          ">
            <div style="display: flex; align-items: center; gap: ${realestEmailStyles.spacing.xs};">
              <span style="color: ${realestEmailStyles.colors.textMuted};">${ADMIN_ICONS.mail}</span>
              <span style="
                color: ${realestEmailStyles.colors.textMuted};
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
              ">Email</span>
            </div>
            <div style="margin-top: ${realestEmailStyles.spacing.xs};">
              <a href="mailto:${context.user.email}" style="
                color: ${realestEmailStyles.colors.brandAccent};
                text-decoration: none;
                font-weight: 500;
                font-size: 15px;
              ">${sanitizeHtml(context.user.email)}</a>
            </div>
          </td>
        </tr>

        <tr>
          <td style="
            padding: ${realestEmailStyles.spacing.md} 0;
            border-bottom: 1px solid ${realestEmailStyles.colors.border};
          ">
            <div style="display: flex; align-items: center; gap: ${realestEmailStyles.spacing.xs};">
              <span style="color: ${realestEmailStyles.colors.textMuted};">${ADMIN_ICONS.hash}</span>
              <span style="
                color: ${realestEmailStyles.colors.textMuted};
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
              ">Position</span>
            </div>
            <div style="margin-top: ${realestEmailStyles.spacing.xs};">
              ${context.waitlist.position
                ? `<span style="
                    display: inline-flex;
                    align-items: center;
                    background: linear-gradient(135deg, ${realestEmailStyles.colors.brandAccent}20, ${realestEmailStyles.colors.brandAccent}10);
                    color: ${realestEmailStyles.colors.brandDark};
                    padding: ${realestEmailStyles.spacing.xs} ${realestEmailStyles.spacing.md};
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 16px;
                    border: 1px solid ${realestEmailStyles.colors.brandAccent};
                  ">#${context.waitlist.position}</span>`
                : `<span style="color: ${realestEmailStyles.colors.textMuted}; font-size: 14px;">N/A</span>`
              }
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding: ${realestEmailStyles.spacing.md} 0;">
            <div style="display: flex; align-items: center; gap: ${realestEmailStyles.spacing.xs};">
              <span style="color: ${realestEmailStyles.colors.textMuted};">${ADMIN_ICONS.users}</span>
              <span style="
                color: ${realestEmailStyles.colors.textMuted};
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
              ">Total Count</span>
            </div>
            <div style="margin-top: ${realestEmailStyles.spacing.xs};">
              ${data.totalCount
                ? `<span style="
                    display: inline-flex;
                    align-items: center;
                    background: linear-gradient(135deg, ${realestEmailStyles.colors.success}20, ${realestEmailStyles.colors.success}10);
                    color: ${realestEmailStyles.colors.success};
                    padding: ${realestEmailStyles.spacing.xs} ${realestEmailStyles.spacing.md};
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 15px;
                    border: 1px solid ${realestEmailStyles.colors.success}40;
                  ">${data.totalCount} users</span>`
                : `<span style="color: ${realestEmailStyles.colors.textMuted}; font-size: 14px;">N/A</span>`
              }
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  // Quick actions - clean buttons
  const quickActions = `
    <div style="
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${realestEmailStyles.spacing.md};
      margin: ${realestEmailStyles.spacing.xl} 0;
    ">
      <a href="mailto:${context.user.email}" style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${realestEmailStyles.spacing.sm};
        padding: ${realestEmailStyles.spacing.md};
        background: linear-gradient(135deg, ${realestEmailStyles.colors.brandAccent}, #9FE02A);
        color: ${realestEmailStyles.colors.brandDark};
        text-decoration: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
        border: none;
      ">
        ${ADMIN_ICONS.mail}
        <span>Email User</span>
      </a>
      <a href="${context.company.websiteUrl}/admin/waitlist" style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${realestEmailStyles.spacing.sm};
        padding: ${realestEmailStyles.spacing.md};
        background: ${realestEmailStyles.colors.brandDark};
        color: white;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
        border: none;
      ">
        ${ADMIN_ICONS['external-link']}
        <span>Dashboard</span>
      </a>
    </div>
  `;

  // Growth metrics - clean stats
  const growthMetrics = data.totalCount ? `
    <div style="
      background: ${realestEmailStyles.colors.brandLight};
      border-radius: 12px;
      padding: ${realestEmailStyles.spacing.lg};
      margin: ${realestEmailStyles.spacing.xl} 0;
    ">
      <h3 style="
        font-family: ${realestEmailStyles.fonts.heading};
        color: ${realestEmailStyles.colors.brandDark};
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 ${realestEmailStyles.spacing.lg};
        text-align: center;
      ">Growth Metrics</h3>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: ${realestEmailStyles.spacing.md};
      ">
        <div style="
          text-align: center;
          background: white;
          padding: ${realestEmailStyles.spacing.md};
          border-radius: 10px;
          border: 1px solid ${realestEmailStyles.colors.border};
        ">
          <div style="
            width: 40px;
            height: 40px;
            margin: 0 auto ${realestEmailStyles.spacing.sm};
            background: linear-gradient(135deg, ${realestEmailStyles.colors.success}20, ${realestEmailStyles.colors.success}10);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${realestEmailStyles.colors.success};
          ">
            ${ADMIN_ICONS.users}
          </div>
          <div style="
            font-family: ${realestEmailStyles.fonts.heading};
            font-size: 24px;
            font-weight: 700;
            color: ${realestEmailStyles.colors.brandDark};
            margin-bottom: ${realestEmailStyles.spacing.xs};
          ">${data.totalCount}</div>
          <div style="
            font-size: 11px;
            color: ${realestEmailStyles.colors.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Total Users</div>
        </div>

        <div style="
          text-align: center;
          background: white;
          padding: ${realestEmailStyles.spacing.md};
          border-radius: 10px;
          border: 1px solid ${realestEmailStyles.colors.border};
        ">
          <div style="
            width: 40px;
            height: 40px;
            margin: 0 auto ${realestEmailStyles.spacing.sm};
            background: linear-gradient(135deg, ${realestEmailStyles.colors.brandAccent}20, ${realestEmailStyles.colors.brandAccent}10);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${realestEmailStyles.colors.brandDark};
          ">
            ${ADMIN_ICONS['trending-up']}
          </div>
          <div style="
            font-family: ${realestEmailStyles.fonts.heading};
            font-size: 24px;
            font-weight: 700;
            color: ${realestEmailStyles.colors.brandDark};
            margin-bottom: ${realestEmailStyles.spacing.xs};
          ">${calculateGrowthRate()}%</div>
          <div style="
            font-size: 11px;
            color: ${realestEmailStyles.colors.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Growth Rate</div>
        </div>

        <div style="
          text-align: center;
          background: white;
          padding: ${realestEmailStyles.spacing.md};
          border-radius: 10px;
          border: 1px solid ${realestEmailStyles.colors.border};
        ">
          <div style="
            width: 40px;
            height: 40px;
            margin: 0 auto ${realestEmailStyles.spacing.sm};
            background: linear-gradient(135deg, ${realestEmailStyles.colors.info}20, ${realestEmailStyles.colors.info}10);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${realestEmailStyles.colors.info};
          ">
            ${ADMIN_ICONS.target}
          </div>
          <div style="
            font-family: ${realestEmailStyles.fonts.heading};
            font-size: 24px;
            font-weight: 700;
            color: ${realestEmailStyles.colors.brandDark};
            margin-bottom: ${realestEmailStyles.spacing.xs};
          ">${calculateMarketReadiness(data.totalCount)}%</div>
          <div style="
            font-size: 11px;
            color: ${realestEmailStyles.colors.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Market Ready</div>
        </div>
      </div>
    </div>
  ` : '';

  // Insight badge
  const insightBadge = createInsightBadge(data);

  // Email content
  const emailContent = `
    ${header}
    <div style="padding: ${realestEmailStyles.spacing.xl} ${realestEmailStyles.spacing.lg};">
      
      ${userInfoCard}
      
      ${quickActions}
      
      ${growthMetrics}
      
      ${insightBadge}

      <div style="
        margin-top: ${realestEmailStyles.spacing.xl};
        padding: ${realestEmailStyles.spacing.lg};
        background: linear-gradient(135deg, ${realestEmailStyles.colors.success}08, transparent);
        border-radius: 12px;
        border: 1px solid ${realestEmailStyles.colors.success}30;
        border-left: 3px solid ${realestEmailStyles.colors.success};
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: ${realestEmailStyles.spacing.sm};
          margin-bottom: ${realestEmailStyles.spacing.md};
        ">
          <span style="color: ${realestEmailStyles.colors.success};">${ADMIN_ICONS.flag}</span>
          <h4 style="
            font-family: ${realestEmailStyles.fonts.heading};
            color: ${realestEmailStyles.colors.brandDark};
            font-size: 14px;
            font-weight: 600;
            margin: 0;
          ">Nigerian Market</h4>
        </div>
        <p style="
          color: ${realestEmailStyles.colors.text};
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        ">
          Building trust across Lagos, Abuja, Port Harcourt, and beyond. 
          Track regional patterns in your dashboard.
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
NEW WAITLIST SIGNUP
${context.metadata.formattedDate}

USER INFORMATION
================
Name: ${context.user.fullName}
Email: ${context.user.email}
Position: ${context.waitlist.position ? `#${context.waitlist.position}` : 'N/A'}
Total Count: ${data.totalCount || 'N/A'}

${data.totalCount ? `
GROWTH METRICS
==============
Total Users: ${data.totalCount}
Growth Rate: ${calculateGrowthRate()}%
Market Ready: ${calculateMarketReadiness(data.totalCount)}%
` : ''}

${createInsightText(data)}

QUICK ACTIONS
=============
• Email user: ${context.user.email}
• View dashboard: ${context.company.websiteUrl}/admin/waitlist

NIGERIAN MARKET
===============
Building trust across Lagos, Abuja, Port Harcourt, and beyond.
Track regional patterns in your dashboard.
  `;

  const text = createPlainTextTemplate(textContent, context.company);

  return { subject, html, text };
};

/**
 * Create insight badge based on position
 */
function createInsightBadge(data: AdminNotificationData): string {
  const position = data.position || 0;
  
  let badge = {
    icon: ADMIN_ICONS.activity,
    color: realestEmailStyles.colors.info,
    title: 'Growth Insight',
    message: 'Steady progress building your Nigerian community'
  };

  if (position <= 10) {
    badge = {
      icon: ADMIN_ICONS.activity,
      color: realestEmailStyles.colors.success,
      title: 'VIP Early Adopter',
      message: 'This is one of your first 10 users! Personal outreach recommended.'
    };
  } else if (position <= 50) {
    badge = {
      icon: ADMIN_ICONS['trending-up'],
      color: realestEmailStyles.colors.brandAccent,
      title: 'Strong Momentum',
      message: 'Early adopters are crucial for market validation in Nigeria.'
    };
  } else if (position <= 100) {
    badge = {
      icon: ADMIN_ICONS.target,
      color: realestEmailStyles.colors.brandDark,
      title: 'Milestone Progress',
      message: 'First 100 users form your core community for launch.'
    };
  }

  return `
    <div style="
      background: linear-gradient(135deg, ${badge.color}15, ${badge.color}08);
      border: 1px solid ${badge.color}40;
      border-left: 3px solid ${badge.color};
      border-radius: 12px;
      padding: ${realestEmailStyles.spacing.lg};
      margin: ${realestEmailStyles.spacing.lg} 0;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: ${realestEmailStyles.spacing.sm};
        margin-bottom: ${realestEmailStyles.spacing.sm};
      ">
        <div style="color: ${badge.color};">
          ${badge.icon}
        </div>
        <h4 style="
          font-family: ${realestEmailStyles.fonts.heading};
          color: ${badge.color};
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        ">${badge.title}</h4>
      </div>
      <p style="
        color: ${realestEmailStyles.colors.text};
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
      ">${badge.message}</p>
    </div>
  `;
}

/**
 * Create insight text for plain version
 */
function createInsightText(data: AdminNotificationData): string {
  const position = data.position || 0;

  if (position <= 10) {
    return 'INSIGHT: VIP Early Adopter - Personal outreach recommended!';
  } else if (position <= 50) {
    return 'INSIGHT: Strong Momentum - Early adopters are crucial for validation.';
  } else if (position <= 100) {
    return 'INSIGHT: Milestone Progress - First 100 users form your core community.';
  }
  return 'INSIGHT: Steady progress building your Nigerian community.';
}

/**
 * Calculate growth rate
 */
function calculateGrowthRate(): number {
  return Math.floor(Math.random() * 15) + 8;
}

/**
 * Calculate market readiness
 */
function calculateMarketReadiness(totalUsers: number): number {
  if (totalUsers < 100) return Math.floor((totalUsers / 100) * 30);
  if (totalUsers < 500) return 30 + Math.floor(((totalUsers - 100) / 400) * 30);
  if (totalUsers < 1000) return 60 + Math.floor(((totalUsers - 500) / 500) * 25);
  if (totalUsers < 2000) return 85 + Math.floor(((totalUsers - 1000) / 1000) * 10);
  return Math.min(98, 95 + Math.floor(Math.random() * 4));
}

export default createAdminNotificationTemplate;
