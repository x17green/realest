import {
  EmailTemplate,
  AdminNotificationData,
  EmailConfig,
  TemplateContext,
  EmailTemplateFunction
} from './types';
import {
  createBaseEmailHTML,
  createEmailHeader,
  createEmailFooter,
  createHighlightBox,
  createTemplateContext,
  createPlainTextTemplate,
  sanitizeHtml
} from './base-template';

// Default configuration for admin emails
const DEFAULT_CONFIG: EmailConfig = {
  companyName: 'RealProof',
  fromEmail: 'notifications@realproof.ng',
  supportEmail: 'hello@realproof.ng',
  unsubscribeUrl: '#',
  websiteUrl: 'https://realproof.ng'
};

/**
 * Generate admin notification email template
 */
export const createAdminNotificationTemplate: EmailTemplateFunction<AdminNotificationData> = (
  data: AdminNotificationData,
  contextOverrides: Partial<TemplateContext> = {}
): EmailTemplate => {
  const config = DEFAULT_CONFIG;
  const context = createTemplateContext(data, config, contextOverrides);

  const subject = `🎉 New Waitlist Signup - ${context.user.fullName}`;

  // Create email header with admin styling
  const header = `
    <div class="email-header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
        <h1>🎉 New Waitlist Signup</h1>
        <h2>A new user has joined the ${context.company.companyName} waitlist!</h2>
    </div>
  `;

  // User information section
  const userInfoContent = `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e0e0e0;">
      <h3 style="color: #28a745; margin-bottom: 15px;">👤 User Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 8px 0; font-weight: bold; color: #666; width: 30%;">Name:</td>
          <td style="padding: 8px 0;">${sanitizeHtml(context.user.fullName)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
          <td style="padding: 8px 0;">
            <a href="mailto:${context.user.email}" style="color: #007bff; text-decoration: none;">
              ${sanitizeHtml(context.user.email)}
            </a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Position:</td>
          <td style="padding: 8px 0;">
            ${context.waitlist.position
              ? `<span style="background: #e7f3ff; padding: 4px 8px; border-radius: 4px; color: #007bff; font-weight: bold;">#${context.waitlist.position}</span>`
              : '<span style="color: #6c757d;">Position not available</span>'
            }
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Total Count:</td>
          <td style="padding: 8px 0;">
            ${data.totalCount
              ? `<span style="background: #e8f5e8; padding: 4px 8px; border-radius: 4px; color: #28a745; font-weight: bold;">${data.totalCount} users</span>`
              : '<span style="color: #6c757d;">Not available</span>'
            }
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #666;">Signed up:</td>
          <td style="padding: 8px 0;">${context.metadata.formattedDate}</td>
        </tr>
      </table>
    </div>
  `;

  // Quick action buttons
  const actionButtonsContent = `
    <div style="text-align: center; margin: 20px 0;">
      <a href="mailto:${context.user.email}"
         style="display: inline-block; padding: 12px 24px; margin: 0 8px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        📧 Email User
      </a>
      <a href="${context.company.websiteUrl}/admin/waitlist"
         style="display: inline-block; padding: 12px 24px; margin: 0 8px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        📊 View Dashboard
      </a>
    </div>
  `;

  // Growth insights section
  const insightsContent = createGrowthInsights(data);

  // Email content
  const emailContent = `
    ${header}
    <div class="email-content">
      <p style="font-size: 16px; color: #333;">Great news! A new user has joined our waitlist.</p>

      ${userInfoContent}

      ${actionButtonsContent}

      ${insightsContent}

      <p style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
        <strong>Next Steps:</strong><br>
        • Welcome the new user personally if they're among your first 100 signups<br>
        • Monitor conversion patterns in your admin dashboard<br>
        • Consider sending targeted marketing based on signup trends
      </p>
    </div>
  `;

  // Create complete HTML
  const html = createBaseEmailHTML(
    emailContent + createEmailFooter(context.company),
    subject
  );

  // Create plain text version
  const textContent = `
New Waitlist Signup - ${context.user.fullName}

A new user has joined the ${context.company.companyName} waitlist!

USER DETAILS:
Name: ${context.user.fullName}
Email: ${context.user.email}
Position: ${context.waitlist.position ? `#${context.waitlist.position}` : 'Not available'}
Total Waitlist Count: ${data.totalCount || 'Not available'}
Signed up: ${context.metadata.formattedDate}

${createGrowthInsightsText(data)}

NEXT STEPS:
• Welcome the new user personally if they're among your first 100 signups
• Monitor conversion patterns in your admin dashboard
• Consider sending targeted marketing based on signup trends

Email the user: ${context.user.email}
View dashboard: ${context.company.websiteUrl}/admin/waitlist
  `;

  const text = createPlainTextTemplate(textContent, context.company);

  return { subject, html, text };
};

/**
 * Create growth insights section
 */
function createGrowthInsights(data: AdminNotificationData): string {
  const position = data.position || 0;
  const totalCount = data.totalCount || 0;

  let insightMessage = '';
  let insightColor = '#007bff';
  let insightIcon = '📈';

  if (position <= 10) {
    insightMessage = 'This is one of your first 10 users! Consider reaching out personally.';
    insightColor = '#28a745';
    insightIcon = '🔥';
  } else if (position <= 50) {
    insightMessage = 'You\'re building momentum! Early adopters are crucial for feedback.';
    insightColor = '#fd7e14';
    insightIcon = '🚀';
  } else if (position <= 100) {
    insightMessage = 'Great milestone approaching! First 100 users are your core community.';
    insightColor = '#6f42c1';
    insightIcon = '⭐';
  } else if (position <= 500) {
    insightMessage = 'Solid growth! You\'re building a strong foundation.';
    insightColor = '#007bff';
    insightIcon = '📊';
  } else if (position <= 1000) {
    insightMessage = 'Impressive traction! Time to start planning your beta launch.';
    insightColor = '#20c997';
    insightIcon = '🎯';
  } else {
    insightMessage = 'Amazing growth! You\'re well on your way to a successful launch.';
    insightColor = '#e83e8c';
    insightIcon = '🎉';
  }

  return `
    <div style="background: linear-gradient(135deg, ${insightColor}15 0%, ${insightColor}05 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${insightColor};">
      <h3 style="color: ${insightColor}; margin-bottom: 10px;">
        ${insightIcon} Growth Insight
      </h3>
      <p style="color: #333; font-size: 15px; margin: 0;">
        ${insightMessage}
      </p>
      ${totalCount > 0 ? `
        <div style="margin-top: 15px; display: flex; align-items: center; gap: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: ${insightColor};">${totalCount}</div>
            <div style="font-size: 12px; color: #666;">Total Users</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: ${insightColor};">${calculateGrowthRate()}%</div>
            <div style="font-size: 12px; color: #666;">Growth Rate</div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Create growth insights for plain text
 */
function createGrowthInsightsText(data: AdminNotificationData): string {
  const position = data.position || 0;
  const totalCount = data.totalCount || 0;

  if (position <= 10) {
    return 'INSIGHT: This is one of your first 10 users! Consider reaching out personally.';
  } else if (position <= 100) {
    return 'INSIGHT: Great milestone approaching! First 100 users are your core community.';
  } else if (position <= 1000) {
    return 'INSIGHT: Impressive traction! Time to start planning your beta launch.';
  }

  return 'INSIGHT: Amazing growth! You\'re building strong momentum.';
}

/**
 * Calculate mock growth rate (in real app, this would come from analytics)
 */
function calculateGrowthRate(): number {
  // Mock calculation - in real app, this would be based on actual data
  return Math.floor(Math.random() * 20) + 5; // Random between 5-25%
}

/**
 * Create emergency notification for high-volume signups
 */
export function createHighVolumeAlert(hourlySignups: number): string {
  if (hourlySignups > 50) {
    return `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ High Volume Alert</h4>
        <p style="color: #856404; margin: 0;">
          You've received ${hourlySignups} signups in the last hour.
          Consider checking your server capacity and email sending limits.
        </p>
      </div>
    `;
  }
  return '';
}

/**
 * Export default template function for backward compatibility
 */
export default createAdminNotificationTemplate;
