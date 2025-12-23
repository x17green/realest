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
  type EmailTemplate,
} from "./email-templates";

// Email service configuration
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@realproof.ng";
const COMPANY_NAME = "RealProof";

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmationEmail(
  data: WaitlistEmailData,
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
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
      from: FROM_EMAIL,
      to: [data.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Email sending failed:", error);
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
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
 * Send hybrid password reset email (OTP + Link)
 * Provides users with both OTP code entry and direct reset link options
 */
export async function sendHybridPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
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
      from: FROM_EMAIL,
      to: [data.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("❌ Password reset email sending failed:", error);
      return { success: false, error: error.message };
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
 * FROM_EMAIL=hello@realproof.ng (verified domain in Resend)
 * ADMIN_EMAIL=admin@realproof.ng (optional, for admin notifications)
 * SUPPORT_EMAIL=hello@realproof.ng (optional, for email footers)
 * WEBSITE_URL=https://realproof.ng (optional, for email links)
 * UNSUBSCRIBE_URL={unsubscribe_url} (optional, for unsubscribe functionality)
 */

// Re-export types for convenience
export type {
  WaitlistEmailData,
  AdminNotificationData,
  PasswordResetEmailData,
  EmailTemplate,
} from "./email-templates";

// Export email factory for advanced usage
export { emailFactory, Templates } from "./email-templates";
