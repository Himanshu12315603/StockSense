import React from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, ShieldCheck, LogOut, CheckCircle2, Building2 } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-xl space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-500/20 font-display">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">{user?.name}</h2>
            <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 mt-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {user?.role}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-400" />
              Email Address
            </span>
            <span className="font-semibold text-white font-mono">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-400" />
              Primary Hub Location
            </span>
            <span className="font-semibold text-white">Ludhiana Central Hub (WH-MAIN)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Account Status
            </span>
            <span className="font-bold text-emerald-400">Active &amp; Verified</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
