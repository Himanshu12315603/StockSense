import React from "react";
import { Boxes, ShieldCheck, Activity, Layers, ArrowRight } from "lucide-react";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Hero Section (Visual Feature Highlights) */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Boxes className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white font-display tracking-tight">StockSense</h1>
                <p className="text-xs text-indigo-400 font-medium">Enterprise Inventory IMS</p>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white font-display leading-tight tracking-tight mb-4">
              Real-Time Stock Telemetry & Multi-Warehouse Control.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-8">
              Seamlessly manage inbound vendor receipts, pick &amp; pack outbound deliveries, inter-warehouse movements, and physical stock count reconciliations.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Inventory Auditing</h4>
                  <p className="text-[11px] text-slate-400">Automatic ledger entries for every receipt, delivery &amp; transfer.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Reorder Point Telemetry</h4>
                  <p className="text-[11px] text-slate-400">Instant low stock warnings before items run out.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>StockSense IMS v1.0</span>
            <span className="text-indigo-400 font-semibold flex items-center gap-1">
              Odyssey Hackathon Demo <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-slate-950/90">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white font-display tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
