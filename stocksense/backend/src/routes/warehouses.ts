import { Router } from "express";
import { readDB, writeDB, uuid } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", (_req, res) => {
  const db = readDB();
  res.json({ warehouses: db.warehouses });
});

router.post("/", (req, res) => {
  const { name, code, location } = req.body || {};
  if (!name || !code) return res.status(400).json({ error: "name and code are required" });
  const db = readDB();
  if (db.warehouses.some((w) => w.code.toLowerCase() === String(code).toLowerCase())) {
    return res.status(409).json({ error: "A warehouse with this code already exists" });
  }
  const warehouse = { id: uuid(), name, code, location: location || "" };
  db.warehouses.push(warehouse);
  writeDB(db);
  res.status(201).json({ warehouse });
});

export default router;
