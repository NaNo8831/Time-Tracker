// One-time copy of all Time Tracker data from Supabase to Neon, with a parity check.
//
//   npm run db:migrate                         -> DRY RUN: counts only, writes nothing
//   npm run db:migrate -- --apply              -> copy (skips rows whose id already exists)
//   CONFIRM_RESET=yes npm run db:migrate -- --apply --reset-target
//                                              -> empty the NEON tables first, then copy
//
// Needs two connection strings in .env.local:
//   SUPABASE_DB_URL  Supabase's Postgres connection string (use the "Session pooler"
//                    string if your network has no IPv6)
//   DATABASE_URL     Neon's pooled connection string
//
// It only ever READS from Supabase. --reset-target only ever empties the Neon
// tables (inside one transaction, so a failure leaves Neon unchanged). It never
// prints a connection string, only the host names. Data is moved as exact text,
// ids and created_at are preserved, and after copying it compares row counts
// and checksums for every table; it exits with an error if any table differs.

import pg from "pg";
import { TABLES, checksumSql, hostOf, insertSql, selectAllSql } from "./lib/tables.mjs";

const KNOWN_FLAGS = new Set(["--apply", "--reset-target"]);
const flags = process.argv.slice(2);
const unknown = flags.filter((f) => !KNOWN_FLAGS.has(f));
if (unknown.length > 0) {
  console.error(`Unknown option(s): ${unknown.join(", ")}. Valid: --apply, --reset-target`);
  process.exit(1);
}
const apply = flags.includes("--apply");
const resetTarget = flags.includes("--reset-target");
if (resetTarget && !apply) {
  console.error("--reset-target only makes sense together with --apply.");
  process.exit(1);
}

const sourceUrl = process.env.SUPABASE_DB_URL;
const targetUrl = process.env.DATABASE_URL;
if (!sourceUrl || !targetUrl) {
  console.error(
    "Missing SUPABASE_DB_URL and/or DATABASE_URL in .env.local (run with: npm run db:migrate)."
  );
  process.exit(1);
}

const connect = async (connectionString) => {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query("set time zone 'UTC'");
  return client;
};

async function summarize(client, label) {
  const result = new Map();
  for (const table of TABLES) {
    try {
      const { rows } = await client.query(checksumSql(table));
      result.set(table.name, { n: rows[0].n, h: rows[0].h });
    } catch (error) {
      result.set(table.name, { error: error.message });
    }
  }
  return result;
}

function printComparison(source, target) {
  console.log("\ntable".padEnd(36) + "source rows".padEnd(14) + "target rows".padEnd(14) + "match");
  let allMatch = true;
  for (const table of TABLES) {
    const s = source.get(table.name);
    const t = target.get(table.name);
    let status;
    if (s.error || t.error) {
      status = `ERROR ${s.error ? "(source) " + s.error : ""}${t.error ? "(target) " + t.error : ""}`;
      allMatch = false;
    } else if (s.n === t.n && s.h === t.h) {
      status = "yes";
    } else {
      status = s.n !== t.n ? "NO (row counts differ)" : "NO (contents differ)";
      allMatch = false;
    }
    console.log(
      table.name.padEnd(36) + String(s.n ?? "-").padEnd(14) + String(t.n ?? "-").padEnd(14) + status
    );
  }
  return allMatch;
}

const source = await connect(sourceUrl);
const target = await connect(targetUrl);

try {
  console.log(`Source (Supabase): ${hostOf(sourceUrl)}`);
  console.log(`Target (Neon):     ${hostOf(targetUrl)}`);

  const before = printComparison(await summarize(source), await summarize(target));

  if (!apply) {
    console.log(
      `\nDRY RUN — nothing was written. ${before ? "The databases already match." : "The databases differ."}` +
        "\nRe-run with --apply to copy (and --reset-target to empty Neon first)."
    );
    process.exit(0);
  }

  if (resetTarget && process.env.CONFIRM_RESET !== "yes") {
    console.error(
      `\nRefusing to empty the NEON tables on ${hostOf(targetUrl)}: set CONFIRM_RESET=yes to confirm.`
    );
    process.exit(1);
  }

  await target.query("begin");
  try {
    if (resetTarget) {
      console.log(`\nEmptying the Neon tables on ${hostOf(targetUrl)} (Supabase is not touched)...`);
      for (const table of [...TABLES].reverse()) {
        await target.query(`delete from "${table.name}"`);
      }
    }

    for (const table of TABLES) {
      const { rows } = await source.query(selectAllSql(table));
      const insert = insertSql(table);
      for (const row of rows) {
        await target.query(
          insert,
          table.columns.map(([name]) => row[name])
        );
      }
      console.log(`copied ${String(rows.length).padStart(4)} rows  ${table.name}`);
    }
    await target.query("commit");
  } catch (error) {
    await target.query("rollback");
    console.error(`\nCopy failed; the Neon changes were rolled back. ${error.message}`);
    process.exit(1);
  }

  console.log("\nVerifying (row count + checksum per table)...");
  const ok = printComparison(await summarize(source), await summarize(target));
  if (!ok) {
    console.error("\nPARITY CHECK FAILED — do not cut over. Investigate the tables marked above.");
    process.exit(1);
  }
  console.log("\nAll tables match exactly. Safe to proceed with the cutover steps in docs/OPERATIONS.md.");
} finally {
  await source.end();
  await target.end();
}
