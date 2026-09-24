import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  // Next.js may use an internal hostname in request.url. Match the browser's
  // Origin against the original Host header instead.
  const host = request.headers.get("host");
  if (origin && origin !== `https://${host}` && origin !== `http://${host}`) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...authCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
