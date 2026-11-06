// Shared table definitions for the user-run scripts (copy, backup). Columns are
// listed by NAME with their Postgres type so data can be moved as exact text
// (no JS date/number conversion), and compared by name rather than by the
// physical column order, which differs between Supabase and Neon.
//
// Tables are listed in foreign-key-safe order (parents before children).

export const TABLES = [
  {
    name: "day_entries",
    columns: [
      ["id", "uuid"],
      ["date", "date"],
      ["break_minutes_override", "integer"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "sessions",
    columns: [
      ["id", "uuid"],
      ["day_entry_id", "uuid"],
      ["check_in", "timestamptz"],
      ["check_out", "timestamptz"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "leave_entries",
    columns: [
      ["id", "uuid"],
      ["date", "date"],
      ["leave_type", "text"],
      ["hours", "numeric"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "holidays",
    columns: [
      ["id", "uuid"],
      ["date", "date"],
      ["label", "text"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "weekly_target_settings",
    columns: [
      ["id", "uuid"],
      ["hours", "numeric"],
      ["effective_date", "date"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "break_duration_settings",
    columns: [
      ["id", "uuid"],
      ["minutes", "numeric"],
      ["effective_date", "date"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "standard_workday_hours_settings",
    columns: [
      ["id", "uuid"],
      ["hours", "numeric"],
      ["effective_date", "date"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "leave_banks",
    columns: [
      ["id", "uuid"],
      ["leave_type", "text"],
      ["total_hours", "numeric"],
      ["effective_date", "date"],
      ["note", "text"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "rolling_balance_seed",
    columns: [
      ["id", "uuid"],
      ["balance", "numeric"],
      ["note", "text"],
      ["created_at", "timestamptz"],
    ],
  },
  {
    name: "physical_year_settings",
    columns: [
      ["id", "uuid"],
      ["start_date", "date"],
      ["end_date", "date"],
      ["note", "text"],
      ["created_at", "timestamptz"],
    ],
  },
];

const q = (name) => `"${name}"`;

/** select every column as text, in a stable order */
export function selectAllSql(table) {
  const cols = table.columns.map(([n]) => `${q(n)}::text as ${q(n)}`).join(", ");
  return `select ${cols} from ${q(table.name)} order by ${q("id")}`;
}

/** row count + md5 checksum over the named columns (independent of physical column order) */
export function checksumSql(table) {
  const expr = table.columns.map(([n]) => `coalesce(${q(n)}::text, '<null>')`).join(` || '|' || `);
  return `select count(*)::int as n, md5(coalesce(string_agg(${expr}, E'\\n' order by ${q("id")}), '')) as h from ${q(table.name)}`;
}

/** parameterized insert that re-casts the text values; skips rows whose id already exists */
export function insertSql(table) {
  const names = table.columns.map(([n]) => q(n)).join(", ");
  const values = table.columns.map(([, type], i) => `$${i + 1}::${type}`).join(", ");
  return `insert into ${q(table.name)} (${names}) values (${values}) on conflict (${q("id")}) do nothing`;
}

/** host only — never print a full connection string (it contains the password) */
export function hostOf(connectionString) {
  try {
    return new URL(connectionString).host;
  } catch {
    return "(unparseable connection string)";
  }
}
