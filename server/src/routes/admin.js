import { Router } from "express";

export const adminRouter = Router();

/**
 * POST /api/admin/login
 * body: { password: "..." }
 *
 * Why this exists at all, instead of the frontend just sending
 * whatever password the user typed straight to /api/orders and seeing
 * if it works: this gives the admin login FORM a clean yes/no answer
 * ("was that password correct?") without needing to piggyback on a
 * data-fetching route to find out. The frontend stores the password in
 * memory only after this confirms it's correct, then attaches it as
 * the x-admin-token header on every subsequent admin request.
 */
adminRouter.post("/login", (req, res) => {
  const { password } = req.body;
  const realPassword = process.env.ADMIN_PASSWORD;

  if (!realPassword) {
    return res.status(500).json({ error: "Server has no ADMIN_PASSWORD configured." });
  }

  if (password !== realPassword) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  res.json({ ok: true });
});
