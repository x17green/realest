/**
 * Password Changed Notification Email Template
 *
 * A simple, branded security notification sent immediately after a successful
 * password reset. It confirms the change was intentional and provides a
 * clear remediation path if the user did not initiate it.
 *
 * Design: minimal dark-green header / white body / green security box
 * consistent with the RealEST password-reset.ts template aesthetic.
 */

import type { EmailTemplate } from "./types";

// ─── Data Interface ───────────────────────────────────────────────────────────

export interface PasswordChangedEmailData {
  email: string;
  firstName: string;
}

// ─── Template ─────────────────────────────────────────────────────────────────

export function createPasswordChangedTemplate(
  data: PasswordChangedEmailData,
): EmailTemplate {
  const { firstName } = data;

  const subject = "Your RealEST password has been changed";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f0;font-family:'Space Grotesk',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background-color:#f0f4f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0"
          style="width:100%;max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde8dd;">

          <!-- ── Header ────────────────────────────────────────────── -->
          <tr>
            <td style="background:#07402F;padding:26px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ADF434;letter-spacing:-0.3px;">
                RealEST
              </span>
            </td>
          </tr>

          <!-- ── Body ─────────────────────────────────────────────── -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="font-size:15px;font-weight:600;color:#07402F;margin:0 0 10px;">
                Hi ${firstName},
              </p>
              <p style="font-size:14px;color:#2E322E;line-height:1.65;margin:0 0 24px;">
                This is a confirmation that the password for your RealEST account
                (<strong>${data.email}</strong>) was successfully changed.
              </p>

              <!-- Security notice box -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                style="background:#f7faf7;border:1px solid #c8e0c8;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="font-size:13px;font-weight:600;color:#07402F;margin:0 0 6px;">
                      🔒 Didn't make this change?
                    </p>
                    <p style="font-size:13px;color:#2E322E;line-height:1.55;margin:0;">
                      If you did <strong>not</strong> change your password, your account may be
                      at risk. Please
                      <a href="https://realest.ng/forgot-password"
                        style="color:#07402F;text-decoration:underline;font-weight:600;">
                        reset your password immediately
                      </a>
                      and contact our support team.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
                If you made this change yourself, no further action is required.
                You can now sign in with your new password.
              </p>
            </td>
          </tr>

          <!-- ── Footer ───────────────────────────────────────────── -->
          <tr>
            <td style="padding:18px 32px 26px;border-top:1px solid #e8eee8;">
              <p style="font-size:11px;color:#9ca3af;text-align:center;line-height:1.6;margin:0;">
                RealEST · Nigeria's Most Trusted Property Marketplace<br />
                <a href="https://realest.ng" style="color:#9ca3af;text-decoration:none;">
                  realest.ng
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hi ${firstName},

Your RealEST password (${data.email}) was successfully changed.

If you did NOT make this change, your account may be at risk.
Reset your password immediately: https://realest.ng/forgot-password

— RealEST Team`;

  return { subject, html, text };
}

export default createPasswordChangedTemplate;
