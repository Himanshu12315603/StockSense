import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { LedgerEntry, Product, Warehouse } from "../types";
import FilterBar from "../components/FilterBar";
import { History, TrendingUp, TrendingDown, FileText, Warehouse as WarehouseIcon } from "lucide-react";

const TYPES = ["Receipt", "Delivery", "Transfer In", "Transfer Out", "Adjustment"];

export default function MoveHistory() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ warehouses: Warehouse[] }>("/warehouses").then((res) => setWarehouses(res.warehouses));
    api.get<{ products: Product[] }>("/products").then((res) => setProducts(res.products));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.warehouseId) params.set("warehouseId", filters.warehouseId);
    if (filters.productId) params.set("productId", filters.productId);
    api
      .get<{ entries: LedgerEntry[] }>(`/ledger?${params.toString()}`)
      .then((res) => setEntries(res.entries))
      .finally(() => setLoading(false));
  }, [filters]);

  const filterConfig = useMemo(
    () => [
      { key: "type", label: "Movement Type", options: TYPES.map((v) => ({ value: v, label: v })) },
      { key: "warehouseId", label: "Warehouse", options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
      { key: "productId", label: "Product", options: products.map((p) => ({ value: p.id, label: p.name })) },
    ],
    [warehouses, products]
  );

  const filteredEntries = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.refDoc.toLowerCase().includes(q) ||
      e.productName.toLowerCase().includes(q) ||
      e.warehouseName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
          <History className="h-6 w-6 text-indigo-400" />
          Permanent Stock Movement Ledger
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Auditable ledger logging every stock transaction — receipts, deliveries, internal transfers, and count adjustments.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter ledger by ref doc # or product..."
        onReset={() => {
          setFilters({});
          setSearch("");
        }}
      />

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Movement Type</th>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Warehouse Location</th>
                <th className="px-5 py-3.5">Qty Change</th>
                <th className="px-5 py-3.5 text-right">Ref Document #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Loading ledger records...
                  </td>
                </tr>
              )}
              {!loading && filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No movement entries match the current filters.
                  </td>
                </tr>
              )}
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                    {new Date(e.date).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-[11px]">
                      {e.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-white">{e.productName}</td>
                  <td className="px-5 py-3.5 text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <WarehouseIcon className="h-3.5 w-3.5 text-indigo-400" />
                      {e.warehouseName}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {e.qtyChange >= 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono text-xs">
                        <TrendingUp className="h-3 w-3" /> +{e.qtyChange}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold font-mono text-xs">
                        <TrendingDown className="h-3 w-3" /> {e.qtyChange}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-indigo-300">
                    <span className="inline-flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      <FileText className="h-3 w-3 text-indigo-400" />
                      {e.refDoc}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
