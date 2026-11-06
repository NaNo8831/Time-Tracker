"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "./password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./session";

function loginError(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const storedHash = process.env.APP_PASSWORD_HASH;
  const secret = process.env.SESSION_SECRET;

  if (!storedHash || !secret) {
    loginError("Login is not configured on the server.");
  }

  const ok = await verifyPassword(password, storedHash);
  if (!ok) {
    // A short pause makes password guessing slower.
    await new Promise((resolve) => setTimeout(resolve, 800));
    loginError("Incorrect password.");
  }

  const token = await createSessionToken(secret);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/");
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}
