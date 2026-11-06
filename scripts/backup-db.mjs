// Full export of every Time Tracker table from Neon to a restorable .sql file.
//
//   npm run db:backup
//
// Writes backups/time-tracker-YYYY-MM-DD.sql (the backups/ folder is gitignored).
// The file is plain SQL "insert ... on conflict (id) do nothing" statements in
// foreign-key-safe order, so restoring is: create an empty Neon database, run
// neon/schema.sql, then run this file (Neon SQL editor or psql). See
// docs/OPERATIONS.md. A backup is only trusted once you have restored it into
// a scratch database at least once.
//
// Needs DATABASE_URL in .env.local. Read-only; never prints the connection string.

import { mkdirSync, writeFileSync } from "node:fs";
import pg from "pg";
import { TABLES, hostOf, selectAllSql } from "./lib/tables.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL in .env.local (run with: npm run db:backup).");
  process.exit(1);
}

const literal = (value, type) =>
  value === null ? "NULL" : `'${String(value).replace(/'/g, "''")}'::${type}`;

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  await client.query("set time zone 'UTC'");

  const today = new Date();
  const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const body = [];
  const counts = [];
  for (const table of TABLES) {
    const { rows } = await client.query(selectAllSql(table));
    counts.push([table.name, rows.length]);
    const names = table.columns.map(([n]) => `"${n}"`).join(", ");
    for (const row of rows) {
      const values = table.columns.map(([name, type]) => literal(row[name], type)).join(", ");
      body.push(`insert into "${table.name}" (${names}) values (${values}) on conflict ("id") do nothing;`);
    }
  }

  const header = [
    "-- Time Tracker backup",
    `-- Exported ${new Date().toISOString()} from ${hostOf(url)}`,
    `-- Rows: ${counts.map(([n, c]) => `${n}=${c}`).join(", ")}`,
    "-- Restore: empty Neon database -> run neon/schema.sql -> run this file.",
    "set time zone 'UTC';",
    "begin;",
  ];
  mkdirSync("backups", { recursive: true });
  const file = `backups/time-tracker-${stamp}.sql`;
  writeFileSync(file, [...header, ...body, "commit;", ""].join("\n"), "utf8");

  console.log(`Backup written to ${file}\n`);
  for (const [name, count] of counts) console.log(`${name.padEnd(34)} ${count}`);
} finally {
  await client.end();
}
