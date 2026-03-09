import { readFileSync } from "fs";
import pg from "pg";
import { Resend } from "resend";

try {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] ??= val;
  }
} catch {}

// 1. Confirm what email the property owner has
const client = new pg.Client({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(`
  SELECT p.email, p.full_name
  FROM profiles p
  JOIN owners o ON o.profile_id = p.id
  JOIN properties pr ON pr.owner_id = o.id
  WHERE pr.id = 'c0551647-9625-4780-93ba-0d79eff31a5b'
`);
await client.end();

console.log("Property owner profile:", rows[0] ?? "NOT FOUND");

// 2. Send a test email directly via Resend to verify the key + domain work
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL ?? "noreply@realest.ng";

if (!process.env.RESEND_API_KEY) {
  console.log("❌ RESEND_API_KEY not set — emails will not send.");
} else {
  console.log(`\nSending test via Resend from: ${FROM}`);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [rows[0]?.email ?? "dev@example.com"],
    replyTo: "testguest@example.com",
    subject: "[RealEST Test] Guest Inquiry Delivery Check",
    html: "<p>This is a delivery test from the inquiry system.</p>",
    text: "This is a delivery test from the inquiry system.",
  });

  if (error) {
    console.error("❌ Resend error:", error);
  } else {
    console.log("✅ Resend accepted email. Message ID:", data?.id);
    console.log("   → Email will arrive at:", rows[0]?.email);
  }
}
