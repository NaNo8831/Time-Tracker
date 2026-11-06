/**
 * Signed login-cookie tokens. Uses only the Web Crypto API (`crypto.subtle`)
 * so the same code runs in Node (server actions) and the Edge runtime
 * (middleware).
 *
 * Token format: "<expiresAtMs>.<hex HMAC-SHA256 of expiresAtMs>", keyed by
 * the SESSION_SECRET environment variable. Rotating SESSION_SECRET signs
 * everyone out. See docs/OPERATIONS.md.
 */

export const SESSION_COOKIE = "tt_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

function importKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usage);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): ArrayBuffer | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null;
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return buffer;
}

export async function createSessionToken(secret: string, nowMs: number = Date.now()): Promise<string> {
  const expiresAt = String(nowMs + SESSION_MAX_AGE_SECONDS * 1000);
  const key = await importKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(expiresAt));
  return `${expiresAt}.${toHex(signature)}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
  secret: string | null | undefined,
  nowMs: number = Date.now()
): Promise<boolean> {
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expiresAt, signatureHex] = parts;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= nowMs) return false;

  const signature = fromHex(signatureHex);
  if (!signature) return false;

  const key = await importKey(secret, ["verify"]);
  // crypto.subtle.verify compares in constant time.
  return crypto.subtle.verify("HMAC", key, signature, encoder.encode(expiresAt));
}
