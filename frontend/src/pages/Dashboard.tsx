import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { DashboardDocRow, DashboardKpis, Warehouse } from "../types";
import KpiCard from "../components/KpiCard";
import FilterBar from "../components/FilterBar";
import StatusBadge from "../components/StatusBadge";
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Plus,
  ArrowRight,
  Activity,
  Boxes,
  Layers,
  FileText,
} from "lucide-react";

const DOC_TYPES = ["Receipt", "Delivery", "Internal", "Adjustment"];
const STATUSES = ["Draft", "Waiting", "Ready", "Done", "Canceled"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [docs, setDocs] = useState<DashboardDocRow[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ warehouses: Warehouse[] }>("/warehouses").then((res) => setWarehouses(res.warehouses));
    api.get<DashboardKpis>("/dashboard/kpis").then(setKpis);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.docType) params.set("docType", filters.docType);
    if (filters.status) params.set("status", filters.status);
    if (filters.warehouseId) params.set("warehouseId", filters.warehouseId);
    api
      .get<{ documents: DashboardDocRow[] }>(`/dashboard/documents?${params.toString()}`)
      .then((res) => setDocs(res.documents))
      .finally(() => setLoading(false));
  }, [filters]);

  const filterConfig = useMemo(
    () => [
      { key: "docType", label: "Document Type", options: DOC_TYPES.map((v) => ({ value: v, label: v })) },
      { key: "status", label: "Status", options: STATUSES.map((v) => ({ value: v, label: v })) },
      {
        key: "warehouseId",
        label: "Warehouse",
        options: warehouses.map((w) => ({ value: w.id, label: w.name })),
      },
    ],
    [warehouses]
  );

  const filteredDocs = docs.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.number.toLowerCase().includes(q) ||
      d.partner.toLowerCase().includes(q) ||
      d.warehouseName.toLowerCase().includes(q) ||
      d.docType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
              Live Stock Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
            Warehouse Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time tracking for incoming receipts, outgoing delivery dispatch, inter-warehouse movements, and stock reconciliations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => navigate("/receipts")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Receipt
          </button>
          <button
            onClick={() => navigate("/deliveries")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
          >
            <Plus className="h-4 w-4" />
            New Delivery
          </button>
          <button
            onClick={() => navigate("/transfers")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
          >
            <Plus className="h-4 w-4" />
            Transfer Stock
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Products"
          value={kpis?.totalProducts ?? "—"}
          subtitle="Catalog SKUs tracked"
          icon={Package}
          accentColor="indigo"
          onClick={() => navigate("/products")}
        />
        <KpiCard
          title="Low & Out of Stock"
          value={kpis ? kpis.lowStock + kpis.outOfStock : "—"}
          subtitle={`${kpis?.outOfStock ?? 0} Out of Stock`}
          icon={AlertTriangle}
          trend={kpis && (kpis.lowStock + kpis.outOfStock > 0) ? "Action Needed" : "Optimal"}
          trendType={kpis && (kpis.lowStock + kpis.outOfStock > 0) ? "warning" : "up"}
          accentColor="amber"
          onClick={() => navigate("/products")}
        />
        <KpiCard
          title="Inbound Receipts"
          value={kpis?.pendingReceipts ?? "—"}
          subtitle="Pending validation"
          icon={ArrowDownLeft}
          accentColor="cyan"
          onClick={() => navigate("/receipts")}
        />
        <KpiCard
          title="Outbound Deliveries"
          value={kpis?.pendingDeliveries ?? "—"}
          subtitle="Orders to dispatch"
          icon={ArrowUpRight}
          accentColor="rose"
          onClick={() => navigate("/deliveries")}
        />
        <KpiCard
          title="Scheduled Transfers"
          value={kpis?.scheduledTransfers ?? "—"}
          subtitle="Inter-location movements"
          icon={Repeat}
          accentColor="emerald"
          onClick={() => navigate("/transfers")}
        />
      </div>

      {/* Operations Table Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Document Operations Feed
            </h3>
            <p className="text-xs text-slate-400">All receipts, delivery orders, internal transfers and adjustments</p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by document #, partner, warehouse..."
          onReset={() => {
            setFilters({});
            setSearch("");
          }}
        />

        {/* Documents Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Document #</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Warehouse Location</th>
                  <th className="px-5 py-3.5">Partner / Party</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      Loading StockSense operation feed...
                    </td>
                  </tr>
                )}
                {!loading && filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      No document operations match your current filters.
                    </td>
                  </tr>
                )}
                {filteredDocs.map((d) => {
                  const targetPath =
                    d.docType === "Receipt"
                      ? "/receipts"
                      : d.docType === "Delivery"
                      ? "/deliveries"
                      : d.docType === "Internal"
                      ? "/transfers"
                      : "/adjustments";

                  return (
                    <tr
                      key={`${d.docType}-${d.id}`}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => navigate(targetPath)}
                    >
                      <td className="px-5 py-3.5 font-bold font-mono text-indigo-300 group-hover:text-indigo-200">
                        {d.number}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          {d.docType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{d.warehouseName}</td>
                      <td className="px-5 py-3.5 text-slate-300 font-semibold">{d.partner}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {new Date(d.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-400 group-hover:text-indigo-300 font-semibold">
                          View
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
