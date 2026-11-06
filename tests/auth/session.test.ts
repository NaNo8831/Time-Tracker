import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";

const SECRET = "test-secret-do-not-use-in-production";
const NOW = Date.UTC(2026, 10, 6, 12, 0, 0);

describe("session tokens", () => {
  it("verifies a freshly created token", async () => {
    const token = await createSessionToken(SECRET, NOW);
    expect(await verifySessionToken(token, SECRET, NOW + 1000)).toBe(true);
  });

  it("stays valid up to the 30-day expiry and not after", async () => {
    const token = await createSessionToken(SECRET, NOW);
    const expiry = NOW + SESSION_MAX_AGE_SECONDS * 1000;
    expect(await verifySessionToken(token, SECRET, expiry - 1)).toBe(true);
    expect(await verifySessionToken(token, SECRET, expiry)).toBe(false);
    expect(await verifySessionToken(token, SECRET, expiry + 86400000)).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("some-other-secret", NOW);
    expect(await verifySessionToken(token, SECRET, NOW + 1000)).toBe(false);
  });

  it("rejects a tampered signature", async () => {
    const token = await createSessionToken(SECRET, NOW);
    const [expiresAt, signature] = token.split(".");
    const flipped = (signature[0] === "a" ? "b" : "a") + signature.slice(1);
    expect(await verifySessionToken(`${expiresAt}.${flipped}`, SECRET, NOW + 1000)).toBe(false);
  });

  it("rejects a token whose expiry was extended (signature no longer matches)", async () => {
    const token = await createSessionToken(SECRET, NOW);
    const [expiresAt, signature] = token.split(".");
    const extended = String(Number(expiresAt) + 365 * 86400000);
    expect(await verifySessionToken(`${extended}.${signature}`, SECRET, NOW + 1000)).toBe(false);
  });

  it("rejects missing, empty, and malformed tokens or a missing secret", async () => {
    const token = await createSessionToken(SECRET, NOW);
    for (const bad of [undefined, null, "", "garbage", "123.", ".abc", "1.2.3", "abc.def", `${token}.extra`]) {
      expect(await verifySessionToken(bad, SECRET, NOW + 1000)).toBe(false);
    }
    expect(await verifySessionToken(token, undefined, NOW + 1000)).toBe(false);
    expect(await verifySessionToken(token, "", NOW + 1000)).toBe(false);
  });
});
