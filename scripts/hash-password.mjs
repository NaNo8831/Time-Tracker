// Creates the values for the single-password login:
//   APP_PASSWORD_HASH  - a scrypt hash of your password (the password itself is never stored)
//   SESSION_SECRET     - a fresh random key used to sign the login cookie
//
// Usage:  npm run db:hash-password
// The password is typed at a hidden prompt (it is NOT taken as a command-line
// argument, so it does not end up in your shell history). If stdin is piped
// instead of a terminal, the first line is used (this is how the tests run it).
//
// Format: "scrypt:<N>:<saltHex>:<hashHex>" — colons, not "$", because Next.js
// expands "$VARIABLE" patterns when it loads .env.local.

import { randomBytes, scrypt } from "node:crypto";

const COST = 16384;
const KEY_LENGTH = 64;

function derive(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: COST, r: 8, p: 1, maxmem: 256 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key))
    );
  });
}

async function readHidden(prompt) {
  process.stderr.write(prompt);
  return new Promise((resolve) => {
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", function onData(char) {
      for (const c of char) {
        if (c === "\u0003") {
          process.stderr.write("\n");
          process.exit(130); // Ctrl+C
        } else if (c === "\r" || c === "\n") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onData);
          process.stderr.write("\n");
          resolve(value);
          return;
        } else if (c === "\u007f" || c === "\b") {
          value = value.slice(0, -1);
        } else {
          value += c;
        }
      }
    });
  });
}

async function readPipedLine() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data.split(/\r?\n/)[0] ?? "";
}

const password = process.stdin.isTTY
  ? await readHidden("New password (hidden): ")
  : await readPipedLine();

if (!password) {
  console.error("No password entered.");
  process.exit(1);
}
if (process.stdin.isTTY) {
  const again = await readHidden("Type it again: ");
  if (again !== password) {
    console.error("The two entries did not match. Nothing was created.");
    process.exit(1);
  }
}

const salt = randomBytes(16);
const hash = await derive(password, salt);

console.log(`APP_PASSWORD_HASH="scrypt:${COST}:${salt.toString("hex")}:${hash.toString("hex")}"`);
console.log(`SESSION_SECRET="${randomBytes(32).toString("hex")}"`);
console.error(
  "\nThese two lines are secrets. Put them in .env.local and in Vercel's environment variables.\n" +
    "Do not commit them or paste them anywhere public."
);
