import { scrypt, timingSafeEqual } from "node:crypto";

/**
 * Verifies the login password against APP_PASSWORD_HASH. Node runtime only
 * (server actions) — the Edge middleware never touches the password, it only
 * checks the signed cookie (see session.ts).
 *
 * Stored format: "scrypt:<N>:<saltHex>:<hashHex>". Colons (not "$") are used
 * on purpose: Next.js expands "$VARIABLE" patterns when it loads .env.local,
 * which would corrupt a "$"-separated value. Create one with
 * `npm run db:hash-password` (scripts/hash-password.mjs).
 */

const KEY_LENGTH = 64;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const MIN_COST = 1024;
const MAX_COST = 131072;

function derive(password: string, salt: Buffer, cost: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: cost, r: BLOCK_SIZE, p: PARALLELISM, maxmem: 256 * 1024 * 1024 },
      (error, derivedKey) => (error ? reject(error) : resolve(derivedKey))
    );
  });
}

/** Never throws: a missing or malformed stored hash simply fails verification. */
export async function verifyPassword(
  password: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored) return false;

  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const [, costText, saltHex, hashHex] = parts;

  const cost = Number(costText);
  const validCost = Number.isInteger(cost) && cost >= MIN_COST && cost <= MAX_COST && (cost & (cost - 1)) === 0;
  const hexOk = (s: string) => s.length > 0 && s.length % 2 === 0 && /^[0-9a-f]+$/i.test(s);
  if (!validCost || !hexOk(saltHex) || !hexOk(hashHex)) return false;

  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = await derive(password, Buffer.from(saltHex, "hex"), cost);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
