/**
 * @deprecated — This module (lib/email-templates/) is preserved for rollback safety only.
 * Use the React Email system at /emails instead via lib/emailService.ts.
 * New email templates should be added as React Email components under emails/templates/.
 */

// Email Templates Module - Central Export Hub
// Provides clean exports for all email templates with context support

export * from "./types";
export * from "./base-template";

// Template generators
export {
  createWaitlistConfirmationTemplate,
  default as waitlistConfirmation,
} from "./waitlist-confirmation";

export {
  createAdminNotificationTemplate,
  default as adminNotification,
} from "./admin-notification";

export {
  createPasswordResetTemplate,
  default as passwordReset,
} from "./password-reset";

export {
  createInquiryTemplate,
  default as inquiryNotification,
} from "./inquiry";

export {
  createWelcomeTemplate,
  default as welcome,
} from "./welcome";

export {
  createOnboardingReminderTemplate,
  default as onboardingReminder,
} from "./onboarding-reminder";

export {
  createPasswordChangedTemplate,
  default as passwordChanged,
  type PasswordChangedEmailData,
} from "./password-changed";

// Re-export types for convenience
export type {
  EmailTemplate,
  WaitlistEmailData,
  AdminNotificationData,
  PasswordResetEmailData,
  InquiryEmailData,
  WelcomeEmailData,
  OnboardingReminderEmailData,
  OnboardingUserType,
  EmailConfig,
  TemplateContext,
  EmailTemplateFunction,
  EmailStyles,
} from "./types";

// Template factory with context support
import { createWaitlistConfirmationTemplate } from "./waitlist-confirmation";
import { createAdminNotificationTemplate } from "./admin-notification";
import { createPasswordResetTemplate } from "./password-reset";
import { createInquiryTemplate } from "./inquiry";
import { createWelcomeTemplate } from "./welcome";
import { createOnboardingReminderTemplate } from "./onboarding-reminder";
import { createPasswordChangedTemplate, PasswordChangedEmailData } from "./password-changed";
import {
  EmailConfig,
  WaitlistEmailData,
  AdminNotificationData,
  PasswordResetEmailData,
  InquiryEmailData,
  WelcomeEmailData,
  OnboardingReminderEmailData,
} from "./types";

// RealEST email configuration
export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  companyName: "RealEST Connect",
  tagline: "Find Your Next Move",
  domain: "realest.ng",
  fromEmail: process.env.FROM_EMAIL || "hello@realest.ng",
  supportEmail: "hello@realest.ng",
  unsubscribeUrl: "{unsubscribe_url}",
  websiteUrl: "https://realest.ng",
  logoUrl: "https://realest.ng/realest-logo.svg",
};

/**
 * Email Template Factory
 * Provides a centralized way to create emails with consistent configuration
 */
export class EmailTemplateFactory {
  private config: EmailConfig;

  constructor(config: Partial<EmailConfig> = {}) {
    this.config = { ...DEFAULT_EMAIL_CONFIG, ...config };
  }

  /**
   * Create waitlist confirmation email
   */
  createWaitlistConfirmation(data: WaitlistEmailData) {
    return createWaitlistConfirmationTemplate(data, {
      company: this.config,
    });
  }

  /**
   * Create admin notification email
   */
  createAdminNotification(data: AdminNotificationData) {
    return createAdminNotificationTemplate(data, {
      company: this.config,
    });
  }

  /**
   * Create password reset email
   */
  createPasswordReset(data: PasswordResetEmailData) {
    return createPasswordResetTemplate(data, {
      company: this.config,
    });
  }

  /**
   * Create property inquiry notification email
   */
  createInquiryNotification(data: InquiryEmailData) {
    return createInquiryTemplate(data);
  }

  /**
   * Create post-onboarding welcome email
   */
  createWelcome(data: WelcomeEmailData) {
    return createWelcomeTemplate(data, { company: this.config });
  }

  /**
   * Create onboarding reminder email
   */
  createOnboardingReminder(data: OnboardingReminderEmailData) {
    return createOnboardingReminderTemplate(data, { company: this.config });
  }

  /**
   * Create password changed security notification email
   */
  createPasswordChanged(data: PasswordChangedEmailData) {
    return createPasswordChangedTemplate(data);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<EmailConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
}

// Singleton factory instance with environment-based RealEST configuration
export const emailFactory = new EmailTemplateFactory({
  companyName: "RealEST Connect",
  tagline: "Find Your Next Move",
  domain: "realest.ng",
  fromEmail: process.env.FROM_EMAIL || "hello@realest.ng",
  supportEmail: process.env.SUPPORT_EMAIL || "hello@realest.ng",
  unsubscribeUrl: process.env.UNSUBSCRIBE_URL || "{unsubscribe_url}",
  websiteUrl: process.env.WEBSITE_URL || "https://realest.ng",
  logoUrl: process.env.LOGO_URL || "https://realest.ng/realest-logo.svg",
});

/**
 * Quick template generators (backward compatibility)
 */
export const Templates = {
  waitlistConfirmation: (data: WaitlistEmailData) =>
    emailFactory.createWaitlistConfirmation(data),

  adminNotification: (data: AdminNotificationData) =>
    emailFactory.createAdminNotification(data),

  passwordReset: (data: PasswordResetEmailData) =>
    emailFactory.createPasswordReset(data),

  inquiryNotification: (data: InquiryEmailData) =>
    emailFactory.createInquiryNotification(data),

  welcome: (data: WelcomeEmailData) =>
    emailFactory.createWelcome(data),

  onboardingReminder: (data: OnboardingReminderEmailData) =>
    emailFactory.createOnboardingReminder(data),

  passwordChanged: (data: PasswordChangedEmailData) =>
    emailFactory.createPasswordChanged(data),
};

// Template validation utilities
export function validateEmailData(data: any): data is WaitlistEmailData {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.email === "string" &&
    typeof data.firstName === "string" &&
    data.email.includes("@")
  );
}

export function validateAdminData(data: any): data is AdminNotificationData {
  return validateEmailData(data);
}

export function validatePasswordResetData(
  data: any,
): data is PasswordResetEmailData {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.email === "string" &&
    typeof data.firstName === "string" &&
    typeof data.otpCode === "string" &&
    typeof data.resetLink === "string" &&
    data.otpCode.length === 6 &&
    data.email.includes("@")
  );
}

/**
 * Template preview utility for development
 */
export function createTemplatePreview(
  templateName: "waitlist" | "admin" | "password-reset",
  sampleData?: Partial<WaitlistEmailData>,
) {
  const mockData: WaitlistEmailData = {
    email: "adebayo.okafor@example.com",
    firstName: "Adebayo",
    lastName: "Okafor",
    position: 42,
    ...sampleData,
  };

  switch (templateName) {
    case "waitlist":
      return Templates.waitlistConfirmation(mockData);
    case "admin":
      return Templates.adminNotification({
        ...mockData,
        totalCount: 150,
        signupDate: new Date().toISOString(),
      });
    case "password-reset":
      return Templates.passwordReset({
        email: "adebayo.okafor@example.com",
        firstName: "Adebayo",
        otpCode: "123456",
        resetLink: "https://realest.ng/reset-password?token=abc123",
        expiryMinutes: 15,
      });
    default:
      throw new Error(`Unknown template: ${templateName}`);
  }
}

// Export version info for debugging
export const TEMPLATE_VERSION = "1.0.0";
export const LAST_UPDATED = new Date().toISOString();
