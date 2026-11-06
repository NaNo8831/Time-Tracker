/**
 * Pure helpers that turn raw database values into the exact shapes the app
 * has always received (they match what Supabase's PostgREST returned):
 *  - dates       -> 'YYYY-MM-DD'
 *  - timestamps  -> 'YYYY-MM-DDTHH:MM:SS+00:00' (UTC; characters 11-16 are HH:MM)
 *  - numerics    -> JS numbers
 *
 * The SQL in src/lib/data/* already casts columns to deterministic text
 * (`date::text`, `(ts at time zone 'UTC')::text`, `numeric::float8`), so the
 * driver never applies its own date/numeric parsing; these functions then
 * only reshape those values. They also accept Date objects and numeric
 * strings defensively.
 */

export function toDateText(value: unknown): string {
  if (typeof value === "string") {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
    if (match) return match[1];
  } else if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  throw new Error(`Unexpected date value: ${String(value)}`);
}

export function toTimestampText(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().replace(/\.\d+Z$/, "+00:00").replace(/Z$/, "+00:00");
  }
  if (typeof value === "string") {
    // e.g. '2026-01-10 07:00:00', '2026-01-10 07:00:00+00', '2026-01-10T07:00:00Z'
    const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2}(?:\.\d+)?)(Z|[+-]\d{2}(?::?\d{2})?)?$/.exec(
      value.trim()
    );
    if (match) {
      const [, day, time, offset] = match;
      if (!offset || offset === "Z" || /^[+-]00(?::?00)?$/.test(offset)) {
        return `${day}T${time}+00:00`;
      }
    }
  }
  throw new Error(`Unexpected UTC timestamp value: ${String(value)}`);
}

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (Number.isNaN(n)) throw new Error(`Unexpected numeric value: ${String(value)}`);
  return n;
}

export function toNullableNumber(value: unknown): number | null {
  return value === null || value === undefined ? null : toNumber(value);
}
