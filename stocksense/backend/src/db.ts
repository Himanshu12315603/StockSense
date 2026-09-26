import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { DBSchema } from "./types";

// StockSense uses a simple, file-based JSON store instead of a full database
// engine. It has no native dependencies, so it installs and runs anywhere
// Node runs -- ideal for a hackathon demo. Swap this module out for a real
// database (Postgres, Mongo, etc.) later without touching the route code,
// as long as the same read/write shape is kept.

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

function seedData(): DBSchema {
  const now = new Date().toISOString();

  const whMain = { id: uuid(), name: "Main Warehouse", code: "WH-MAIN", location: "Ludhiana, Punjab" };
  const whProd = { id: uuid(), name: "Production Floor", code: "WH-PROD", location: "Ludhiana, Punjab" };
  const whSecond = { id: uuid(), name: "Warehouse 2", code: "WH-02", location: "Delhi NCR" };

  const catRaw = { id: uuid(), name: "Raw Materials" };
  const catFurn = { id: uuid(), name: "Furniture" };
  const catHw = { id: uuid(), name: "Hardware" };

  const pSteel = { id: uuid(), name: "Steel Rods", sku: "STL-ROD-01", categoryId: catRaw.id, uom: "kg", reorderPoint: 50 };
  const pChair = { id: uuid(), name: "Office Chair", sku: "FUR-CHR-01", categoryId: catFurn.id, uom: "pcs", reorderPoint: 10 };
  const pBolt = { id: uuid(), name: "M8 Bolts", sku: "HW-BLT-08", categoryId: catHw.id, uom: "pcs", reorderPoint: 200 };

  const passwordHash = bcrypt.hashSync("password123", 8);

  return {
    users: [
      {
        id: uuid(),
        name: "Demo Manager",
        email: "demo@stocksense.app",
        passwordHash,
        role: "Inventory Manager",
        createdAt: now,
      },
    ],
    otps: [],
    warehouses: [whMain, whProd, whSecond],
    categories: [catRaw, catFurn, catHw],
    products: [pSteel, pChair, pBolt],
    stock: [
      { productId: pSteel.id, warehouseId: whMain.id, quantity: 180 },
      { productId: pSteel.id, warehouseId: whProd.id, quantity: 20 },
      { productId: pChair.id, warehouseId: whMain.id, quantity: 42 },
      { productId: pBolt.id, warehouseId: whMain.id, quantity: 620 },
    ],
    receipts: [],
    deliveries: [],
    transfers: [],
    adjustments: [],
    ledger: [],
    counters: { receipt: 0, delivery: 0, transfer: 0, adjustment: 0 },
  };
}

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedData(), null, 2), "utf-8");
  }
}

export function readDB(): DBSchema {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as DBSchema;
}

export function writeDB(db: DBSchema): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

// Generates a sequential, human-readable document number, e.g. RCPT-0007.
export function nextDocNumber(db: DBSchema, key: string, prefix: string): string {
  db.counters[key] = (db.counters[key] ?? 0) + 1;
  return `${prefix}-${String(db.counters[key]).padStart(4, "0")}`;
}

export { uuid };
