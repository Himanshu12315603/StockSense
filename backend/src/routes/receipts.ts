import { Router } from "express";
import { readDB, writeDB, uuid, nextDocNumber } from "../db";
import { requireAuth } from "../middleware/auth";
import { applyStockChange } from "../stockHelpers";
import { DocLine } from "../types";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const db = readDB();
  const { status, warehouseId } = req.query as Record<string, string | undefined>;
  let receipts = db.receipts;
  if (status) receipts = receipts.filter((r) => r.status === status);
  if (warehouseId) receipts = receipts.filter((r) => r.warehouseId === warehouseId);
  res.json({ receipts: receipts.slice().reverse() });
});

router.get("/:id", (req, res) => {
  const db = readDB();
  const receipt = db.receipts.find((r) => r.id === req.params.id);
  if (!receipt) return res.status(404).json({ error: "Receipt not found" });
  res.json({ receipt });
});

router.post("/", (req, res) => {
  const { supplier, warehouseId, lines } = req.body || {};
  if (!supplier || !warehouseId || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: "supplier, warehouseId and at least one line are required" });
  }
  const db = readDB();
  const receipt = {
    id: uuid(),
    number: nextDocNumber(db, "receipt", "RCPT"),
    supplier,
    warehouseId,
    status: "Draft" as const,
    lines: (lines as DocLine[]).map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
    createdAt: new Date().toISOString(),
  };
  db.receipts.push(receipt);
  writeDB(db);
  res.status(201).json({ receipt });
});

// Validate: stock increases automatically for every line
router.post("/:id/validate", (req, res) => {
  const db = readDB();
  const receipt = db.receipts.find((r) => r.id === req.params.id);
  if (!receipt) return res.status(404).json({ error: "Receipt not found" });
  if (receipt.status === "Done") return res.status(400).json({ error: "Receipt is already validated" });
  if (receipt.status === "Canceled") return res.status(400).json({ error: "Receipt is canceled" });

  for (const line of receipt.lines) {
    applyStockChange(db, line.productId, receipt.warehouseId, line.quantity, "Receipt", receipt.number);
  }
  receipt.status = "Done";
  receipt.validatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ receipt });
});

router.post("/:id/cancel", (req, res) => {
  const db = readDB();
  const receipt = db.receipts.find((r) => r.id === req.params.id);
  if (!receipt) return res.status(404).json({ error: "Receipt not found" });
  if (receipt.status === "Done") return res.status(400).json({ error: "Can't cancel a validated receipt" });
  receipt.status = "Canceled";
  writeDB(db);
  res.json({ receipt });
});

export default router;
