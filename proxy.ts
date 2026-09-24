import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, authCookieOptions, verifyAuthToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const isPublicPage = pathname === "/login" || pathname === "/signup";
  const isPublicAuthEndpoint =
    pathname === "/api/auth/login" || pathname === "/api/auth/signup";
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = verifyAuthToken(token);
  let response: NextResponse;

  if (isPublicAuthEndpoint) {
    response = NextResponse.next();
  } else if (isPublicPage) {
    response = user
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  } else if (!user) {
    response = pathname === "/api" || pathname.startsWith("/api/")
      ? NextResponse.json({ message: "Please log in to continue." }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
  } else {
    response = NextResponse.next();
  }

  // Don't allow shared/browser caches to reuse protected responses or redirects.
  response.headers.set("Cache-Control", "private, no-store");
  if (token && !user && !isPublicAuthEndpoint) {
    response.cookies.set(AUTH_COOKIE_NAME, "", { ...authCookieOptions, maxAge: 0 });
  }
  return response;
}

export const config = {
  // Protect all pages and APIs by default, including RSC/prefetch requests.
  // Only framework assets and the public login branding bypass this gate.
  matcher: [
    "/((?!_next/static(?:/|$)|_next/image(?:/|$)|favicon\\.ico$|fit-mess%20logo\\.jpeg$|fit-mess logo\\.jpeg$).*)",
  ],
};
