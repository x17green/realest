import {
  EmailTemplate,
  WaitlistEmailData,
  EmailConfig,
  TemplateContext,
  EmailTemplateFunction
} from './types';
import {
  createBaseEmailHTML,
  createEmailHeader,
  createEmailFooter,
  createHighlightBox,
  createStatsSection,
  createFeatureList,
  createTemplateContext,
  createPlainTextTemplate
} from './base-template';

// Default configuration for waitlist emails
const DEFAULT_CONFIG: EmailConfig = {
  companyName: 'RealProof',
  fromEmail: 'hello@realproof.ng',
  supportEmail: 'hello@realproof.ng',
  unsubscribeUrl: '{unsubscribe_url}',
  websiteUrl: 'https://realproof.ng'
};

// Company stats for the email
const COMPANY_STATS = [
  { number: '10K+', label: 'Properties Ready' },
  { number: '99.9%', label: 'Verification Accuracy' },
  { number: '0', label: 'Fake Listings' }
];

// Key features to highlight
const KEY_FEATURES = [
  {
    title: 'Geo-Verified Properties',
    description: 'Every listing is verified with precise location data'
  },
  {
    title: 'Zero Duplicates',
    description: 'No more scrolling through the same property multiple times'
  },
  {
    title: 'Real-Time Market Data',
    description: 'Live insights and pricing information'
  },
  {
    title: 'Transparent Process',
    description: 'No hidden fees, no fake listings, no surprises'
  }
];

// Next steps for waitlist users
const NEXT_STEPS = [
  {
    title: '✅ Confirmation',
    description: 'You\'re officially on our waitlist'
  },
  {
    title: '🚀 Early Access',
    description: 'You\'ll be among the first to access our platform'
  },
  {
    title: '📧 Updates',
    description: 'We\'ll keep you informed about our progress'
  },
  {
    title: '🎁 Exclusive Benefits',
    description: 'Special launch offers and features'
  }
];

/**
 * Generate waitlist confirmation email template
 */
export const createWaitlistConfirmationTemplate: EmailTemplateFunction<WaitlistEmailData> = (
  data: WaitlistEmailData,
  contextOverrides: Partial<TemplateContext> = {}
): EmailTemplate => {
  const config = DEFAULT_CONFIG;
  const context = createTemplateContext(data, config, contextOverrides);

  const subject = `Welcome to ${context.company.companyName} Waitlist! 🎉`;

  // Create email header
  const header = createEmailHeader(
    context.company.companyName,
    'Welcome to the Future of Real Estate!'
  );

  // Position highlight box
  const positionBox = createHighlightBox(
    `🎯 ${context.waitlist.positionText}`,
    '<p>You\'re one of our early supporters, and we can\'t wait to show you what we\'ve been building.</p>',
    'success'
  );

  // Next steps box
  const nextStepsContent = `
    <ul class="feature-list">
      ${NEXT_STEPS.map(step => `
        <li><strong>${step.title}:</strong> ${step.description}</li>
      `).join('')}
    </ul>
  `;
  const nextStepsBox = createHighlightBox('What happens next?', nextStepsContent);

  // Company stats
  const statsSection = createStatsSection(COMPANY_STATS);

  // Features list
  const featuresSection = createFeatureList(KEY_FEATURES);

  // Email content
  const emailContent = `
    ${header}
    <div class="email-content">
      <h2>Hi ${context.user.firstName}! 👋</h2>

      <p>Thank you for joining our waitlist! We're thrilled to have you as part of our community.</p>

      ${positionBox}

      ${nextStepsBox}

      ${statsSection}

      <p><strong>What makes ${context.company.companyName} different?</strong></p>
      ${featuresSection}

      <p>We're working hard to launch soon and we'll notify you the moment we're ready!</p>

      <p>Have questions? Just reply to this email - we'd love to hear from you.</p>

      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The ${context.company.companyName} Team</strong>
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
Welcome to ${context.company.companyName} Waitlist!

Hi ${context.user.firstName}!

Thank you for joining our waitlist! We're building Nigeria's most trusted property marketplace with geo-verified listings and zero duplicates.

${context.waitlist.positionText}

You're part of an exclusive group that will get first access to our revolutionary property marketplace.

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

Our impressive stats:
- 10K+ Properties Ready
- 99.9% Verification Accuracy
- 0 Fake Listings

We'll notify you the moment we're ready to launch!

Questions? Just reply to this email.

Best regards,
The ${context.company.companyName} Team
  `;

  const text = createPlainTextTemplate(textContent, context.company);

  return { subject, html, text };
};

/**
 * Create a personalized welcome message based on user data
 */
export function createPersonalizedWelcome(data: WaitlistEmailData): string {
  const timeOfDay = new Date().getHours();
  let greeting = 'Hello';

  if (timeOfDay < 12) greeting = 'Good morning';
  else if (timeOfDay < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  return `${greeting}, ${data.firstName}! Welcome to the RealProof family.`;
}

/**
 * Create a dynamic position message
 */
export function createPositionMessage(position?: number, totalCount?: number): string {
  if (!position || position <= 0) {
    return "You're now part of our exclusive early access community!";
  }

  if (position <= 100) {
    return `🔥 Wow! You're in the top 100 (#${position}) - you're going to love what we've built!`;
  }

  if (position <= 500) {
    return `⭐ You're #${position} on our waitlist - you're one of our early supporters!`;
  }

  if (position <= 1000) {
    return `🎯 You're #${position} on our waitlist - thank you for joining our growing community!`;
  }

  return `📈 You're #${position} on our waitlist - welcome to the RealProof revolution!`;
}

/**
 * Export default template function for backward compatibility
 */
export default createWaitlistConfirmationTemplate;
