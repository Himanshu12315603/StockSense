import { Router } from "express";
import { readDB, writeDB, uuid, nextDocNumber } from "../db";
import { requireAuth } from "../middleware/auth";
import { applyStockChange, stockOf } from "../stockHelpers";
import { DocLine } from "../types";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const db = readDB();
  const { status, warehouseId } = req.query as Record<string, string | undefined>;
  let deliveries = db.deliveries;
  if (status) deliveries = deliveries.filter((d) => d.status === status);
  if (warehouseId) deliveries = deliveries.filter((d) => d.warehouseId === warehouseId);
  res.json({ deliveries: deliveries.slice().reverse() });
});

router.get("/:id", (req, res) => {
  const db = readDB();
  const delivery = db.deliveries.find((d) => d.id === req.params.id);
  if (!delivery) return res.status(404).json({ error: "Delivery order not found" });
  res.json({ delivery });
});

router.post("/", (req, res) => {
  const { customer, warehouseId, lines } = req.body || {};
  if (!customer || !warehouseId || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: "customer, warehouseId and at least one line are required" });
  }
  const db = readDB();
  const delivery = {
    id: uuid(),
    number: nextDocNumber(db, "delivery", "DLVR"),
    customer,
    warehouseId,
    status: "Waiting" as const, // starts at Waiting: pick, then pack, then validate
    lines: (lines as DocLine[]).map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
    createdAt: new Date().toISOString(),
  };
  db.deliveries.push(delivery);
  writeDB(db);
  res.status(201).json({ delivery });
});

// Move a delivery through Waiting -> Ready (picked & packed)
router.post("/:id/ready", (req, res) => {
  const db = readDB();
  const delivery = db.deliveries.find((d) => d.id === req.params.id);
  if (!delivery) return res.status(404).json({ error: "Delivery order not found" });
  if (delivery.status !== "Waiting") return res.status(400).json({ error: "Only a waiting order can be marked ready" });
  delivery.status = "Ready";
  writeDB(db);
  res.json({ delivery });
});

// Validate: stock decreases automatically for every line
router.post("/:id/validate", (req, res) => {
  const db = readDB();
  const delivery = db.deliveries.find((d) => d.id === req.params.id);
  if (!delivery) return res.status(404).json({ error: "Delivery order not found" });
  if (delivery.status === "Done") return res.status(400).json({ error: "Delivery order is already validated" });
  if (delivery.status === "Canceled") return res.status(400).json({ error: "Delivery order is canceled" });

  const shortfalls = delivery.lines.filter(
    (l) => stockOf(db, l.productId, delivery.warehouseId) < l.quantity
  );
  if (shortfalls.length > 0) {
    return res.status(400).json({
      error: "Not enough stock to validate this order",
      shortfalls: shortfalls.map((l) => l.productId),
    });
  }

  for (const line of delivery.lines) {
    applyStockChange(db, line.productId, delivery.warehouseId, -line.quantity, "Delivery", delivery.number);
  }
  delivery.status = "Done";
  delivery.validatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ delivery });
});

router.post("/:id/cancel", (req, res) => {
  const db = readDB();
  const delivery = db.deliveries.find((d) => d.id === req.params.id);
  if (!delivery) return res.status(404).json({ error: "Delivery order not found" });
  if (delivery.status === "Done") return res.status(400).json({ error: "Can't cancel a validated delivery order" });
  delivery.status = "Canceled";
  writeDB(db);
  res.json({ delivery });
});

export default router;
