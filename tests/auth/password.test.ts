import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { verifyPassword } from "@/lib/auth/password";

// Runs the real helper script exactly as a user would (password piped on stdin
// instead of typed at the hidden prompt) and returns its two output values.
function runHashScript(password: string) {
  const script = path.resolve(process.cwd(), "scripts", "hash-password.mjs");
  const stdout = execFileSync(process.execPath, [script], {
    input: `${password}\n`,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "ignore"],
  });
  const hash = /^APP_PASSWORD_HASH="([^"]+)"$/m.exec(stdout)?.[1];
  const secret = /^SESSION_SECRET="([^"]+)"$/m.exec(stdout)?.[1];
  return { hash, secret };
}

describe("password verification", () => {
  const { hash, secret } = runHashScript("correct horse battery staple");

  it("the helper script produces a well-formed hash and a random session secret", () => {
    expect(hash).toMatch(/^scrypt:\d+:[0-9a-f]+:[0-9a-f]+$/);
    expect(hash).not.toContain("$"); // '$' would be mangled by Next.js env expansion
    expect(secret).toMatch(/^[0-9a-f]{64}$/);
  });

  it("accepts the right password (round trip through the real script)", async () => {
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    expect(await verifyPassword("wrong password", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
    expect(await verifyPassword("Correct horse battery staple", hash)).toBe(false);
  });

  it("the same password hashes differently each time (random salt) yet both verify", async () => {
    const other = runHashScript("correct horse battery staple");
    expect(other.hash).not.toBe(hash);
    expect(await verifyPassword("correct horse battery staple", other.hash)).toBe(true);
  });

  it("fails safely (false, no throw) for a missing or malformed stored hash", async () => {
    const malformed = [
      undefined,
      null,
      "",
      "not-a-hash",
      "scrypt:16384:abc",
      "scrypt:16384:zz:zz",
      "scrypt:notanumber:aa:bb",
      "scrypt:3:aa:bb", // cost too low / not a power of two
      "scrypt:999999999:aa:bb", // cost far too high
      "bcrypt:16384:aa:bb",
      "scrypt$16384$aa$bb",
    ];
    for (const stored of malformed) {
      expect(await verifyPassword("anything", stored)).toBe(false);
    }
  });
});
