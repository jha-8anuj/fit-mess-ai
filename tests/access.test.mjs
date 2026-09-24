// Run after npm run build. Tests use an isolated server and no database writes.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:net";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";

import { AUTH_COOKIE_NAME, createAuthToken } from "../lib/auth.ts";

const secret = randomBytes(32).toString("hex");
process.env.JWT_SECRET = secret;
const user = { id: "507f1f77bcf86cd799439011", name: "Access Test", email: "access@example.test" };
let server;
let origin;

before(async () => {
  const portFinder = createServer();
  portFinder.listen(0, "127.0.0.1");
  await once(portFinder, "listening");
  const port = portFinder.address().port;
  await new Promise((resolve) => portFinder.close(resolve));
  origin = `http://127.0.0.1:${port}`;

  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, NODE_ENV: "production", JWT_SECRET: secret, MONGODB_URI: "" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error(`Test server did not start: ${output}`)), 30000);
    function collect(chunk) {
      output += chunk.toString();
      if (/Ready in/.test(output)) {
        clearTimeout(timer);
        resolve();
      }
    }
    server.stdout.on("data", collect);
    server.stderr.on("data", collect);
    server.once("error", (error) => { clearTimeout(timer); reject(error); });
    server.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Test server exited (${code}): ${output}`)); });
  });
}, { timeout: 35000 });

after(async () => {
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
});

function request(path, options = {}) {
  return fetch(`${origin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(15000), ...options });
}

function cookie(token) {
  return { Cookie: `${AUTH_COOKIE_NAME}=${token}` };
}

function expectLogin(response) {
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), origin).pathname, "/login");
  assert.match(response.headers.get("cache-control"), /no-store/);
}

test("every app page and new path is protected by default", async () => {
  for (const path of ["/", "/dashboard", "/Routine", "/workouts", "/profile", "/login/private", "/private/report.csv"]) {
    expectLogin(await request(path));
  }
});

test("private APIs return JSON 401, including new endpoints and dotted URLs", async () => {
  for (const path of ["/api/health/database", "/api/wellness?date=2026-09-24", "/api/private", "/api/private.json", "/api/auth/login/private"]) {
    const response = await request(path);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Please log in to continue." });
  }
});

test("login, signup and required assets stay public", async () => {
  const login = await request("/login");
  assert.equal(login.status, 200);
  const html = await login.text();
  assert.match(html, /href="\/signup"/);
  const asset = html.match(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/);
  assert.ok(asset, "login HTML must contain a framework asset");
  assert.equal((await request(asset[1].replaceAll("&amp;", "&"))).status, 200);
  assert.equal((await request("/signup")).status, 200);
  assert.equal((await request("/fit-mess%20logo.jpeg")).status, 200);
  assert.equal((await request("/favicon.ico")).status, 200);
});

test("public auth endpoints reach validation without exposing other APIs", async () => {
  const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "invalid", password: "", name: "" }) };
  const login = await request("/api/auth/login", options);
  assert.equal(login.status, 401);
  assert.equal((await login.json()).message, "Invalid email or password.");
  const signup = await request("/api/auth/signup", options);
  assert.equal(signup.status, 400);
  assert.equal((await signup.json()).message, "Enter a name between 2 and 60 characters.");
});

test("fake, expired and incorrectly signed cookies cannot open pages or APIs", async () => {
  for (const token of ["fake", jwt.sign(user, secret, { expiresIn: -1 }), jwt.sign(user, "wrong-secret", { expiresIn: "1h" })]) {
    const response = await request("/dashboard", { headers: cookie(token) });
    expectLogin(response);
    assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
    assert.equal((await request("/api/health/database", { headers: cookie(token) })).status, 401);
  }
});

test("RSC, prefetch, HEAD, POST and spoofed middleware headers do not bypass login", async () => {
  for (const options of [
    { headers: { RSC: "1" } },
    { headers: { RSC: "1", "Next-Router-Prefetch": "1", Purpose: "prefetch" } },
    { headers: { "x-middleware-subrequest": "proxy:proxy:proxy:proxy:proxy" } },
    { method: "HEAD" },
    { method: "POST" },
  ]) {
    expectLogin(await request("/dashboard", options));
  }
});

test("a verified session can render all protected pages", async () => {
  const headers = cookie(createAuthToken(user));
  for (const path of ["/dashboard", "/Routine", "/workouts"]) {
    const response = await request(path, { headers });
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("cache-control"), /no-store/);
  }
  for (const path of ["/", "/login", "/signup"]) {
    const response = await request(path, { headers });
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location"), origin).pathname, "/dashboard");
  }
  // A subsequent request without the cookie cannot reuse the authenticated page.
  expectLogin(await request("/dashboard"));
});

test("dashboard renders a collapsed profile disclosure with the signed-in user", async () => {
  const response = await request("/dashboard", { headers: cookie(createAuthToken(user)) });
  const html = await response.text();
  assert.match(html, /aria-label="Profile menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.ok(html.includes(user.name));
  assert.ok(html.includes(user.email));
  assert.match(html, />Logout<\/button>/);
});

test("logout expires the session cookie and cleared-cookie requests cannot access protected routes", async () => {
  const headers = cookie(createAuthToken(user));
  assert.equal((await request("/api/auth/logout", { headers })).status, 405);

  const crossOrigin = await request("/api/auth/logout", {
    method: "POST",
    headers: { ...headers, Origin: "https://other.example" },
  });
  assert.equal(crossOrigin.status, 403);
  assert.equal(crossOrigin.headers.get("set-cookie"), null);

  const logout = await request("/api/auth/logout", { method: "POST", headers: { ...headers, Origin: origin } });
  assert.equal(logout.status, 200);
  assert.deepEqual(await logout.json(), { success: true });
  const deletedCookie = logout.headers.getSetCookie().find((value) => value.startsWith(`${AUTH_COOKIE_NAME}=`));
  assert.ok(deletedCookie);
  assert.match(deletedCookie, /Max-Age=0/i);
  assert.match(deletedCookie, /Path=\//i);
  assert.match(deletedCookie, /HttpOnly/i);
  assert.match(deletedCookie, /Secure/i);
  const clearedHeaders = { Cookie: deletedCookie.split(";")[0] };
  expectLogin(await request("/dashboard", { headers: clearedHeaders }));
  assert.equal((await request("/api/health/database", { headers: clearedHeaders })).status, 401);
  assert.equal((await request("/login", { headers: clearedHeaders })).status, 200);
});
