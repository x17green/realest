# emails/

React Email template system for RealEST. All 24 user-facing emails live here.

---

## Quick Start

```bash
# Start the visual preview server (all 24 templates with live reload)
npm run email:dev
# → opens at http://localhost:3001

# Validate all templates build correctly (run before every commit)
npx react-email export --dir emails/templates
# → should print: ✔ Successfully exported emails
```

---

## Directory Layout

```
emails/
├── index.ts                    ← single import surface for the rest of the app
├── styles/
│   └── tokens.ts               ← ALL design values: colors, fonts, spacing, etc.
├── layouts/
│   └── EmailLayout.tsx         ← Html + Head + Body shell, dark-mode CSS
├── components/
│   ├── EmailHeader.tsx         ← RealEST wordmark with dark/light swap
│   ├── EmailFooter.tsx         ← links, unsubscribe, copyright
│   ├── EmailButton.tsx         ← primary / secondary / ghost variants
│   ├── EmailAlert.tsx          ← success / warning / error / info / brand callouts
│   └── EmailUI.tsx             ← EmailSection, EmailDivider, EmailDetailRow,
│                                   EmailHeading, EmailText, OtpBlock, VerifiedBadge
├── templates/                  ← 24 templates, one per user-facing email
└── utils/
    └── renderEmail.ts          ← renderEmail / renderEmailText / renderEmailFull
```

---

## Template Inventory

### Platform

| Import name | File | Use case |
|---|---|---|
| `WaitlistConfirmationEmail` | `WaitlistConfirmationEmail.tsx` | User joins waitlist |
| `AdminNotificationEmail` | `AdminNotificationEmail.tsx` | Admin copy of new waitlist sign-up |
| `PasswordResetEmail` | `PasswordResetEmail.tsx` | Password reset OTP |
| `WelcomeEmail` | `WelcomeEmail.tsx` | Account verified, onboarding starts |
| `OnboardingReminderEmail` | `OnboardingReminderEmail.tsx` | Incomplete onboarding (D+3 reminder) |
| `PasswordChangedEmail` | `PasswordChangedEmail.tsx` | Password changed confirmation |
| `InquiryNotificationEmail` | `InquiryNotificationEmail.tsx` | Owner receives buyer inquiry |
| `SubAdminInvitationEmail` | `SubAdminInvitationEmail.tsx` | Admin invites sub-admin |

### Listing Lifecycle

| Import name | File | Use case |
|---|---|---|
| `ListingSubmissionEmail` | `ListingSubmissionEmail.tsx` | Owner submits property |
| `MLValidationPassedEmail` | `MLValidationPassedEmail.tsx` | Auto-checks passed |
| `MLValidationActionEmail` | `MLValidationActionEmail.tsx` | Auto-checks flagged issues |
| `VettingAppointmentEmail` | `VettingAppointmentEmail.tsx` | Physical inspection booked |
| `ListingLiveEmail` | `ListingLiveEmail.tsx` | Listing approved and live |
| `ListingRejectedEmail` | `ListingRejectedEmail.tsx` | Listing not approved |

### Engagement

| Import name | File | Use case |
|---|---|---|
| `InquirySentEmail` | `InquirySentEmail.tsx` | Buyer's copy of sent inquiry |
| `ViewingReminderEmail` | `ViewingReminderEmail.tsx` | Upcoming viewing reminder (D-1) |
| `PriceDropAlertEmail` | `PriceDropAlertEmail.tsx` | Saved search price drop |

### Financial

| Import name | File | Use case |
|---|---|---|
| `InvoiceEmail` | `InvoiceEmail.tsx` | Invoice issued |
| `PaymentReceiptEmail` | `PaymentReceiptEmail.tsx` | Successful payment |
| `ListingRenewalEmail` | `ListingRenewalEmail.tsx` | Listing approaching expiry |
| `PaymentFailedEmail` | `PaymentFailedEmail.tsx` | Payment declined |

### Security & Admin

| Import name | File | Use case |
|---|---|---|
| `LoginAlertEmail` | `LoginAlertEmail.tsx` | New device sign-in detected |
| `VettingTaskEmail` | `VettingTaskEmail.tsx` | Field agent inspection task assignment |

### Marketing

| Import name | File | Use case |
|---|---|---|
| `WeeklyDigestEmail` | `WeeklyDigestEmail.tsx` | Weekly new-listings digest |

---

## Sending an Email

All email dispatch goes through `lib/emailService.ts`. Never import Resend directly in routes.

```ts
import { sendWelcomeEmail } from '@/lib/emailService';

const result = await sendWelcomeEmail({
  email: 'tunde@example.com',
  firstName: 'Tunde',
  userType: 'owner',
});

if (!result.success) {
  console.error('Email failed:', result.error);
}
```

In **Vercel serverless route handlers**, wrap sends in `after()` so they run after the response returns:

```ts
import { NextResponse, after } from 'next/server';

export async function POST(req: NextRequest) {
  // ... handle request ...

  after(async () => {
    await sendWelcomeEmail({ ... });
  });

  return NextResponse.json({ ok: true });
}
```

---

## Adding a New Template

1. Copy an existing simple template (e.g. `PasswordChangedEmail.tsx`) as your starting point.
2. Name the file `MyNewEmail.tsx` and export a component named `MyNewEmail`.
3. Add default values for **all** props in the destructuring signature:
   - Arrays: `items = []`
   - Strings: `name = ''`
   - Enum/union props: a sensible literal default, e.g. `status = 'pending'`
4. Add `MyNewEmail.subject = (data) => '...'` static subject line.
5. Export `previewProps` with realistic data.
6. Add to `emails/index.ts`:
   - Named export of the component
   - Named export of the data type
7. Add a `sendMyNewEmail()` function in `lib/emailService.ts`.
8. Run `npx react-email export --dir emails/templates` — must succeed.
9. Run `npm run typecheck` — must be clean.

---

## Token Quick Reference

### Key color names

```ts
colors.brandDark     '#07402F'   // Dark green — hero sections, primary headings
colors.brandAccent   '#ADF434'   // Acid green — CTAs, badges (use ≤10%)
colors.brandLight    '#F8F9F7'   // Off-white — page/card backgrounds
colors.brandNeutral  '#2E322E'   // Deep neutral — body text

// State colors — the only valid suffixes are (none), Bg, Border:
colors.error / colors.errorBg / colors.errorBorder
colors.warning / colors.warningBg / colors.warningBorder
colors.success / colors.successBg / colors.successBorder
colors.info / colors.infoBg / colors.infoBorder

// ❌ NEVER: colors.textError, colors.borderError — these do not exist
```

### Font size keys (max is `'3xl'`)

`xs` `sm` `base` `md` `lg` `xl` `2xl` `3xl`

### Spacing keys (no `'7'`)

`'1'` `'2'` `'3'` `'4'` `'5'` `'6'` `'8'` `'10'` `'12'` `'16'`

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| `colors.textError` | Use `colors.error` |
| `fontSize['4xl']` | Max is `fontSize['3xl']` |
| `spacing['7']` | Use `spacing['6']` or `spacing['8']` |
| React Email `<Text>` inside `<EmailAlert>` | Use native `<p>` elements inside EmailAlert |
| Array prop with no default | Add `= []` in destructuring — required for export |
| `(async () => { await sendEmail() })()` in a route handler | Use `after()` from `next/server` |
| No `NEXT_PUBLIC_SITE_URL` in Vercel | Set it — without it, all images are broken in production |
| Tailwind classes on email elements | Inline styles only — email clients strip class-based CSS |

---

## Dark Mode & Logo

The `EmailHeader` swaps between `realest-wordmark-dark.png` (shown by default) and `realest-wordmark-light.png` via `@media (prefers-color-scheme: dark)` CSS in the document `<head>`.

The **dark toggle in the react-email preview** applies `filter: invert()` to the iframe — it does not simulate `prefers-color-scheme`. To see the actual OS dark mode swap, change your system appearance to Dark.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes (Vercel)** | Base URL for logo/image `src` attributes |
| `RESEND_API_KEY` | **Yes** | Resend API authentication |
| `RESEND_FROM_EMAIL` | Optional | Override default `from` address |

---

## Tech Stack

- [`@react-email/components`](https://react.email/docs/components/html) v1.0.8 — layout & primitive components
- [`@react-email/render`](https://react.email/docs/utilities/render) v2.0.4 — HTML/text rendering
- [`react-email`](https://react.email) v5.2.9 — dev server and export CLI
- [Resend](https://resend.com) — email delivery API

See `copilot-instructions/06-email-system.md` for the full architectural reference.
