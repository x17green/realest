// RealEST Email Template Types & Brand-Aligned Interfaces
// Consistent with design-system.ts and brand identity
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface BaseEmailData {
  email: string;
  firstName: string;
  lastName?: string;
}

export interface WaitlistEmailData extends BaseEmailData {
  position?: number;
}

export interface AdminNotificationData extends WaitlistEmailData {
  totalCount?: number;
  signupDate?: string;
}

export interface PasswordResetEmailData {
  email: string;
  firstName: string;
  otpCode: string; // 6-digit OTP code
  resetLink: string; // Direct reset link URL
  expiryMinutes?: number; // Default 15 minutes
}

export interface EmailConfig {
  companyName: string;
  tagline: string;
  domain: string;
  fromEmail: string;
  supportEmail: string;
  unsubscribeUrl: string;
  websiteUrl: string;
  logoUrl?: string;
}

export interface TemplateContext {
  user: {
    firstName: string;
    fullName: string;
    email: string;
  };
  waitlist: {
    position?: number;
    positionText: string;
    totalCount?: number;
  };
  company: EmailConfig;
  metadata: {
    timestamp: string;
    formattedDate: string;
  };
}

// Email template function signature
export type EmailTemplateFunction<T = any> = (
  data: T,
  context?: Partial<TemplateContext>,
) => EmailTemplate;

// RealEST Brand-aligned email styles
export interface EmailStyles {
  colors: {
    // Brand colors (matching design-system.ts)
    brandDark: string; // #07402F - foundation (60%)
    brandAccent: string; // #ADF434 - accent (10%)
    brandNeutral: string; // #2E322E - secondary (30%)
    brandLight: string; // #F8F9F7 - backgrounds

    // Semantic colors
    success: string; // Verified properties
    warning: string; // Pending verification
    error: string; // Rejected/Issues
    info: string; // Informational

    // UI colors
    text: string;
    textMuted: string;
    background: string;
    cardBackground: string;
    border: string;
  };
  fonts: {
    display: string; // Lufga for hero text
    heading: string; // Neulis Neue for headings
    body: string; // Space Grotesk for body
    mono: string; // JetBrains Mono for code
  };
  spacing: {
    xs: string; // 4px
    sm: string; // 8px
    md: string; // 16px
    lg: string; // 24px
    xl: string; // 32px
    xxl: string; // 48px
  };
}

// RealEST brand styles for email templates
export const realestEmailStyles: EmailStyles = {
  colors: {
    // Brand colors from design-system.ts
    brandDark: "#07402F", // Primary foundation color
    brandAccent: "#ADF434", // Acid green accent
    brandNeutral: "#2E322E", // Deep neutral
    brandLight: "#F8F9F7", // Off-white

    // Semantic colors (OKLCH converted to hex for email compatibility)
    success: "#5CB85C", // oklch(0.72 0.18 145) - verified
    warning: "#F0AD4E", // oklch(0.82 0.18 85) - pending
    error: "#D9534F", // oklch(0.62 0.22 25) - error
    info: "#5BC0DE", // oklch(0.70 0.12 220) - info

    // UI colors
    text: "#2E322E", // Deep neutral for readability
    textMuted: "#6B7280", // Muted gray
    background: "#F8F9F7", // Off-white background
    cardBackground: "#FFFFFF", // Pure white cards
    border: "#E5E7EB", // Light border
  },
  fonts: {
    display: '"Lufga", "Playfair Display", serif',
    heading: '"Neulis Neue", "Space Grotesk", sans-serif',
    body: '"Space Grotesk", "Open Sauce Sans", "Inter", sans-serif',
    mono: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
};
