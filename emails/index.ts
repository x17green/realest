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

// ── Data types ────────────────────────────────────────────────────────────────
export type { WaitlistEmailData }           from './templates/WaitlistConfirmationEmail';
export type { AdminNotificationData }       from './templates/AdminNotificationEmail';
export type { PasswordResetEmailData, OtpVerificationType } from './templates/PasswordResetEmail';
export type { WelcomeEmailData, OnboardingUserType }        from './templates/WelcomeEmail';
export type { OnboardingReminderEmailData } from './templates/OnboardingReminderEmail';
export type { PasswordChangedEmailData }    from './templates/PasswordChangedEmail';
export type { InquiryEmailData }            from './templates/InquiryNotificationEmail';
export type { SubAdminInvitationData }      from './templates/SubAdminInvitationEmail';

// ── Render utilities ──────────────────────────────────────────────────────────
export { renderEmail, renderEmailText, renderEmailFull } from './utils/renderEmail';

// ── Design tokens (useful for mobile app) ────────────────────────────────────
export { default as emailTheme, colors, fonts, fontSize, spacing, radius, shadows } from './styles/tokens';
