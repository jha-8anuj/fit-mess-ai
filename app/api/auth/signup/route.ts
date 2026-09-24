import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, authCookieOptions, createAuthToken } from "@/lib/auth";
import { getUsersCollection, isValidEmail, normalizeEmail } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? normalizeEmail(email) : "";

    if (cleanName.length < 2 || cleanName.length > 60) {
      return Response.json({ message: "Enter a name between 2 and 60 characters." }, { status: 400 });
    }
    if (!isValidEmail(cleanEmail)) {
      return Response.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return Response.json({ message: "Password must be between 8 and 128 characters." }, { status: 400 });
    }

    const id = new ObjectId();
    const user = { id: id.toHexString(), name: cleanName, email: cleanEmail };
    // Validate session configuration before saving an account to the database.
    const token = createAuthToken(user);
    const users = await getUsersCollection();
    const passwordHash = await bcrypt.hash(password, 12);
    await users.insertOne({ _id: id, name: cleanName, email: cleanEmail, passwordHash, createdAt: new Date() });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
    return response;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return Response.json({ message: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Sign-up failed:", error);
    return Response.json({ message: "Unable to create your account. Please try again." }, { status: 500 });
  }
}
