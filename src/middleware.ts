import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  // Checks the signed login cookie only — no network call. Password checking
  // happens in the sign-in server action (Node runtime), not here.
  const isSignedIn = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    process.env.SESSION_SECRET
  );

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!isSignedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isSignedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
