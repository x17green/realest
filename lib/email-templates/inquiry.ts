import {
  EmailTemplate,
  EmailConfig,
  TemplateContext,
  EmailTemplateFunction,
  InquiryEmailData,
  realestEmailStyles,
} from "./types";
import {
  createBaseEmailHTML,
  createEmailHeader,
  createEmailFooter,
} from "./base-template";

const INQUIRY_CONFIG: EmailConfig = {
  companyName: "RealEST",
  tagline: "Nigeria's Verified Property Marketplace",
  domain: "realest.ng",
  fromEmail: "inquiries@connect.realest.ng",
  supportEmail: "hello@realest.ng",
  unsubscribeUrl: "#",
  websiteUrl: "https://realest.ng",
  logoUrl: "https://realest.ng/realest-logo.svg",
};

const s = realestEmailStyles;

/** SVG icons inlined for email client compatibility */
const ICONS = {
  home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mappin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  message: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  reply: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>',
};

function formatListingType(type: string): string {
  const map: Record<string, string> = {
    for_rent: "For Rent",
    for_sale: "For Sale",
    for_lease: "For Lease",
    short_let: "Short Let",
  };
  return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function row(icon: string, label: string, value: string, valueHref?: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${s.colors.border};vertical-align:top;width:36px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:${s.colors.brandLight};border-radius:6px;color:${s.colors.brandDark};">
          ${icon}
        </span>
      </td>
      <td style="padding:10px 0 10px 12px;border-bottom:1px solid ${s.colors.border};vertical-align:top;">
        <div style="font-size:11px;color:${s.colors.textMuted};text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px;">${label}</div>
        <div style="font-size:15px;color:${s.colors.text};font-weight:500;">
          ${valueHref ? `<a href="${valueHref}" style="color:${s.colors.brandDark};text-decoration:none;">${value}</a>` : value}
        </div>
      </td>
    </tr>`;
}

export const createInquiryTemplate: EmailTemplateFunction<InquiryEmailData> = (
  data: InquiryEmailData,
  _contextOverrides?: Partial<TemplateContext>,
): EmailTemplate => {
  const propertyUrl = `${INQUIRY_CONFIG.websiteUrl}/property/${data.propertyId}`;
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const listingLabel = formatListingType(data.listingType);

  const subject = `New inquiry on: ${data.propertyTitle}`;

  const content = `
    <!-- Header accent bar -->
    <div style="background:linear-gradient(90deg,${s.colors.brandDark} 0%,${s.colors.brandNeutral} 100%);height:4px;"></div>

    <!-- Header -->
    <div style="background:${s.colors.brandDark};padding:32px 32px 28px;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:${s.colors.brandAccent};border-radius:14px;margin-bottom:16px;color:${s.colors.brandDark};">
        ${ICONS.home}
      </div>
      <h1 style="font-family:${s.fonts.heading};color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px;letter-spacing:-0.3px;">
        New Property Inquiry
      </h1>
      <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">${formattedDate}</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;background:#ffffff;">

      <!-- Greeting -->
      <p style="font-size:16px;color:${s.colors.text};margin:0 0 8px;">
        Hi <strong>${data.recipientName}</strong>,
      </p>
      <p style="font-size:15px;color:${s.colors.textMuted};margin:0 0 28px;line-height:1.6;">
        Someone is interested in your property on RealEST. Their details are below — reply directly to this email to get in touch with them.
      </p>

      <!-- Property card -->
      <div style="background:${s.colors.brandLight};border:1px solid ${s.colors.border};border-left:4px solid ${s.colors.brandAccent};border-radius:10px;padding:16px 20px;margin-bottom:28px;">
        <div style="font-size:11px;color:${s.colors.textMuted};text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">Property</div>
        <div style="font-size:17px;font-weight:700;color:${s.colors.brandDark};font-family:${s.fonts.heading};margin-bottom:4px;">
          <a href="${propertyUrl}" style="color:${s.colors.brandDark};text-decoration:none;">${data.propertyTitle}</a>
        </div>
        <div style="font-size:13px;color:${s.colors.textMuted};display:flex;align-items:center;gap:4px;">
          <span style="color:${s.colors.brandDark};">${ICONS.mappin}</span>
          ${data.propertyAddress}
          &nbsp;·&nbsp;
          <span style="background:${s.colors.brandDark};color:${s.colors.brandAccent};font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;letter-spacing:0.3px;">${listingLabel}</span>
        </div>
      </div>

      <!-- Sender details -->
      <h3 style="font-family:${s.fonts.heading};font-size:14px;font-weight:600;color:${s.colors.brandDark};text-transform:uppercase;letter-spacing:0.8px;margin:0 0 4px;">
        Enquirer Details
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        ${row(ICONS.user, "Name", data.senderName)}
        ${row(ICONS.mail, "Email", data.senderEmail, `mailto:${data.senderEmail}`)}
        ${data.senderPhone ? row(ICONS.phone, "Phone", data.senderPhone, `tel:${data.senderPhone}`) : ""}
      </table>

      <!-- Message block -->
      <h3 style="font-family:${s.fonts.heading};font-size:14px;font-weight:600;color:${s.colors.brandDark};text-transform:uppercase;letter-spacing:0.8px;margin:0 0 12px;display:flex;align-items:center;gap:6px;">
        <span style="color:${s.colors.brandDark};">${ICONS.message}</span>
        Message
      </h3>
      <div style="background:${s.colors.brandLight};border:1px solid ${s.colors.border};border-radius:10px;padding:20px 24px;font-size:15px;line-height:1.75;color:${s.colors.text};white-space:pre-wrap;">
        ${data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}
      </div>

      <!-- Reply CTA -->
      <div style="margin-top:28px;padding:20px 24px;background:linear-gradient(135deg,${s.colors.brandDark},${s.colors.brandNeutral});border-radius:12px;text-align:center;">
        <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 14px;">
          ${ICONS.reply} &nbsp;Reply directly to this email to respond to <strong style="color:#fff;">${data.senderName}</strong>
        </p>
        <a href="mailto:${data.senderEmail}?subject=Re: Your inquiry on ${encodeURIComponent(data.propertyTitle)}"
          style="display:inline-block;background:${s.colors.brandAccent};color:${s.colors.brandDark};font-family:${s.fonts.heading};font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:0.3px;">
          Reply to ${data.senderName}
        </a>
      </div>

      <!-- View listing link -->
      <p style="text-align:center;margin-top:20px;font-size:13px;color:${s.colors.textMuted};">
        <a href="${propertyUrl}" style="color:${s.colors.brandDark};text-decoration:underline;">View your property listing on RealEST →</a>
      </p>

    </div>

    <!-- Footer -->
    <div style="background:${s.colors.brandLight};border-top:1px solid ${s.colors.border};padding:24px 32px;text-align:center;">
      <p style="font-size:12px;color:${s.colors.textMuted};margin:0 0 6px;line-height:1.6;">
        This inquiry was submitted via
        <a href="${INQUIRY_CONFIG.websiteUrl}" style="color:${s.colors.brandDark};text-decoration:none;font-weight:600;">RealEST</a>
        — Nigeria's Verified Property Marketplace.
      </p>
      <p style="font-size:11px;color:${s.colors.textMuted};margin:0;">
        &copy; ${now.getFullYear()} RealEST &nbsp;·&nbsp;
        <a href="${INQUIRY_CONFIG.websiteUrl}/privacy" style="color:${s.colors.textMuted};">Privacy</a>
        &nbsp;·&nbsp;
        <a href="${INQUIRY_CONFIG.websiteUrl}/help" style="color:${s.colors.textMuted};">Help</a>
      </p>
    </div>
  `;

  const html = createBaseEmailHTML(content, subject);

  const text = [
    `NEW PROPERTY INQUIRY — RealEST`,
    ``,
    `Hi ${data.recipientName},`,
    ``,
    `You have a new inquiry for: ${data.propertyTitle}`,
    `Address: ${data.propertyAddress}`,
    ``,
    `--- ENQUIRER DETAILS ---`,
    `Name:  ${data.senderName}`,
    `Email: ${data.senderEmail}`,
    data.senderPhone ? `Phone: ${data.senderPhone}` : "",
    ``,
    `--- MESSAGE ---`,
    data.message,
    ``,
    `Reply to this email to respond directly to ${data.senderName}.`,
    `View listing: ${propertyUrl}`,
    ``,
    `— RealEST Team`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return { subject, html, text };
};

export default createInquiryTemplate;
