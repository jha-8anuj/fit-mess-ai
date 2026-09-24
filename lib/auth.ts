import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "fitmess_token";
const TOKEN_DURATION_SECONDS = 60 * 60 * 24 * 7;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export function createAuthToken(user: AuthUser) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET. Add it to your .env.local file.");
  }

  return jwt.sign(user, secret, {
    algorithm: "HS256",
    expiresIn: TOKEN_DURATION_SECONDS,
  });
}

// A cookie's presence is not proof of login: verify its signature and expiry.
export function verifyAuthToken(token: string | undefined): AuthUser | null {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;

  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });

    if (
      typeof payload === "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.id !== "string" ||
      !/^[a-f\d]{24}$/i.test(payload.id) ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return { id: payload.id, name: payload.name, email: payload.email };
  } catch {
    // Invalid signatures, expired tokens and malformed tokens all fail closed.
    return null;
  }
}

export const authCookieOptions = {
  httpOnly: true,
  maxAge: TOKEN_DURATION_SECONDS,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
