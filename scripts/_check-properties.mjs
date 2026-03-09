import { readFileSync } from "fs";
import pg from "pg";

// Load .env.local manually
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

const client = new pg.Client({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
await client.connect();

// Fix constraint and rename active → live
// First find the trigger name on properties
const { rows: triggers } = await client.query(`
  SELECT trigger_name FROM information_schema.triggers
  WHERE event_object_table = 'properties' AND event_object_schema = 'public'
`);
console.log("Triggers on properties:", triggers.map(t => t.trigger_name));

// Disable only the application trigger (not system FK triggers which require superuser)
await client.query(`ALTER TABLE public.properties DISABLE TRIGGER trigger_notify_owner_of_status_change`);
await client.query(`ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check`);
await client.query(`UPDATE public.properties SET status = 'live' WHERE status = 'active'`);
await client.query(`
  ALTER TABLE public.properties
    ADD CONSTRAINT properties_status_check
    CHECK (status = ANY (ARRAY[
      'live'::text, 'draft'::text, 'pending_ml_validation'::text,
      'sold'::text, 'rented'::text, 'inactive'::text
    ]))
`);
await client.query(`ALTER TABLE public.properties ENABLE TRIGGER trigger_notify_owner_of_status_change`);
console.log("✅ Constraint updated and active → live rename applied.\n");

// Summary
const { rows: breakdown } = await client.query(`
  SELECT status, listing_source, verification_status, COUNT(*)::int AS count
  FROM properties
  GROUP BY status, listing_source, verification_status
  ORDER BY status, listing_source, verification_status
`);
const total = breakdown.reduce((s, r) => s + r.count, 0);
console.log("Properties breakdown:");
console.table(breakdown);
console.log("Total:", total);

await client.end();
