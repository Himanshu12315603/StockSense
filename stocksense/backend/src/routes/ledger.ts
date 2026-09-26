import { Router } from "express";
import { readDB } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const db = readDB();
  const { productId, warehouseId, type } = req.query as Record<string, string | undefined>;

  let entries = db.ledger;
  if (productId) entries = entries.filter((e) => e.productId === productId);
  if (warehouseId) entries = entries.filter((e) => e.warehouseId === warehouseId);
  if (type) entries = entries.filter((e) => e.type === type);

  const enriched = entries
    .slice()
    .reverse()
    .map((e) => ({
      ...e,
      productName: db.products.find((p) => p.id === e.productId)?.name ?? "Unknown product",
      warehouseName: db.warehouses.find((w) => w.id === e.warehouseId)?.name ?? "Unknown warehouse",
    }));

  res.json({ entries: enriched });
});

export default router;
