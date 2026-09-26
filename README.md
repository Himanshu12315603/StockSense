# StockSense — Inventory Management System

A modular IMS that replaces manual registers, Excel sheets and scattered
tracking with a single, real-time app: products, receipts, delivery orders,
internal transfers, stock adjustments, a full movement ledger, and a
dashboard tying it all together.

Built for the hackathon brief in `StockSense.pdf`.

## Stack

- **Frontend:** React + TypeScript (Vite), React Router, Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Data store:** a lightweight file-based JSON store (`backend/src/data/db.json`) —
  no database server to install, no native build step, so it runs anywhere Node
  runs. Swap in Postgres/Mongo later without touching route logic, since every
  route only talks to `readDB()` / `writeDB()`.
- **Auth:** JWT sessions, bcrypt password hashing, OTP-based password reset
  (the OTP is returned in the API response and logged to the server console,
  since no email provider is wired up for the demo — see `backend/src/routes/auth.ts`)

## Project structure

```
stocksense/
├── backend/           Express + TypeScript API
│   └── src/
│       ├── routes/    auth, products, warehouses, receipts, deliveries,
│       │              transfers, adjustments, ledger, dashboard
│       ├── db.ts       JSON datastore + seed data
│       ├── stockHelpers.ts   shared stock-mutation + ledger logic
│       └── server.ts   Express app entry point
└── frontend/          React + TypeScript (Vite) app
    └── src/
        ├── pages/      one page per screen (Dashboard, Products, Receipts…)
        ├── components/ Sidebar, Topbar, KpiCard, FilterBar, Modal, etc.
        ├── context/     AuthContext (login/signup/logout state)
        └── api/         typed fetch client
```

## Running it locally

You'll need Node.js 18+ installed. Two terminals — one for each half of the app.

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API starts on **http://localhost:4000**. On first run it creates
`src/data/db.json` seeded with 3 warehouses, 3 categories, 3 products, and a
demo user:

```
email: demo@stocksense.app
password: password123
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app starts on **http://localhost:5173** and talks to the API above. Log
in with the demo user (pre-filled on the login screen) or sign up a new
account.

## How the core flows map to the brief

| Brief step | Where it lives |
|---|---|
| Sign up / log in, OTP password reset | `Login`, `Signup`, `ForgotPassword` pages → `/api/auth/*` |
| Dashboard KPIs + dynamic filters | `Dashboard` page → `/api/dashboard/kpis`, `/api/dashboard/documents` |
| Product management, reordering rules | `Products` page → `/api/products`, `/api/products/categories` |
| Receipts (incoming), stock +qty on validate | `Receipts` page → `/api/receipts/:id/validate` |
| Delivery orders (pick → pack → validate), stock -qty | `DeliveryOrders` page → `/api/deliveries/:id/ready`, `/validate` |
| Internal transfers (location changes, total stock unchanged) | `Transfers` page → `/api/transfers/:id/validate` |
| Stock adjustments (system vs. counted) | `Adjustments` page → `/api/adjustments/:id/validate` |
| Move history / stock ledger | `MoveHistory` page → `/api/ledger` |
| Multi-warehouse, low-stock alerts, SKU search | `Warehouses` settings page; low-stock flag on `Products`; search + filters throughout |

## Notes for the demo

- Every validate action (receipt, delivery, transfer, adjustment) writes to
  a single ledger, so `Move History` is a full audit trail of every
  quantity change and what caused it — this is the same ledger the
  "Simplified Example" in the brief walks through (receive → transfer →
  deliver → adjust for damage).
- The JSON datastore is genuinely persisted to disk between restarts, so
  your seed/demo data survives a restart — just don't run multiple backend
  instances against the same file at once.
- To reset all demo data, stop the backend and delete
  `backend/src/data/db.json`; it will be reseeded on the next start.
