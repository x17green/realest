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

const { rows } = await client.query(`
  SELECT pg_get_functiondef(oid) AS def
  FROM pg_proc
  WHERE proname = 'notify_owner_of_status_change'
`);
console.log(rows[0]?.def ?? "Function not found");

await client.end();
