/**
 * THE PROBLEM this solves: /api/orders returns customer names, emails,
 * and what they bought — that's private data. Right now, ANY request
 * (from anyone, anywhere) can hit GET /api/orders and see every
 * customer's info. That's not acceptable even for a small project.
 *
 * THE CONCEPT — middleware: an Express middleware is just a function
 * that runs BEFORE a route handler, with the power to either call
 * next() (let the request continue) or send its own response and stop
 * the request there (e.g. a 401). This one checks for a shared secret
 * password in a request header before letting the request reach the
 * actual orders route.
 *
 * IMPORTANT — this is intentionally minimal, NOT real production auth:
 *   - There's only ONE admin "account" (a single shared password from
 *     .env), not individual admin user accounts.
 *   - The "token" is just the plaintext password itself, re-sent on
 *     every request — not a real signed session token (like a JWT)
 *     that expires or can be revoked independently.
 *   - It's fine for a solo/small project or portfolio piece. A real
 *     production app would use hashed passwords, per-user accounts,
 *     and expiring tokens (e.g. JWTs or server-side sessions) instead.
 */
export function requireAdmin(req, res, next) {
  const suppliedPassword = req.headers["x-admin-token"];
  const realPassword = process.env.ADMIN_PASSWORD;

  if (!realPassword) {
    // Fail loudly in server logs if the project isn't configured yet,
    // rather than silently locking admin routes forever.
    console.error("[admin] ADMIN_PASSWORD is not set in .env — admin routes will always reject.");
  }

  if (!suppliedPassword || suppliedPassword !== realPassword) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next(); // password matched — let the request through to the real route
}
