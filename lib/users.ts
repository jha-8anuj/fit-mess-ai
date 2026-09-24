import type { Collection } from "mongodb";

import { getDatabase } from "@/lib/mongodb";

export type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const users = (await getDatabase()).collection<UserDocument>("users");
  await users.createIndex({ email: 1 }, { unique: true });
  return users;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}
