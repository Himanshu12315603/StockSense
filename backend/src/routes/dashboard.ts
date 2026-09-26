import { Router } from "express";
import { readDB } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/kpis", (_req, res) => {
  const db = readDB();

  const stockByProduct = new Map<string, number>();
  for (const line of db.stock) {
    stockByProduct.set(line.productId, (stockByProduct.get(line.productId) ?? 0) + line.quantity);
  }

  let lowStock = 0;
  let outOfStock = 0;
  for (const p of db.products) {
    const total = stockByProduct.get(p.id) ?? 0;
    if (total <= 0) outOfStock += 1;
    else if (total <= p.reorderPoint) lowStock += 1;
  }

  res.json({
    totalProducts: db.products.length,
    lowStock,
    outOfStock,
    pendingReceipts: db.receipts.filter((r) => r.status !== "Done" && r.status !== "Canceled").length,
    pendingDeliveries: db.deliveries.filter((d) => d.status !== "Done" && d.status !== "Canceled").length,
    scheduledTransfers: db.transfers.filter((t) => t.status !== "Done" && t.status !== "Canceled").length,
  });
});

// Combined, filterable operations feed for the dashboard's document table
router.get("/documents", (req, res) => {
  const db = readDB();
  const { docType, status, warehouseId, categoryId } = req.query as Record<string, string | undefined>;

  type Row = {
    id: string;
    number: string;
    docType: "Receipt" | "Delivery" | "Internal" | "Adjustment";
    status: string;
    warehouseId: string;
    warehouseName: string;
    partner: string;
    createdAt: string;
    productCategoryIds: string[];
  };

  const rows: Row[] = [];
  const whName = (id: string) => db.warehouses.find((w) => w.id === id)?.name ?? "Unknown";

  const getProductCategoryIds = (productIds: string[]) => {
    const ids = new Set<string>();
    for (const pid of productIds) {
      const p = db.products.find((prod) => prod.id === pid);
      if (p?.categoryId) ids.add(p.categoryId);
    }
    return Array.from(ids);
  };

  for (const r of db.receipts) {
    const pCatIds = getProductCategoryIds(r.lines.map((l) => l.productId));
    rows.push({ id: r.id, number: r.number, docType: "Receipt", status: r.status, warehouseId: r.warehouseId, warehouseName: whName(r.warehouseId), partner: r.supplier, createdAt: r.createdAt, productCategoryIds: pCatIds });
  }
  for (const d of db.deliveries) {
    const pCatIds = getProductCategoryIds(d.lines.map((l) => l.productId));
    rows.push({ id: d.id, number: d.number, docType: "Delivery", status: d.status, warehouseId: d.warehouseId, warehouseName: whName(d.warehouseId), partner: d.customer, createdAt: d.createdAt, productCategoryIds: pCatIds });
  }
  for (const t of db.transfers) {
    const pCatIds = getProductCategoryIds(t.lines.map((l) => l.productId));
    rows.push({ id: t.id, number: t.number, docType: "Internal", status: t.status, warehouseId: t.fromWarehouseId, warehouseName: `${whName(t.fromWarehouseId)} -> ${whName(t.toWarehouseId)}`, partner: "Internal transfer", createdAt: t.createdAt, productCategoryIds: pCatIds });
  }
  for (const a of db.adjustments) {
    const pCatIds = getProductCategoryIds([a.productId]);
    rows.push({ id: a.id, number: a.number, docType: "Adjustment", status: a.status, warehouseId: a.warehouseId, warehouseName: whName(a.warehouseId), partner: "Stock count", createdAt: a.createdAt, productCategoryIds: pCatIds });
  }

  let filtered = rows;
  if (docType) filtered = filtered.filter((r) => r.docType === docType);
  if (status) filtered = filtered.filter((r) => r.status === status);
  if (warehouseId) filtered = filtered.filter((r) => r.warehouseId === warehouseId);
  if (categoryId) filtered = filtered.filter((r) => r.productCategoryIds.includes(categoryId));

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ documents: filtered });
});

export default router;
