import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute, { AppShell } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Receipts from "./pages/Receipts";
import DeliveryOrders from "./pages/DeliveryOrders";
import Transfers from "./pages/Transfers";
import Adjustments from "./pages/Adjustments";
import MoveHistory from "./pages/MoveHistory";
import Warehouses from "./pages/Warehouses";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppShell title="Dashboard" />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/products" element={<AppShell title="Products" />}>
              <Route index element={<Products />} />
            </Route>
            <Route path="/receipts" element={<AppShell title="Receipts" />}>
              <Route index element={<Receipts />} />
            </Route>
            <Route path="/deliveries" element={<AppShell title="Delivery Orders" />}>
              <Route index element={<DeliveryOrders />} />
            </Route>
            <Route path="/transfers" element={<AppShell title="Internal Transfers" />}>
              <Route index element={<Transfers />} />
            </Route>
            <Route path="/adjustments" element={<AppShell title="Inventory Adjustment" />}>
              <Route index element={<Adjustments />} />
            </Route>
            <Route path="/history" element={<AppShell title="Move History" />}>
              <Route index element={<MoveHistory />} />
            </Route>
            <Route path="/warehouses" element={<AppShell title="Settings — Warehouses" />}>
              <Route index element={<Warehouses />} />
            </Route>
            <Route path="/profile" element={<AppShell title="My Profile" />}>
              <Route index element={<Profile />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
