import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { LedgerEntry, Product, Warehouse } from "../types";
import FilterBar from "../components/FilterBar";

const TYPES = ["Receipt", "Delivery", "Transfer In", "Transfer Out", "Adjustment"];

export default function MoveHistory() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
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
      { key: "type", label: "Movement type", options: TYPES.map((v) => ({ value: v, label: v })) },
      { key: "warehouseId", label: "Warehouse", options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
      { key: "productId", label: "Product", options: products.map((p) => ({ value: p.id, label: p.name })) },
    ],
    [warehouses, products]
  );

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted">
        Every stock movement — receipts, deliveries, transfers and adjustments — is logged here as a permanent
        ledger entry, so any quantity change can be traced back to the document that caused it.
      </p>

      <FilterBar filters={filterConfig} values={filters} onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))} />

      <div className="border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Warehouse</th>
              <th className="px-4 py-3 font-medium">Change</th>
              <th className="px-4 py-3 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">Loading…</td></tr>}
            {!loading && entries.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No movements match these filters.</td></tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3 text-muted">{new Date(e.date).toLocaleString()}</td>
                <td className="px-4 py-3 text-ink/80">{e.type}</td>
                <td className="px-4 py-3 text-ink/80">{e.productName}</td>
                <td className="px-4 py-3 text-ink/80">{e.warehouseName}</td>
                <td className={`px-4 py-3 font-medium ${e.qtyChange >= 0 ? "text-moss" : "text-brick"}`}>
                  {e.qtyChange >= 0 ? `+${e.qtyChange}` : e.qtyChange}
                </td>
                <td className="px-4 py-3 text-ink/80">{e.refDoc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
