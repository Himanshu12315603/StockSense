import { Router } from "express";
import { readDB, writeDB, uuid, nextDocNumber } from "../db";
import { requireAuth } from "../middleware/auth";
import { applyStockChange, stockOf } from "../stockHelpers";
import { DocLine } from "../types";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const db = readDB();
  const { status } = req.query as Record<string, string | undefined>;
  let transfers = db.transfers;
  if (status) transfers = transfers.filter((t) => t.status === status);
  res.json({ transfers: transfers.slice().reverse() });
});

router.post("/", (req, res) => {
  const { fromWarehouseId, toWarehouseId, lines } = req.body || {};
  if (!fromWarehouseId || !toWarehouseId || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: "fromWarehouseId, toWarehouseId and at least one line are required" });
  }
  if (fromWarehouseId === toWarehouseId) {
    return res.status(400).json({ error: "Source and destination must be different" });
  }
  const db = readDB();
  const transfer = {
    id: uuid(),
    number: nextDocNumber(db, "transfer", "TRF"),
    fromWarehouseId,
    toWarehouseId,
    status: "Draft" as const,
    lines: (lines as DocLine[]).map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
    createdAt: new Date().toISOString(),
  };
  db.transfers.push(transfer);
  writeDB(db);
  res.status(201).json({ transfer });
});

// Validate: total stock is unchanged, only location moves
router.post("/:id/validate", (req, res) => {
  const db = readDB();
  const transfer = db.transfers.find((t) => t.id === req.params.id);
  if (!transfer) return res.status(404).json({ error: "Transfer not found" });
  if (transfer.status === "Done") return res.status(400).json({ error: "Transfer is already validated" });
  if (transfer.status === "Canceled") return res.status(400).json({ error: "Transfer is canceled" });

  const shortfalls = transfer.lines.filter(
    (l) => stockOf(db, l.productId, transfer.fromWarehouseId) < l.quantity
  );
  if (shortfalls.length > 0) {
    return res.status(400).json({
      error: "Not enough stock at the source location to validate this transfer",
      shortfalls: shortfalls.map((l) => l.productId),
    });
  }

  for (const line of transfer.lines) {
    applyStockChange(db, line.productId, transfer.fromWarehouseId, -line.quantity, "Transfer Out", transfer.number);
    applyStockChange(db, line.productId, transfer.toWarehouseId, line.quantity, "Transfer In", transfer.number);
  }
  transfer.status = "Done";
  transfer.validatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ transfer });
});

router.post("/:id/cancel", (req, res) => {
  const db = readDB();
  const transfer = db.transfers.find((t) => t.id === req.params.id);
  if (!transfer) return res.status(404).json({ error: "Transfer not found" });
  if (transfer.status === "Done") return res.status(400).json({ error: "Can't cancel a validated transfer" });
  transfer.status = "Canceled";
  writeDB(db);
  res.json({ transfer });
});

export default router;
