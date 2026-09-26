import { DBSchema, LedgerType } from "./types";
import { uuid } from "./db";

// Adds (or subtracts, if delta is negative) quantity for a product at a
// warehouse, creating the stock line if it doesn't exist yet, and appends a
// matching ledger entry so every movement is auditable.
export function applyStockChange(
  db: DBSchema,
  productId: string,
  warehouseId: string,
  delta: number,
  type: LedgerType,
  refDoc: string
): void {
  let line = db.stock.find((s) => s.productId === productId && s.warehouseId === warehouseId);
  if (!line) {
    line = { productId, warehouseId, quantity: 0 };
    db.stock.push(line);
  }
  line.quantity += delta;
  db.ledger.push({
    id: uuid(),
    date: new Date().toISOString(),
    type,
    productId,
    warehouseId,
    qtyChange: delta,
    refDoc,
  });
}

export function stockOf(db: DBSchema, productId: string, warehouseId: string): number {
  return db.stock.find((s) => s.productId === productId && s.warehouseId === warehouseId)?.quantity ?? 0;
}
