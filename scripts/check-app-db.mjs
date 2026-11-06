// Read-only diagnostic: reads the database the same way the running app does
// (Next's env loading + the Neon HTTP driver). Prints the host and row counts
// only — never the connection string. Usage: npm run db:check
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";

nextEnv.loadEnvConfig(process.cwd(), true);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set after loading .env.local the way Next does.");
  process.exit(1);
}
let host = "(unparseable)";
try {
  host = new URL(url.trim()).host;
} catch {}
console.log("App would connect to:", host);

const sql = neon(url);
for (const table of ["day_entries", "sessions", "weekly_target_settings", "holidays"]) {
  try {
    const rows = await sql.query(`select count(*)::int as n from ${table}`);
    console.log(table.padEnd(26), rows[0].n);
  } catch (e) {
    console.log(table.padEnd(26), "ERROR:", e.code ?? "", String(e.message).slice(0, 120));
  }
}
