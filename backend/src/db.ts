import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { DBSchema } from "./types";

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

export function seedData(): DBSchema {
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  // 1. Warehouses
  const whMain = { id: uuid(), name: "Central Hub Ludhiana", code: "WH-MAIN", location: "Ludhiana, Punjab" };
  const whProd = { id: uuid(), name: "Production Plant 01", code: "WH-PROD", location: "Ludhiana, Punjab" };
  const whNcr = { id: uuid(), name: "Delhi NCR Depot", code: "WH-NCR", location: "Gurugram, Haryana" };
  const whSouth = { id: uuid(), name: "Bengaluru Tech Depot", code: "WH-BLR", location: "Bengaluru, Karnataka" };
  const whWest = { id: uuid(), name: "Mumbai Export Depot", code: "WH-BOM", location: "Navi Mumbai, Maharashtra" };

  // 2. Categories
  const catMetals = { id: uuid(), name: "Metals & Raw Materials" };
  const catFurn = { id: uuid(), name: "Industrial & Office Furniture" };
  const catHw = { id: uuid(), name: "Fasteners & Hardware" };
  const catElec = { id: uuid(), name: "Sensors & Automation" };
  const catPkg = { id: uuid(), name: "Packaging Supplies" };
  const catChem = { id: uuid(), name: "Lubricants & Solvents" };

  // 3. Products
  const pSteel = { id: uuid(), name: "High-grade Steel Rods 12mm", sku: "STL-ROD-12", categoryId: catMetals.id, uom: "kg", reorderPoint: 500 };
  const pAlu = { id: uuid(), name: "Aluminum Sheets 2mm", sku: "ALU-SHT-02", categoryId: catMetals.id, uom: "sqm", reorderPoint: 150 };
  const pCopper = { id: uuid(), name: "Copper Wiring Spool 100m", sku: "CPR-WIR-100", categoryId: catMetals.id, uom: "spools", reorderPoint: 40 };

  const pChair = { id: uuid(), name: "Executive Mesh Office Chair", sku: "FUR-CHR-EX", categoryId: catFurn.id, uom: "pcs", reorderPoint: 15 };
  const pDesk = { id: uuid(), name: "Motorized Standing Desk", sku: "FUR-DSK-ST", categoryId: catFurn.id, uom: "pcs", reorderPoint: 10 };
  const pCabinet = { id: uuid(), name: "Filing Cabinet 4-Drawer", sku: "FUR-CAB-04", categoryId: catFurn.id, uom: "pcs", reorderPoint: 8 };
  const pRack = { id: uuid(), name: "Heavy Steel Pallet Rack Frame", sku: "FUR-RCK-FRM", categoryId: catFurn.id, uom: "units", reorderPoint: 12 };

  const pBolt = { id: uuid(), name: "M8 Hex Stainless Bolts 50mm", sku: "HW-BLT-M8", categoryId: catHw.id, uom: "boxes", reorderPoint: 100 };
  const pNut = { id: uuid(), name: "High-tensile M10 Lock Nuts", sku: "HW-NUT-M10", categoryId: catHw.id, uom: "boxes", reorderPoint: 80 };
  const pWheel = { id: uuid(), name: "Heavy Duty Caster Wheels 4-inch", sku: "HW-WHL-04", categoryId: catHw.id, uom: "pcs", reorderPoint: 50 };
  const pCylinder = { id: uuid(), name: "Pneumatic Air Cylinder 50mm", sku: "IND-CYL-50", categoryId: catHw.id, uom: "pcs", reorderPoint: 10 };

  const pPlc = { id: uuid(), name: "Programmable Logic Controller S7", sku: "ELE-PLC-S7", categoryId: catElec.id, uom: "pcs", reorderPoint: 5 };
  const pSensor = { id: uuid(), name: "Optical Proximity Sensor 24V", sku: "ELE-SNS-OP", categoryId: catElec.id, uom: "pcs", reorderPoint: 25 };
  const pDrive = { id: uuid(), name: "Stepper Motor Drive Module", sku: "ELE-MOT-DRV", categoryId: catElec.id, uom: "pcs", reorderPoint: 12 };
  const pLed = { id: uuid(), name: "LED High Bay Warehouse Light 150W", sku: "ELE-LGT-150", categoryId: catElec.id, uom: "pcs", reorderPoint: 20 };

  const pBox = { id: uuid(), name: "Heavy Duty Corrugated Boxes 5-Ply", sku: "PKG-BOX-5P", categoryId: catPkg.id, uom: "bundles", reorderPoint: 200 };
  const pWrap = { id: uuid(), name: "Stretch Wrap Roll 500mm", sku: "PKG-WRP-50", categoryId: catPkg.id, uom: "rolls", reorderPoint: 60 };
  const pBubble = { id: uuid(), name: "Biodegradable Cushion Roll", sku: "PKG-BBL-BIO", categoryId: catPkg.id, uom: "rolls", reorderPoint: 30 };
  const pLabels = { id: uuid(), name: "Thermal Shipping Labels 100x150mm", sku: "PKG-LBL-100", categoryId: catPkg.id, uom: "rolls", reorderPoint: 40 };

  const pDegreaser = { id: uuid(), name: "Industrial Degreaser Solvent 20L", sku: "CHM-DEG-20L", categoryId: catChem.id, uom: "canisters", reorderPoint: 15 };

  const passwordHash = bcrypt.hashSync("password123", 8);

  const users = [
    {
      id: uuid(),
      name: "Demo Manager",
      email: "demo@stocksense.app",
      passwordHash,
      role: "Inventory Manager" as const,
      createdAt: daysAgo(30),
    },
    {
      id: uuid(),
      name: "Rajesh Staff",
      email: "staff@stocksense.app",
      passwordHash,
      role: "Warehouse Staff" as const,
      createdAt: daysAgo(20),
    },
  ];

  const warehouses = [whMain, whProd, whNcr, whSouth, whWest];
  const categories = [catMetals, catFurn, catHw, catElec, catPkg, catChem];
  const products = [
    pSteel, pAlu, pCopper,
    pChair, pDesk, pCabinet, pRack,
    pBolt, pNut, pWheel, pCylinder,
    pPlc, pSensor, pDrive, pLed,
    pBox, pWrap, pBubble, pLabels,
    pDegreaser
  ];

  // Stock Quantities across warehouses
  const stock = [
    { productId: pSteel.id, warehouseId: whMain.id, quantity: 1200 },
    { productId: pSteel.id, warehouseId: whProd.id, quantity: 250 },

    { productId: pAlu.id, warehouseId: whMain.id, quantity: 320 },
    { productId: pAlu.id, warehouseId: whNcr.id, quantity: 80 },

    { productId: pCopper.id, warehouseId: whMain.id, quantity: 30 }, // Low Stock (reorder 40)

    { productId: pChair.id, warehouseId: whMain.id, quantity: 42 },
    { productId: pChair.id, warehouseId: whNcr.id, quantity: 18 },
    { productId: pChair.id, warehouseId: whSouth.id, quantity: 5 },

    { productId: pDesk.id, warehouseId: whMain.id, quantity: 8 }, // Low Stock (reorder 10)
    { productId: pDesk.id, warehouseId: whSouth.id, quantity: 12 },

    { productId: pCabinet.id, warehouseId: whMain.id, quantity: 0 }, // Out of Stock!

    { productId: pRack.id, warehouseId: whMain.id, quantity: 15 },
    { productId: pRack.id, warehouseId: whWest.id, quantity: 6 },

    { productId: pBolt.id, warehouseId: whMain.id, quantity: 650 },
    { productId: pBolt.id, warehouseId: whProd.id, quantity: 400 },

    { productId: pNut.id, warehouseId: whMain.id, quantity: 75 }, // Low Stock (reorder 80)

    { productId: pWheel.id, warehouseId: whMain.id, quantity: 180 },
    { productId: pWheel.id, warehouseId: whNcr.id, quantity: 90 },

    { productId: pCylinder.id, warehouseId: whProd.id, quantity: 14 },

    { productId: pPlc.id, warehouseId: whMain.id, quantity: 3 }, // Low Stock (reorder 5)

    { productId: pSensor.id, warehouseId: whMain.id, quantity: 45 },
    { productId: pSensor.id, warehouseId: whProd.id, quantity: 30 },

    { productId: pDrive.id, warehouseId: whMain.id, quantity: 2 }, // Low Stock (reorder 12)

    { productId: pLed.id, warehouseId: whMain.id, quantity: 60 },
    { productId: pLed.id, warehouseId: whSouth.id, quantity: 22 },

    { productId: pBox.id, warehouseId: whMain.id, quantity: 850 },
    { productId: pBox.id, warehouseId: whNcr.id, quantity: 400 },
    { productId: pBox.id, warehouseId: whWest.id, quantity: 300 },

    { productId: pWrap.id, warehouseId: whMain.id, quantity: 140 },
    { productId: pWrap.id, warehouseId: whNcr.id, quantity: 75 },

    { productId: pBubble.id, warehouseId: whMain.id, quantity: 18 }, // Low Stock (reorder 30)

    { productId: pLabels.id, warehouseId: whMain.id, quantity: 120 },

    { productId: pDegreaser.id, warehouseId: whProd.id, quantity: 0 }, // Out of Stock!
  ];

  // Documents
  const receipts = [
    {
      id: uuid(),
      number: "RCPT-0001",
      supplier: "Tata Steel Ltd",
      warehouseId: whMain.id,
      status: "Done" as const,
      lines: [
        { productId: pSteel.id, quantity: 500 },
        { productId: pAlu.id, quantity: 100 },
      ],
      createdAt: daysAgo(10),
      validatedAt: daysAgo(9),
    },
    {
      id: uuid(),
      number: "RCPT-0002",
      supplier: "Supreme Hardware Corp",
      warehouseId: whMain.id,
      status: "Done" as const,
      lines: [
        { productId: pBolt.id, quantity: 300 },
        { productId: pWheel.id, quantity: 100 },
      ],
      createdAt: daysAgo(7),
      validatedAt: daysAgo(6),
    },
    {
      id: uuid(),
      number: "RCPT-0003",
      supplier: "Featherlite Ergonomics",
      warehouseId: whNcr.id,
      status: "Ready" as const,
      lines: [
        { productId: pChair.id, quantity: 20 },
        { productId: pDesk.id, quantity: 10 },
      ],
      createdAt: daysAgo(3),
    },
    {
      id: uuid(),
      number: "RCPT-0004",
      supplier: "Siemens Industrial Ltd",
      warehouseId: whMain.id,
      status: "Waiting" as const,
      lines: [
        { productId: pPlc.id, quantity: 10 },
        { productId: pSensor.id, quantity: 50 },
      ],
      createdAt: daysAgo(2),
    },
    {
      id: uuid(),
      number: "RCPT-0005",
      supplier: "EcoPack Supplies Global",
      warehouseId: whMain.id,
      status: "Draft" as const,
      lines: [
        { productId: pBox.id, quantity: 500 },
        { productId: pWrap.id, quantity: 100 },
      ],
      createdAt: daysAgo(1),
    },
  ];

  const deliveries = [
    {
      id: uuid(),
      number: "DLVR-0001",
      customer: "Apex Motors India",
      warehouseId: whMain.id,
      status: "Done" as const,
      lines: [
        { productId: pSteel.id, quantity: 150 },
        { productId: pBolt.id, quantity: 50 },
      ],
      createdAt: daysAgo(8),
      validatedAt: daysAgo(7),
    },
    {
      id: uuid(),
      number: "DLVR-0002",
      customer: "Urban Tech Office Systems",
      warehouseId: whMain.id,
      status: "Ready" as const,
      lines: [
        { productId: pChair.id, quantity: 12 },
        { productId: pDesk.id, quantity: 4 },
      ],
      createdAt: daysAgo(4),
    },
    {
      id: uuid(),
      number: "DLVR-0003",
      customer: "Cyberdyne Logistics Pvt Ltd",
      warehouseId: whNcr.id,
      status: "Waiting" as const,
      lines: [
        { productId: pWheel.id, quantity: 30 },
        { productId: pBox.id, quantity: 100 },
      ],
      createdAt: daysAgo(2),
    },
    {
      id: uuid(),
      number: "DLVR-0004",
      customer: "Northern Infra Projects",
      warehouseId: whProd.id,
      status: "Waiting" as const,
      lines: [
        { productId: pCylinder.id, quantity: 4 },
        { productId: pSensor.id, quantity: 10 },
      ],
      createdAt: daysAgo(1),
    },
    {
      id: uuid(),
      number: "DLVR-0005",
      customer: "Southern Retail Chain",
      warehouseId: whSouth.id,
      status: "Draft" as const,
      lines: [
        { productId: pChair.id, quantity: 5 },
        { productId: pLed.id, quantity: 10 },
      ],
      createdAt: daysAgo(1),
    },
  ];

  const transfers = [
    {
      id: uuid(),
      number: "TRF-0001",
      fromWarehouseId: whMain.id,
      toWarehouseId: whProd.id,
      status: "Done" as const,
      lines: [
        { productId: pSteel.id, quantity: 200 },
        { productId: pBolt.id, quantity: 100 },
      ],
      createdAt: daysAgo(9),
      validatedAt: daysAgo(8),
    },
    {
      id: uuid(),
      number: "TRF-0002",
      fromWarehouseId: whMain.id,
      toWarehouseId: whNcr.id,
      status: "Ready" as const,
      lines: [
        { productId: pAlu.id, quantity: 50 },
        { productId: pBox.id, quantity: 200 },
      ],
      createdAt: daysAgo(3),
    },
    {
      id: uuid(),
      number: "TRF-0003",
      fromWarehouseId: whMain.id,
      toWarehouseId: whSouth.id,
      status: "Waiting" as const,
      lines: [
        { productId: pLed.id, quantity: 15 },
        { productId: pDesk.id, quantity: 5 },
      ],
      createdAt: daysAgo(2),
    },
    {
      id: uuid(),
      number: "TRF-0004",
      fromWarehouseId: whMain.id,
      toWarehouseId: whWest.id,
      status: "Draft" as const,
      lines: [
        { productId: pRack.id, quantity: 4 },
      ],
      createdAt: daysAgo(1),
    },
  ];

  const adjustments = [
    {
      id: uuid(),
      number: "ADJ-0001",
      warehouseId: whMain.id,
      productId: pSteel.id,
      systemQty: 1185,
      countedQty: 1200,
      delta: 15,
      status: "Done" as const,
      createdAt: daysAgo(12),
      validatedAt: daysAgo(12),
    },
    {
      id: uuid(),
      number: "ADJ-0002",
      warehouseId: whProd.id,
      productId: pDegreaser.id,
      systemQty: 5,
      countedQty: 0,
      delta: -5,
      status: "Done" as const,
      createdAt: daysAgo(5),
      validatedAt: daysAgo(5),
    },
    {
      id: uuid(),
      number: "ADJ-0003",
      warehouseId: whMain.id,
      productId: pCopper.id,
      systemQty: 35,
      countedQty: 30,
      delta: -5,
      status: "Draft" as const,
      createdAt: daysAgo(1),
    },
  ];

  // Stock Ledger
  const ledger = [
    {
      id: uuid(),
      date: daysAgo(12),
      type: "Adjustment" as const,
      productId: pSteel.id,
      warehouseId: whMain.id,
      qtyChange: 15,
      refDoc: "ADJ-0001",
    },
    {
      id: uuid(),
      date: daysAgo(9),
      type: "Receipt" as const,
      productId: pSteel.id,
      warehouseId: whMain.id,
      qtyChange: 500,
      refDoc: "RCPT-0001",
    },
    {
      id: uuid(),
      date: daysAgo(9),
      type: "Receipt" as const,
      productId: pAlu.id,
      warehouseId: whMain.id,
      qtyChange: 100,
      refDoc: "RCPT-0001",
    },
    {
      id: uuid(),
      date: daysAgo(8),
      type: "Transfer Out" as const,
      productId: pSteel.id,
      warehouseId: whMain.id,
      qtyChange: -200,
      refDoc: "TRF-0001",
    },
    {
      id: uuid(),
      date: daysAgo(8),
      type: "Transfer In" as const,
      productId: pSteel.id,
      warehouseId: whProd.id,
      qtyChange: 200,
      refDoc: "TRF-0001",
    },
    {
      id: uuid(),
      date: daysAgo(7),
      type: "Delivery" as const,
      productId: pSteel.id,
      warehouseId: whMain.id,
      qtyChange: -150,
      refDoc: "DLVR-0001",
    },
    {
      id: uuid(),
      date: daysAgo(6),
      type: "Receipt" as const,
      productId: pBolt.id,
      warehouseId: whMain.id,
      qtyChange: 300,
      refDoc: "RCPT-0002",
    },
    {
      id: uuid(),
      date: daysAgo(5),
      type: "Adjustment" as const,
      productId: pDegreaser.id,
      warehouseId: whProd.id,
      qtyChange: -5,
      refDoc: "ADJ-0002",
    },
  ];

  return {
    users,
    otps: [],
    warehouses,
    categories,
    products,
    stock,
    receipts,
    deliveries,
    transfers,
    adjustments,
    ledger,
    counters: { receipt: 5, delivery: 5, transfer: 4, adjustment: 3 },
  };
}

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  let reseed = false;
  if (!fs.existsSync(DATA_FILE)) {
    reseed = true;
  } else {
    try {
      const existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as DBSchema;
      if (!existing.products || existing.products.length < 5) {
        reseed = true;
      }
    } catch {
      reseed = true;
    }
  }
  if (reseed) {
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

export function nextDocNumber(db: DBSchema, key: string, prefix: string): string {
  db.counters[key] = (db.counters[key] ?? 0) + 1;
  return `${prefix}-${String(db.counters[key]).padStart(4, "0")}`;
}

export { uuid };
