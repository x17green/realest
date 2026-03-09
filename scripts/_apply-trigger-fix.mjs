import { readFileSync } from "fs";
import pg from "pg";

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

const sql = readFileSync("supabase/migrations/20260302000000_fix_notify_owner_trigger.sql", "utf8");
await client.query(sql);
console.log("✅ Trigger function patched — notify_owner_of_status_change now resolves profile_id correctly.");

await client.end();
