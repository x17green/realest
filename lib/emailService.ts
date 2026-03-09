/**
 * RealEST Email Service
 *
 * Thin wrapper around the Resend SDK. All templates are React Email
 * components rendered server-side. The old lib/email-templates/ TS
 * string system is preserved for backward compatibility but new code
 * should only use this service.
 */

import * as React from 'react';
import { Resend } from 'resend';
import {
  WaitlistConfirmationEmail,
  AdminNotificationEmail,
  PasswordResetEmail,
  WelcomeEmail,
  OnboardingReminderEmail,
  PasswordChangedEmail,
  InquiryNotificationEmail,
  SubAdminInvitationEmail,
  renderEmailFull,
  type WaitlistEmailData,
  type AdminNotificationData,
  type PasswordResetEmailData,
  type WelcomeEmailData,
  type OnboardingReminderEmailData,
  type PasswordChangedEmailData,
  type InquiryEmailData,
  type SubAdminInvitationData,
} from '@/emails';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL           = process.env.FROM_EMAIL            || 'RealEST Connect <info@connect.realest.ng>';
const FROM_EMAIL_AUTH      = process.env.FROM_EMAIL_AUTH       || FROM_EMAIL;
const FROM_EMAIL_INQUIRIES = process.env.FROM_EMAIL_INQUIRIES  || FROM_EMAIL;
const FROM_EMAIL_WAITLIST  = process.env.FROM_EMAIL_WAITLIST   || FROM_EMAIL;

type EmailResult = { success: boolean; error?: string; messageId?: string; quotaExceeded?: boolean };

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  return (
    e.name === 'daily_quota_exceeded' ||
    e.name === 'monthly_quota_exceeded' ||
    String(e.message ?? '').toLowerCase().includes('quota')
  );
}

async function sendReactEmail({
  from, to, subject, component, replyTo,
}: {
  from: string;
  to: string | string[];
  subject: string;
  component: React.ReactElement;
  replyTo?: string;
}): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not configured — email sending disabled.');
    return { success: false, error: 'Email service not configured' };
  }
  try {
    const { html, text } = await renderEmailFull(component);
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message, quotaExceeded: isQuotaError(error) };
    }
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('❌ Unexpected email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown email error' };
  }
}

export async function sendWaitlistConfirmationEmail(data: WaitlistEmailData): Promise<EmailResult> {
  console.log(`📧 Sending waitlist confirmation to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: data.email,
    subject: WaitlistConfirmationEmail.subject(data),
    component: React.createElement(WaitlistConfirmationEmail, data),
  });
}

export async function sendWaitlistAdminNotification(data: AdminNotificationData): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    return { success: false, error: 'Admin notifications not configured' };
  }
  console.log(`📧 Sending admin notification for ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: AdminNotificationEmail.subject(data),
    component: React.createElement(AdminNotificationEmail, data),
  });
}

export async function sendHybridPasswordResetEmail(data: PasswordResetEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName || !data.otpCode || !data.resetLink) {
    return { success: false, error: 'Invalid password reset data' };
  }
  console.log(`📧 Sending password reset to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: PasswordResetEmail.subject(data),
    component: React.createElement(PasswordResetEmail, data),
  });
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName || !data.userType || !data.dashboardUrl) {
    return { success: false, error: 'Invalid welcome email data' };
  }
  console.log(`📧 Sending welcome email to ${data.email} (${data.userType})`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: WelcomeEmail.subject(data),
    component: React.createElement(WelcomeEmail, data),
  });
}

export async function sendOnboardingReminderEmail(data: OnboardingReminderEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName || !data.userType || !data.onboardingUrl) {
    return { success: false, error: 'Invalid onboarding reminder data' };
  }
  console.log(`📧 Sending onboarding reminder to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: OnboardingReminderEmail.subject(data),
    component: React.createElement(OnboardingReminderEmail, data),
  });
}

export async function sendPasswordChangedEmail(data: PasswordChangedEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName) {
    return { success: false, error: 'Invalid data for password-changed notification' };
  }
  console.log(`📧 Sending password-changed notification to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: PasswordChangedEmail.subject(data),
    component: React.createElement(PasswordChangedEmail, data),
  });
}

export async function sendInquiryEmail(data: InquiryEmailData): Promise<EmailResult> {
  console.log(`📧 Sending inquiry email to ${data.recipientEmail} for "${data.propertyTitle}"`);
  return sendReactEmail({
    from: FROM_EMAIL_INQUIRIES,
    to: data.recipientEmail,
    replyTo: data.senderEmail,
    subject: InquiryNotificationEmail.subject(data),
    component: React.createElement(InquiryNotificationEmail, data),
  });
}

export async function sendSubAdminInvitationEmail(data: SubAdminInvitationData): Promise<EmailResult> {
  console.log(`📧 Sending sub-admin invitation to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: SubAdminInvitationEmail.subject(data),
    component: React.createElement(SubAdminInvitationEmail, data),
  });
}

export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }
  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    return response.ok
      ? { success: true }
      : { success: false, error: 'Invalid API key or configuration' };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export type {
  WaitlistEmailData,
  AdminNotificationData,
  PasswordResetEmailData,
  WelcomeEmailData,
  OnboardingReminderEmailData,
  PasswordChangedEmailData,
  InquiryEmailData,
  SubAdminInvitationData,
} from '@/emails';
