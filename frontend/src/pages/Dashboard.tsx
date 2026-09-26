import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { DashboardDocRow, DashboardKpis, Warehouse } from "../types";
import KpiCard from "../components/KpiCard";
import FilterBar from "../components/FilterBar";
import StatusBadge from "../components/StatusBadge";

const DOC_TYPES = ["Receipt", "Delivery", "Internal", "Adjustment"];
const STATUSES = ["Draft", "Waiting", "Ready", "Done", "Canceled"];

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [docs, setDocs] = useState<DashboardDocRow[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
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
      { key: "docType", label: "Document type", options: DOC_TYPES.map((v) => ({ value: v, label: v })) },
      { key: "status", label: "Status", options: STATUSES.map((v) => ({ value: v, label: v })) },
      {
        key: "warehouseId",
        label: "Warehouse",
        options: warehouses.map((w) => ({ value: w.id, label: w.name })),
      },
    ],
    [warehouses]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total products in stock" value={kpis?.totalProducts ?? "—"} accent="ink" />
        <KpiCard label="Low stock / out of stock" value={kpis ? kpis.lowStock + kpis.outOfStock : "—"} accent="amber" />
        <KpiCard label="Pending receipts" value={kpis?.pendingReceipts ?? "—"} accent="brand" />
        <KpiCard label="Pending deliveries" value={kpis?.pendingDeliveries ?? "—"} accent="brick" />
        <KpiCard label="Transfers scheduled" value={kpis?.scheduledTransfers ?? "—"} accent="moss" />
      </div>

      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
      />

      <div className="border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Warehouse</th>
              <th className="px-4 py-3 font-medium">Partner</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && docs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  No documents match these filters.
                </td>
              </tr>
            )}
            {docs.map((d) => (
              <tr key={`${d.docType}-${d.id}`} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3 font-medium text-ink">{d.number}</td>
                <td className="px-4 py-3 text-ink/80">{d.docType}</td>
                <td className="px-4 py-3 text-ink/80">{d.warehouseName}</td>
                <td className="px-4 py-3 text-ink/80">{d.partner}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3 text-muted">{new Date(d.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
