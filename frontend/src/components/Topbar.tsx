import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  LogOut,
  Sliders,
  ChevronDown,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: "Low Stock Alert", desc: "Filing Cabinet 4-Drawer is out of stock in Main Warehouse", time: "10m ago", type: "warning" },
    { id: 2, title: "Receipt Validated", desc: "RCPT-0001 (Tata Steel Ltd) validated +600 items", time: "1h ago", type: "success" },
    { id: 3, title: "Transfer Pending", desc: "TRF-0003 waiting for dispatch approval", time: "3h ago", type: "info" },
  ];

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-surface-border px-6 flex items-center justify-between shrink-0 relative z-30">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>StockSense</span>
            <span>/</span>
            <span className="text-indigo-400 font-medium">{title}</span>
          </div>
          <h2 className="text-lg font-bold text-white font-display tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Warehouse Location Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <Warehouse className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-white">Central Hub Ludhiana</span>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden lg:block w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search SKUs, orders..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          <kbd className="absolute right-2.5 top-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">
            ⌘K
          </kbd>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-surface"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel shadow-2xl border border-slate-700/80 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-display">System Notifications</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-semibold">
                  3 New
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs">
                    {n.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-200">{n.title}</p>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/20">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-400">{user?.role}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl glass-panel shadow-2xl border border-slate-700/80 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[10px] text-indigo-400 font-medium">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full px-3 py-2 text-xs text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
              >
                <User className="h-3.5 w-3.5 text-indigo-400" />
                My Profile
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                  navigate("/login");
                }}
                className="w-full px-3 py-2 text-xs text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
