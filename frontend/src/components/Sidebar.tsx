import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  SlidersHorizontal,
  History,
  Warehouse,
  User,
  LogOut,
  Boxes,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { DashboardKpis } from "../types";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);

  useEffect(() => {
    api
      .get<DashboardKpis>("/dashboard/kpis")
      .then(setKpis)
      .catch(() => null);
  }, [location.pathname]);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Products & Stock", path: "/products", icon: Package, badge: kpis?.lowStock ? `${kpis.lowStock} low` : null, badgeColor: "amber" },
    { label: "Receipts (Inbound)", path: "/receipts", icon: ArrowDownLeft, badge: kpis?.pendingReceipts ? String(kpis.pendingReceipts) : null, badgeColor: "indigo" },
    { label: "Deliveries (Outbound)", path: "/deliveries", icon: ArrowUpRight, badge: kpis?.pendingDeliveries ? String(kpis.pendingDeliveries) : null, badgeColor: "indigo" },
    { label: "Internal Transfers", path: "/transfers", icon: Repeat, badge: kpis?.scheduledTransfers ? String(kpis.scheduledTransfers) : null, badgeColor: "indigo" },
    { label: "Inventory Audit", path: "/adjustments", icon: SlidersHorizontal },
    { label: "Move History", path: "/history", icon: History },
    { label: "Warehouses", path: "/warehouses", icon: Warehouse },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col h-screen select-none shrink-0 relative z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-surface-border flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-lg text-white font-display tracking-tight">StockSense</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              IMS
            </span>
          </div>
          <p className="text-xs text-slate-400">Inventory Telemetry</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-600/20 text-white border border-indigo-500/30 shadow-md shadow-indigo-500/5 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor === "amber"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "User"}</p>
            <p className="text-[10px] text-indigo-400 font-medium truncate">{user?.role || "Staff"}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Log out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
