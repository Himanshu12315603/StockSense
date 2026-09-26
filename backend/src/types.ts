export type DocStatus = "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
export type DocType = "Receipt" | "Delivery" | "Internal" | "Adjustment";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "Inventory Manager" | "Warehouse Staff";
  createdAt: string;
}

export interface OtpRecord {
  email: string;
  code: string;
  expiresAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  uom: string;
  reorderPoint: number;
}

export interface StockLine {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface DocLine {
  productId: string;
  quantity: number;
}

export interface Receipt {
  id: string;
  number: string;
  supplier: string;
  warehouseId: string;
  status: DocStatus;
  lines: DocLine[];
  createdAt: string;
  validatedAt?: string;
}

export interface Delivery {
  id: string;
  number: string;
  customer: string;
  warehouseId: string;
  status: DocStatus;
  lines: DocLine[];
  createdAt: string;
  validatedAt?: string;
}

export interface Transfer {
  id: string;
  number: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: DocStatus;
  lines: DocLine[];
  createdAt: string;
  validatedAt?: string;
}

export interface Adjustment {
  id: string;
  number: string;
  warehouseId: string;
  productId: string;
  systemQty: number;
  countedQty: number;
  delta: number;
  status: DocStatus;
  createdAt: string;
  validatedAt?: string;
}

export type LedgerType = "Receipt" | "Delivery" | "Transfer In" | "Transfer Out" | "Adjustment";

export interface LedgerEntry {
  id: string;
  date: string;
  type: LedgerType;
  productId: string;
  warehouseId: string;
  qtyChange: number;
  refDoc: string;
}

export interface DBSchema {
  users: User[];
  otps: OtpRecord[];
  warehouses: Warehouse[];
  categories: Category[];
  products: Product[];
  stock: StockLine[];
  receipts: Receipt[];
  deliveries: Delivery[];
  transfers: Transfer[];
  adjustments: Adjustment[];
  ledger: LedgerEntry[];
  counters: Record<string, number>;
}
