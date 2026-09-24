import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, authCookieOptions, createAuthToken } from "@/lib/auth";
import { getUsersCollection, isValidEmail, normalizeEmail } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = typeof email === "string" ? normalizeEmail(email) : "";

    if (!isValidEmail(cleanEmail) || typeof password !== "string") {
      return Response.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const user = await (await getUsersCollection()).findOne({ email: cleanEmail });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return Response.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const safeUser = { id: user._id.toString(), name: user.name, email: user.email };
    const response = NextResponse.json({ user: safeUser });
    response.cookies.set(AUTH_COOKIE_NAME, createAuthToken(safeUser), authCookieOptions);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return Response.json({ message: "Unable to log in. Please try again." }, { status: 500 });
  }
}
