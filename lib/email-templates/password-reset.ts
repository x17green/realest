// OTP Verification Email Template — minimal, dynamic by verificationType
// Replaces the old verbose password-reset template.
// Controlled via PasswordResetEmailData.verificationType ("reset" | "signup").

import type {
  EmailTemplate,
  EmailTemplateFunction,
  EmailConfig,
  TemplateContext,
  PasswordResetEmailData,
} from "./types";
import {
  createBaseEmailHTML,
  createEmailHeader,
  createEmailFooter,
} from "./base-template";

// ─── Config ─────────────────────────────────────────────────────────────────
const REALEST_CONFIG: EmailConfig = {
  companyName: "RealEST Connect",
  tagline: "Secure Property Platform",
  domain: "realest.ng",
  fromEmail: process.env.FROM_EMAIL || "hello@realest.ng",
  supportEmail: "hello@realest.ng",
  unsubscribeUrl: "{unsubscribe_url}",
  websiteUrl: "https://realest.ng",
  logoUrl: process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL + "/realest-bimi-logo.svg"
    : "https://realest.ng/realest-bimi-logo.svg",
};

// ─── Per-type copy ────────────────────────────────────────────────────────────
const COPY = {
  reset: {
    subject: (code: string) => `RealEST Connect password reset OTP [${code}]`,
    subtitle: "Password Reset",
    context:
      "You requested a password reset for your RealEST Connect account. Enter the code below to continue.",
    linkLabel: "Reset password now",
  },
  signup: {
    subject: (code: string) => `Verify your RealEST Connect account [${code}]`,
    subtitle: "Email Verification Needed",
    context:
      "Thanks for signing up with RealEST Connect! Use the code below to verify your email address.",
    linkLabel: "Verify email now",
  },
} as const;

// ─── Template ─────────────────────────────────────────────────────────────────
/**
 * Minimal OTP email that adapts its subject and body copy based on
 * `data.verificationType` ("reset" | "signup", defaults to "reset").
 *
 * What changed vs the old template:
 *  • Subject now contains the OTP code:  [123456] Reset your RealEST password
 *  • No decorative icons (shield / key / clock images removed)
 *  • No yellow security-warning box
 *  • No "Get Help" support button section
 *  • Direct action link is a plain underlined text link — no giant button
 */
export const createPasswordResetTemplate: EmailTemplateFunction<
  PasswordResetEmailData
> = (
  data: PasswordResetEmailData,
  context?: Partial<TemplateContext>,
): EmailTemplate => {
  const config = { ...REALEST_CONFIG, ...context?.company };
  const expiryMinutes = data.expiryMinutes ?? 15;
  const type = data.verificationType ?? "reset";
  const copy = COPY[type];

  const subject = copy.subject(data.otpCode);

  const header = createEmailHeader(config.companyName, copy.subtitle);

  // ── Code block ──────────────────────────────────────────────────────────────
  // Wrap in <a> so users can tap it on mobile to auto-fill via otpFillUrl;
  // fall back to a non-interactive <span> when no fill URL is available.
  const codeInner = `
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 38px;
    font-weight: 700;
    letter-spacing: 10px;
    color: #07402F;
    display: inline-block;
    padding: 22px 36px;
    background: #F4F7F4;
    border: 2px solid #C8D8D4;
    border-radius: 12px;
  `;

  const codeBlock = data.otpFillUrl
    ? `<a href="${data.otpFillUrl}" style="${codeInner} text-decoration: none;" title="Click to auto-fill this code">${data.otpCode}</a>`
    : `<span style="${codeInner}">${data.otpCode}</span>`;

  // ── Action link (plain text, no button) ────────────────────────────────────
  const actionLink = `<a href="${data.resetLink}" style="color: #07402F; font-weight: 600; text-decoration: underline;">${copy.linkLabel}</a>`;

  // ── Body ────────────────────────────────────────────────────────────────────
  const body = `
    <div class="email-content">
      <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #2E322E;">
        Hi ${data.firstName},
      </p>
      <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.6; color: #2E322E;">
        ${copy.context}
      </p>

      <div style="text-align: center; margin: 0 0 12px;">
        ${codeBlock}
      </div>

      <p style="margin: 0 0 32px; font-size: 13px; color: #6B7280; text-align: center; line-height: 1.5;">
        Code expires in ${expiryMinutes} minutes.${data.otpFillUrl ? "<br>Tap the code above to auto-fill it in the app." : ""}
      </p>

      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #2E322E;">
        Prefer the web link? Click here ${actionLink} — expires in ${expiryMinutes} minutes.
      </p>

      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #9CA3AF;">
        Didn't request this? You can safely ignore this email.
      </p>
    </div>
  `;

  const footer = createEmailFooter(config);
  const html = createBaseEmailHTML(`${header}${body}${footer}`, subject);

  const text = [
    `Hi ${data.firstName},`,
    "",
    copy.context,
    "",
    `Your verification code: ${data.otpCode}`,
    `Expires in: ${expiryMinutes} minutes`,
    ...(data.otpFillUrl ? [`Auto-fill: ${data.otpFillUrl}`] : []),
    "",
    `${copy.linkLabel}: ${data.resetLink}`,
    "",
    "If you didn't request this, please ignore this message.",
    "",
    `— ${config.companyName}`,
  ].join("\n");

  return { subject, html, text };
};

export default createPasswordResetTemplate;

