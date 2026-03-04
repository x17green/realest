import { Resend } from "resend";
import {
  Templates,
  emailFactory,
  validateEmailData,
  validateAdminData,
  validatePasswordResetData,
  type WaitlistEmailData,
  type AdminNotificationData,
  type PasswordResetEmailData,
  type InquiryEmailData,
  type WelcomeEmailData,
  type OnboardingReminderEmailData,
  type PasswordChangedEmailData,
  type EmailTemplate,
} from "./email-templates";

// Email service configuration
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL          || "RealEST Connect <info@connect.realest.ng>";
const FROM_EMAIL_INQUIRIES = process.env.FROM_EMAIL_INQUIRIES || FROM_EMAIL;
const FROM_EMAIL_AUTH = process.env.FROM_EMAIL_AUTH     || FROM_EMAIL;
const FROM_EMAIL_WAITLIST = process.env.FROM_EMAIL_WAITLIST || FROM_EMAIL;
const COMPANY_NAME = "RealEST Connect";

/** Returns true when Resend rejects due to daily/monthly quota */
function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  return (
    e.name === "daily_quota_exceeded" ||
    e.name === "monthly_quota_exceeded" ||
    String(e.message ?? "").toLowerCase().includes("quota")
  );
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmationEmail(
  data: WaitlistEmailData,
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  quotaExceeded?: boolean;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured. Email sending disabled.");
      return { success: false, error: "Email service not configured" };
    }

    // Validate input data
    if (!validateEmailData(data)) {
      console.error("❌ Invalid email data provided:", data);
      return { success: false, error: "Invalid email data" };
    }

    console.log(
      `📧 Sending waitlist email to ${data.email} with position: ${data.position || "undefined"}`,
    );

    // Generate template using our modular system
    const template = Templates.waitlistConfirmation(data);

    const { data: emailResult, error } = await resend.emails.send({
      from: FROM_EMAIL_WAITLIST,
      to: [data.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Email sending failed:", error);
      return { success: false, error: error.message, quotaExceeded: isQuotaError(error) };
    }

    console.log("✅ Confirmation email sent:", emailResult?.id);
    return { success: true, messageId: emailResult?.id };
  } catch (error) {
    console.error("❌ Unexpected email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Send admin notification email when someone joins waitlist
 */
export async function sendWaitlistAdminNotification(
  data: AdminNotificationData,
): Promise<{
  success: boolean;
  error?: string;
  quotaExceeded?: boolean;
}> {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
      return { success: false, error: "Admin notifications not configured" };
    }

    // Validate input data
    if (!validateAdminData(data)) {
      console.error("❌ Invalid admin notification data provided:", data);
      return { success: false, error: "Invalid admin notification data" };
    }

    console.log(
      `📧 Sending admin notification for ${data.email} with position: ${data.position || "undefined"}`,
    );

    // Generate template using our modular system
    const template = Templates.adminNotification(data);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [process.env.ADMIN_EMAIL],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Admin notification failed:", error);
      return { success: false, error: error.message, quotaExceeded: isQuotaError(error) };
    }

    console.log("✅ Admin notification sent successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Admin notification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch email sending utility
 */
export async function sendBatchEmails(
  emails: Array<{
    type: "waitlist" | "admin";
    data: WaitlistEmailData | AdminNotificationData;
  }>,
): Promise<{
  success: boolean;
  results: Array<{ success: boolean; error?: string }>;
}> {
  try {
    const results = await Promise.allSettled(
      emails.map(async ({ type, data }) => {
        if (type === "waitlist") {
          return await sendWaitlistConfirmationEmail(data as WaitlistEmailData);
        } else {
          return await sendWaitlistAdminNotification(
            data as AdminNotificationData,
          );
        }
      }),
    );

    const formattedResults = results.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : { success: false, error: result.reason?.message || "Unknown error" },
    );

    const allSuccessful = formattedResults.every((result) => result.success);

    return {
      success: allSuccessful,
      results: formattedResults,
    };
  } catch (error) {
    console.error("❌ Batch email sending error:", error);
    return {
      success: false,
      results: [
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ],
    };
  }
}

/**
 * Email template preview utility for development
 */
export async function previewEmailTemplate(
  type: "waitlist" | "admin",
  sampleData?: Partial<WaitlistEmailData>,
): Promise<EmailTemplate> {
  const mockData: WaitlistEmailData = {
    email: "preview@example.com",
    firstName: "Preview",
    lastName: "User",
    position: 42,
    ...sampleData,
  };

  if (type === "waitlist") {
    return Templates.waitlistConfirmation(mockData);
  } else {
    return Templates.adminNotification({
      ...mockData,
      totalCount: 150,
      signupDate: new Date().toISOString(),
    });
  }
}

/**
 * Send property inquiry notification to the listing contact (owner or agent)
 */
export async function sendInquiryEmail(data: InquiryEmailData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  quotaExceeded?: boolean;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured. Email sending disabled.");
      return { success: false, error: "Email service not configured" };
    }

    console.log(
      `📧 Sending inquiry email to ${data.recipientEmail} for property: ${data.propertyTitle}`,
    );

    const template = Templates.inquiryNotification(data);

    const { data: emailResult, error } = await resend.emails.send({
      from: FROM_EMAIL_INQUIRIES,
      to: [data.recipientEmail],
      replyTo: data.senderEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Inquiry email sending failed:", error);
      return { success: false, error: error.message, quotaExceeded: isQuotaError(error) };
    }

    console.log("✅ Inquiry email sent:", emailResult?.id);
    return { success: true, messageId: emailResult?.id };
  } catch (error) {
    console.error("❌ Unexpected inquiry email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Send hybrid password reset email (OTP + Link)
 * Provides users with both OTP code entry and direct reset link options
 */
export async function sendHybridPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  quotaExceeded?: boolean;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured. Email sending disabled.");
      return { success: false, error: "Email service not configured" };
    }

    // Validate input data
    if (!validatePasswordResetData(data)) {
      console.error("❌ Invalid password reset data provided:", data);
      return { success: false, error: "Invalid password reset data" };
    }

    console.log(`📧 Sending hybrid password reset email to ${data.email}`);

    // Generate template using our modular system
    const template = Templates.passwordReset(data);

    const { data: emailResult, error } = await resend.emails.send({
      from: FROM_EMAIL_AUTH,
      to: [data.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Password reset email sending failed:", error);
      return { success: false, error: error.message, quotaExceeded: isQuotaError(error) };
    }

    console.log("✅ Password reset email sent:", emailResult?.id);
    return { success: true, messageId: emailResult?.id };
  } catch (error) {
    console.error("❌ Unexpected password reset email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Send welcome email after onboarding completion
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData,
): Promise<{ success: boolean; error?: string; messageId?: string; quotaExceeded?: boolean }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured. Email sending disabled.");
      return { success: false, error: "Email service not configured" };
    }

    if (!data.email || !data.firstName || !data.userType || !data.dashboardUrl) {
      return { success: false, error: "Invalid welcome email data" };
    }

    console.log(`📧 Sending welcome email to ${data.email} (${data.userType})`);

    const template = Templates.welcome(data);

    const { data: emailResult, error } = await resend.emails.send({
      from: FROM_EMAIL_AUTH,
      to: [data.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Welcome email sending failed:", error);
      return { success: false, error: error.message, quotaExceeded: isQuotaError(error) };
    }

    console.log("✅ Welcome email sent:", emailResult?.id);
    return { success: true, messageId: emailResult?.id };
  } catch (error) {
    console.error("❌ Unexpected welcome email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Send onboarding reminder email to users who haven't completed onboarding
 */
export async function sendOnboardingReminderEmail(
  data: OnboardingReminderEmailData,
): Promise<{ success: boolean; error?: string; messageId?: string; quotaExceeded?: boolean }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured. Email sending disabled.");
      return { success: false, error: "Email service not configured" };
    }

    if (!data.email || !data.firstName || !data.userType || !data.onboardingUrl) {
      return { success: false, error: "Invalid onboarding reminder data" };
    }

    console.log(`📧 Sending onboarding reminder to ${data.email} (${data.userType})`);

    const template = Templates.onboardingReminder(data);

    const { data: emailResult, error } = await resend.emails.send({
      from: FROM_EMAIL_AUTH,
      to: [data.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Onboarding reminder email sending failed:", error);
      return { success: false, error: error.message, quotaExceeded: isQuotaError(error) };
    }

    console.log("✅ Onboarding reminder email sent:", emailResult?.id);
    return { success: true, messageId: emailResult?.id };
  } catch (error) {
    console.error("❌ Unexpected onboarding reminder email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Send password-changed security notification
 *
 * Called immediately after a successful password reset to confirm the change
 * and give the user a clear remediation path if they did not initiate it.
 */
export async function sendPasswordChangedEmail(data: PasswordChangedEmailData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured. Password-changed notification skipped.");
      return { success: false, error: "Email service not configured" };
    }

    if (!data.email || !data.firstName) {
      return { success: false, error: "Invalid data for password-changed notification" };
    }

    console.log(`📧 Sending password-changed notification to ${data.email}`);

    const template = Templates.passwordChanged(data);

    const { data: emailResult, error } = await resend.emails.send({
      from: FROM_EMAIL_AUTH,
      to: [data.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Password-changed notification failed:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Password-changed notification sent:", emailResult?.id);
    return { success: true, messageId: emailResult?.id };
  } catch (error) {
    console.error("❌ Unexpected password-changed notification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    // Test with a simple API call to Resend
    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: "Invalid API key or configuration" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Environment variables needed:
 *
 * RESEND_API_KEY=re_xxxxxxxx (get from resend.com)
 * FROM_EMAIL=hello@realest.ng (verified domain in Resend)
 * ADMIN_EMAIL=admin@realest.ng (optional, for admin notifications)
 * SUPPORT_EMAIL=hello@realest.ng (optional, for email footers)
 * WEBSITE_URL=https://realest.ng (optional, for email links)
 * UNSUBSCRIBE_URL={unsubscribe_url} (optional, for unsubscribe functionality)
 */

// Re-export types for convenience
export type {
  WaitlistEmailData,
  AdminNotificationData,
  PasswordResetEmailData,
  InquiryEmailData,
  WelcomeEmailData,
  OnboardingReminderEmailData,
  PasswordChangedEmailData,
  EmailTemplate,
} from "./email-templates";

// Export email factory for advanced usage
export { emailFactory, Templates } from "./email-templates";
