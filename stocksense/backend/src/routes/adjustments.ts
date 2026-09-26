import { Router } from "express";
import { readDB, writeDB, uuid, nextDocNumber } from "../db";
import { requireAuth } from "../middleware/auth";
import { applyStockChange, stockOf } from "../stockHelpers";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const db = readDB();
  const { status, warehouseId } = req.query as Record<string, string | undefined>;
  let adjustments = db.adjustments;
  if (status) adjustments = adjustments.filter((a) => a.status === status);
  if (warehouseId) adjustments = adjustments.filter((a) => a.warehouseId === warehouseId);
  res.json({ adjustments: adjustments.slice().reverse() });
});

// Create a draft adjustment: system pre-fills the recorded quantity, the
// user enters the physically counted quantity, delta is computed.
router.post("/", (req, res) => {
  const { warehouseId, productId, countedQty } = req.body || {};
  if (!warehouseId || !productId || countedQty === undefined) {
    return res.status(400).json({ error: "warehouseId, productId and countedQty are required" });
  }
  const db = readDB();
  const systemQty = stockOf(db, productId, warehouseId);
  const counted = Number(countedQty);
  const adjustment = {
    id: uuid(),
    number: nextDocNumber(db, "adjustment", "ADJ"),
    warehouseId,
    productId,
    systemQty,
    countedQty: counted,
    delta: counted - systemQty,
    status: "Draft" as const,
    createdAt: new Date().toISOString(),
  };
  db.adjustments.push(adjustment);
  writeDB(db);
  res.status(201).json({ adjustment });
});

// Validate: system auto-updates stock to match the counted quantity and logs it
router.post("/:id/validate", (req, res) => {
  const db = readDB();
  const adjustment = db.adjustments.find((a) => a.id === req.params.id);
  if (!adjustment) return res.status(404).json({ error: "Adjustment not found" });
  if (adjustment.status === "Done") return res.status(400).json({ error: "Adjustment is already validated" });
  if (adjustment.status === "Canceled") return res.status(400).json({ error: "Adjustment is canceled" });

  if (adjustment.delta !== 0) {
    applyStockChange(db, adjustment.productId, adjustment.warehouseId, adjustment.delta, "Adjustment", adjustment.number);
  }
  adjustment.status = "Done";
  adjustment.validatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ adjustment });
});

router.post("/:id/cancel", (req, res) => {
  const db = readDB();
  const adjustment = db.adjustments.find((a) => a.id === req.params.id);
  if (!adjustment) return res.status(404).json({ error: "Adjustment not found" });
  if (adjustment.status === "Done") return res.status(400).json({ error: "Can't cancel a validated adjustment" });
  adjustment.status = "Canceled";
  writeDB(db);
  res.json({ adjustment });
});

export default router;
