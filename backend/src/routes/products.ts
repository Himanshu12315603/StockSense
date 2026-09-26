import { Router } from "express";
import { readDB, writeDB, uuid } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /api/products -- list with stock per location attached, optional filters
router.get("/", (req, res) => {
  const db = readDB();
  const { categoryId, warehouseId, search } = req.query as Record<string, string | undefined>;

  let products = db.products;
  if (categoryId) products = products.filter((p) => p.categoryId === categoryId);
  if (search) {
    const q = search.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }

  const result = products.map((p) => {
    let stockLines = db.stock.filter((s) => s.productId === p.id);
    if (warehouseId) stockLines = stockLines.filter((s) => s.warehouseId === warehouseId);
    const totalStock = stockLines.reduce((sum, s) => sum + s.quantity, 0);
    return {
      ...p,
      category: db.categories.find((c) => c.id === p.categoryId)?.name ?? "Uncategorized",
      totalStock,
      stockByWarehouse: stockLines.map((s) => ({
        warehouseId: s.warehouseId,
        warehouseName: db.warehouses.find((w) => w.id === s.warehouseId)?.name ?? "Unknown",
        quantity: s.quantity,
      })),
      lowStock: totalStock <= p.reorderPoint,
    };
  });

  res.json({ products: result });
});

router.post("/", (req, res) => {
  const { name, sku, categoryId, uom, reorderPoint, initialStock, warehouseId } = req.body || {};
  if (!name || !sku || !categoryId || !uom) {
    return res.status(400).json({ error: "name, sku, categoryId and uom are required" });
  }
  const db = readDB();
  if (db.products.some((p) => p.sku.toLowerCase() === String(sku).toLowerCase())) {
    return res.status(409).json({ error: "A product with this SKU already exists" });
  }
  const product = {
    id: uuid(),
    name,
    sku,
    categoryId,
    uom,
    reorderPoint: Number(reorderPoint) || 0,
  };
  db.products.push(product);

  if (initialStock && warehouseId) {
    db.stock.push({ productId: product.id, warehouseId, quantity: Number(initialStock) });
    db.ledger.push({
      id: uuid(),
      date: new Date().toISOString(),
      type: "Adjustment",
      productId: product.id,
      warehouseId,
      qtyChange: Number(initialStock),
      refDoc: "Initial stock",
    });
  }

  writeDB(db);
  res.status(201).json({ product });
});

router.put("/:id", (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const { name, sku, categoryId, uom, reorderPoint } = req.body || {};
  if (name !== undefined) product.name = name;
  if (sku !== undefined) product.sku = sku;
  if (categoryId !== undefined) product.categoryId = categoryId;
  if (uom !== undefined) product.uom = uom;
  if (reorderPoint !== undefined) product.reorderPoint = Number(reorderPoint);
  writeDB(db);
  res.json({ product });
});

router.get("/categories/all", (_req, res) => {
  const db = readDB();
  res.json({ categories: db.categories });
});

router.post("/categories", (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const db = readDB();
  const category = { id: uuid(), name };
  db.categories.push(category);
  writeDB(db);
  res.status(201).json({ category });
});

export default router;
