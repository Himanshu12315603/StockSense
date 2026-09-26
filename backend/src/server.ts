import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import warehouseRoutes from "./routes/warehouses";
import receiptRoutes from "./routes/receipts";
import deliveryRoutes from "./routes/deliveries";
import transferRoutes from "./routes/transfers";
import adjustmentRoutes from "./routes/adjustments";
import ledgerRoutes from "./routes/ledger";
import dashboardRoutes from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "StockSense API" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`StockSense API listening on http://localhost:${PORT}`);
  console.log(`Demo login -> email: demo@stocksense.app / password: password123`);
});
