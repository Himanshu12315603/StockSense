import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readDB, writeDB, uuid } from "../db";
import { JWT_SECRET, requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

function publicUser(u: { id: string; name: string; email: string; role: string }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

router.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  const db = readDB();
  if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }
  const user = {
    id: uuid(),
    name,
    email: String(email).toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 8),
    role: role === "Warehouse Staff" ? "Warehouse Staff" : ("Inventory Manager" as const),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDB(db);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: publicUser(user) });
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

// OTP-based password reset. There's no email provider wired up for the demo,
// so the OTP is returned directly in the response (and logged server-side)
// instead of being emailed. Swap this for a real mail/SMS send in production.
router.post("/forgot-password", (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required" });
  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    // Don't reveal whether the account exists.
    return res.json({ message: "If that account exists, an OTP has been sent." });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  db.otps = db.otps.filter((o) => o.email !== user.email);
  db.otps.push({ email: user.email, code, expiresAt });
  writeDB(db);
  console.log(`[StockSense] Password reset OTP for ${user.email}: ${code}`);
  res.json({ message: "If that account exists, an OTP has been sent.", demoOtp: code });
});

router.post("/reset-password", (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Email, code and new password are required" });
  }
  const db = readDB();
  const record = db.otps.find((o) => o.email.toLowerCase() === String(email).toLowerCase() && o.code === code);
  if (!record) return res.status(400).json({ error: "Invalid code" });
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ error: "This code has expired, request a new one" });
  }
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(404).json({ error: "User not found" });
  user.passwordHash = bcrypt.hashSync(newPassword, 8);
  db.otps = db.otps.filter((o) => o.email !== record.email);
  writeDB(db);
  res.json({ message: "Password updated, you can now log in" });
});

export default router;
