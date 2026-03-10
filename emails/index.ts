/**
 * Email template barrel export
 *
 * Import everything you need from '@/emails':
 *
 *   import { WelcomeEmail, renderEmail } from '@/emails'
 */

// ── Layouts ───────────────────────────────────────────────────────────────────
export { EmailLayout } from './layouts/EmailLayout';

// ── Reusable components ───────────────────────────────────────────────────────
export { EmailHeader }    from './components/EmailHeader';
export { EmailFooter }    from './components/EmailFooter';
export { EmailButton }    from './components/EmailButton';
export { EmailAlert }     from './components/EmailAlert';
export {
  EmailSection,
  EmailDivider,
  EmailDetailRow,
  EmailHeading,
  EmailText,
  OtpBlock,
  VerifiedBadge,
} from './components/EmailUI';

// ── Templates ─────────────────────────────────────────────────────────────────
export { WaitlistConfirmationEmail }  from './templates/WaitlistConfirmationEmail';
export { AdminNotificationEmail }     from './templates/AdminNotificationEmail';
export { PasswordResetEmail }         from './templates/PasswordResetEmail';
export { WelcomeEmail }               from './templates/WelcomeEmail';
export { OnboardingReminderEmail }    from './templates/OnboardingReminderEmail';
export { PasswordChangedEmail }       from './templates/PasswordChangedEmail';
export { InquiryNotificationEmail }   from './templates/InquiryNotificationEmail';
export { SubAdminInvitationEmail }    from './templates/SubAdminInvitationEmail';

// Listing lifecycle
export { ListingSubmissionEmail }     from './templates/ListingSubmissionEmail';
export { MLValidationPassedEmail }    from './templates/MLValidationPassedEmail';
export { MLValidationActionEmail }    from './templates/MLValidationActionEmail';
export { VettingAppointmentEmail }    from './templates/VettingAppointmentEmail';
export { ListingLiveEmail }           from './templates/ListingLiveEmail';
export { ListingRejectedEmail }       from './templates/ListingRejectedEmail';

// Engagement
export { InquirySentEmail }           from './templates/InquirySentEmail';
export { ViewingReminderEmail }       from './templates/ViewingReminderEmail';
export { PriceDropAlertEmail }        from './templates/PriceDropAlertEmail';

// Financial
export { InvoiceEmail }               from './templates/InvoiceEmail';
export { PaymentReceiptEmail }        from './templates/PaymentReceiptEmail';
export { ListingRenewalEmail }        from './templates/ListingRenewalEmail';
export { PaymentFailedEmail }         from './templates/PaymentFailedEmail';

// Security & admin
export { LoginAlertEmail }            from './templates/LoginAlertEmail';
export { VettingTaskEmail }           from './templates/VettingTaskEmail';

// Marketing
export { WeeklyDigestEmail }          from './templates/WeeklyDigestEmail';

// ── Data types ────────────────────────────────────────────────────────────────
export type { WaitlistEmailData }           from './templates/WaitlistConfirmationEmail';
export type { AdminNotificationData }       from './templates/AdminNotificationEmail';
export type { PasswordResetEmailData, OtpVerificationType } from './templates/PasswordResetEmail';
export type { WelcomeEmailData, OnboardingUserType }        from './templates/WelcomeEmail';
export type { OnboardingReminderEmailData } from './templates/OnboardingReminderEmail';
export type { PasswordChangedEmailData }    from './templates/PasswordChangedEmail';
export type { InquiryEmailData }            from './templates/InquiryNotificationEmail';
export type { SubAdminInvitationData }      from './templates/SubAdminInvitationEmail';

// Listing lifecycle
export type { ListingSubmissionEmailData }  from './templates/ListingSubmissionEmail';
export type { MLValidationPassedEmailData } from './templates/MLValidationPassedEmail';
export type { MLValidationActionEmailData, MLFlagReason } from './templates/MLValidationActionEmail';
export type { VettingAppointmentEmailData } from './templates/VettingAppointmentEmail';
export type { ListingLiveEmailData }        from './templates/ListingLiveEmail';
export type { ListingRejectedEmailData, RejectionReason } from './templates/ListingRejectedEmail';

// Engagement
export type { InquirySentEmailData }        from './templates/InquirySentEmail';
export type { ViewingReminderEmailData }    from './templates/ViewingReminderEmail';
export type { PriceDropAlertEmailData }     from './templates/PriceDropAlertEmail';

// Financial
export type { InvoiceEmailData }                    from './templates/InvoiceEmail';
export type { PaymentReceiptEmailData }     from './templates/PaymentReceiptEmail';
export type { ListingRenewalEmailData }     from './templates/ListingRenewalEmail';
export type { PaymentFailedEmailData, PaymentFailureReason } from './templates/PaymentFailedEmail';

// Security & admin
export type { LoginAlertEmailData }         from './templates/LoginAlertEmail';
export type { VettingTaskEmailData }        from './templates/VettingTaskEmail';

// Marketing
export type { WeeklyDigestEmailData, DigestListing } from './templates/WeeklyDigestEmail';

// ── Render utilities ──────────────────────────────────────────────────────────
export { renderEmail, renderEmailText, renderEmailFull } from './utils/renderEmail';

// ── Design tokens (useful for mobile app) ────────────────────────────────────
export { default as emailTheme, colors, fonts, fontSize, spacing, radius, shadows } from './styles/tokens';
