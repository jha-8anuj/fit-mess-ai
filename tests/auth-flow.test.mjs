// Integration check against the running development server and configured DB.
// Creates one unique test account, then removes only that account in finally.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { test } from "node:test";
import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "../lib/auth.ts";

nextEnv.loadEnvConfig(process.cwd(), true);

test("signup persists a bcrypt hash, login sets a verified session, and invalid credentials are rejected", async () => {
  assert.ok(process.env.MONGODB_URI, "Configure .env.local before running this test.");
  assert.ok(process.env.JWT_SECRET, "JWT_SECRET is required for the integration test.");
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const email = `auth-check-${randomUUID()}@example.test`;
  const password = randomBytes(24).toString("base64url");
  const name = "Temporary Auth Check";
  let users;

  async function request(path, options = {}) {
    return fetch(`http://localhost:3000${path}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
      ...options,
    });
  }

  function credentials(body) {
    return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
  }

  try {
    await client.connect();
    users = client.db(process.env.MONGODB_DB || "fitmess-ai").collection("users");
    assert.equal(await users.countDocuments({ email }), 0);

    const signup = await request("/api/auth/signup", credentials({ name, email, password }));
    assert.equal(signup.status, 201, "signup must create the account");
    const result = await signup.json();
    assert.ok(result.user?.id);
    assert.equal(result.user.passwordHash, undefined);
    assert.match(signup.headers.get("set-cookie"), /HttpOnly/i);

    const stored = await users.findOne({ email });
    assert.ok(stored);
    assert.equal(stored._id.toString(), result.user.id);
    assert.equal(stored.password, undefined);
    assert.ok(stored.passwordHash !== password);
    assert.equal(await bcrypt.compare(password, stored.passwordHash), true);

    const duplicate = await request("/api/auth/signup", credentials({ name, email, password }));
    assert.equal(duplicate.status, 409);
    const invalid = await request("/api/auth/login", credentials({ email, password: `${password}-wrong` }));
    assert.equal(invalid.status, 401);
    assert.equal(invalid.headers.get("set-cookie"), null);

    const login = await request("/api/auth/login", credentials({ email: email.toUpperCase(), password }));
    assert.equal(login.status, 200, "login must accept the saved bcrypt password");
    const sessionCookie = login.headers.getSetCookie().find((value) => value.startsWith(`${AUTH_COOKIE_NAME}=`));
    assert.ok(sessionCookie);
    assert.match(sessionCookie, /HttpOnly/i);
    const cookieHeader = sessionCookie.split(";")[0];
    const token = cookieHeader.slice(AUTH_COOKIE_NAME.length + 1);
    assert.ok(verifyAuthToken(token)?.id === result.user.id);
    const dashboard = await request("/dashboard", { headers: { Cookie: cookieHeader } });
    assert.equal(dashboard.status, 200);
    const anonymous = await request("/dashboard");
    assert.equal(anonymous.status, 307);

    const loginPage = await request("/login");
    const html = await loginPage.text();
    assert.equal(html.includes("OR CONTINUE WITH"), false);
    assert.doesNotMatch(html, />\s*Google\s*</);
  } finally {
    try {
      if (users) {
        const temporaryUser = await users.findOne({ email, name }, { projection: { _id: 1 } });
        if (temporaryUser) {
          const removed = await users.deleteOne({ _id: temporaryUser._id, email, name });
          assert.equal(removed.deletedCount, 1);
        }
      }
    } finally {
      await client.close();
    }
  }
}, { timeout: 90000 });
