import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

export async function getSessionUser() {
  const cookieStore = await cookies();
  return verifyAuthToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

// Call from server pages before rendering any protected content.
export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
