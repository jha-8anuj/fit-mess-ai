import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, test } from "node:test";
import jwt from "jsonwebtoken";

import { createAuthToken, verifyAuthToken } from "../lib/auth.ts";

const previousSecret = process.env.JWT_SECRET;
const secret = randomBytes(32).toString("hex");
process.env.JWT_SECRET = secret;
const user = { id: "507f1f77bcf86cd799439011", name: "Test User", email: "test@example.test" };

after(() => {
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

test("accepts the session issued by signup/login", () => {
  assert.deepEqual(verifyAuthToken(createAuthToken(user)), user);
});

test("rejects missing, malformed, forged, expired and unsigned sessions", () => {
  const invalidTokens = [
    undefined,
    "",
    "fake-cookie",
    jwt.sign(user, "wrong-secret", { expiresIn: "1h" }),
    jwt.sign(user, secret, { expiresIn: -1 }),
    jwt.sign(user, "", { algorithm: "none", expiresIn: "1h" }),
    jwt.sign(user, secret, { algorithm: "HS384", expiresIn: "1h" }),
    jwt.sign(user, secret), // Signed, but has no expiration.
    jwt.sign({ ...user, id: "" }, secret, { expiresIn: "1h" }),
    jwt.sign({ ...user, email: null }, secret, { expiresIn: "1h" }),
    jwt.sign(user, secret, { notBefore: "1h", expiresIn: "2h" }),
  ];
  for (const token of invalidTokens) assert.equal(verifyAuthToken(token), null);
});

test("rejects changes to a valid token's payload", () => {
  const parts = createAuthToken(user).split(".");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  parts[1] = Buffer.from(JSON.stringify({ ...payload, name: "Someone else" })).toString("base64url");
  assert.equal(verifyAuthToken(parts.join(".")), null);
});

test("fails closed when the server secret is missing", () => {
  const token = createAuthToken(user);
  delete process.env.JWT_SECRET;
  try {
    assert.equal(verifyAuthToken(token), null);
    assert.throws(() => createAuthToken(user), /Missing JWT_SECRET/);
  } finally {
    process.env.JWT_SECRET = secret;
  }
});
