export type DocStatus = "Draft" | "Waiting" | "Ready" | "Done" | "Canceled";
export type DocType = "Receipt" | "Delivery" | "Internal" | "Adjustment";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Inventory Manager" | "Warehouse Staff";
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

export interface StockByWarehouse {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category: string;
  uom: string;
  reorderPoint: number;
  totalStock: number;
  stockByWarehouse: StockByWarehouse[];
  lowStock: boolean;
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
}

export interface Delivery {
  id: string;
  number: string;
  customer: string;
  warehouseId: string;
  status: DocStatus;
  lines: DocLine[];
  createdAt: string;
}

export interface Transfer {
  id: string;
  number: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: DocStatus;
  lines: DocLine[];
  createdAt: string;
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
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  qtyChange: number;
  refDoc: string;
}

export interface DashboardKpis {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
}

export interface DashboardDocRow {
  id: string;
  number: string;
  docType: DocType;
  status: DocStatus;
  warehouseId: string;
  warehouseName: string;
  partner: string;
  createdAt: string;
}
