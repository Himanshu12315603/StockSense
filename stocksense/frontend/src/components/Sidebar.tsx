import React from "react";
import { NavLink } from "react-router-dom";

const ICONS: Record<string, JSX.Element> = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
  receipts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 3h16v18l-3-2-3 2-3-2-3 2-4-2V3z" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  ),
  delivery: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="7" width="14" height="10" />
      <path d="M15 10h4l3 3v4h-7z" />
      <circle cx="5.5" cy="19" r="1.6" />
      <circle cx="17.5" cy="19" r="1.6" />
    </svg>
  ),
  transfer: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  ),
  adjustment: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v6M12 21v-6M4.2 7.8l4.2 2.4M15.6 13.8l4.2 2.4M19.8 7.8l-4.2 2.4M8.4 13.8l-4.2 2.4" />
    </svg>
  ),
  history: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 2h6" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06A1.7 1.7 0 0015 19.4a1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.09A1.7 1.7 0 009 19.4a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.55-1H3a2 2 0 110-4h.09A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.55V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9a1.7 1.7 0 001.55 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z" />
    </svg>
  ),
};

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/products", label: "Products", icon: "products" },
  { to: "/receipts", label: "Receipts", icon: "receipts" },
  { to: "/deliveries", label: "Delivery Orders", icon: "delivery" },
  { to: "/transfers", label: "Internal Transfers", icon: "transfer" },
  { to: "/adjustments", label: "Inventory Adjustment", icon: "adjustment" },
  { to: "/history", label: "Move History", icon: "history" },
  { to: "/warehouses", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-line bg-panel">
      <div className="flex items-center gap-2 border-b border-line px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center bg-ink text-paper font-display text-sm font-bold">
          S
        </div>
        <span className="font-display text-lg font-semibold text-ink">StockSense</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                isActive ? "bg-brand-light font-medium text-brand-dark" : "text-ink/80 hover:bg-paper"
              }`
            }
          >
            {ICONS[item.icon]}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
