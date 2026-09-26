import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api/client";
import { Product, Receipt, Warehouse } from "../types";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import DocActions from "../components/DocActions";
import LineItemsEditor, { EditableLine } from "../components/LineItemsEditor";
import { ArrowDownLeft, Plus, Building2, Warehouse as WarehouseIcon, PackageCheck } from "lucide-react";

const STATUSES = ["Draft", "Waiting", "Ready", "Done", "Canceled"];

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.warehouseId) params.set("warehouseId", filters.warehouseId);
    api
      .get<{ receipts: Receipt[] }>(`/receipts?${params.toString()}`)
      .then((res) => setReceipts(res.receipts))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.get<{ warehouses: Warehouse[] }>("/warehouses").then((res) => setWarehouses(res.warehouses));
    api.get<{ products: Product[] }>("/products").then((res) => setProducts(res.products));
  }, []);

  useEffect(load, [filters]);

  const filterConfig = useMemo(
    () => [
      { key: "status", label: "Status", options: STATUSES.map((v) => ({ value: v, label: v })) },
      { key: "warehouseId", label: "Target Warehouse", options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
    ],
    [warehouses]
  );

  function getProductName(id: string) {
    return products.find((p) => p.id === id)?.name ?? id;
  }
  function getWarehouseName(id: string) {
    return warehouses.find((w) => w.id === id)?.name ?? "Warehouse";
  }

  async function validate(id: string) {
    setBusyId(id);
    try {
      await api.post(`/receipts/${id}/validate`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not validate this receipt");
    } finally {
      setBusyId(null);
    }
  }

  async function cancel(id: string) {
    setBusyId(id);
    try {
      await api.post(`/receipts/${id}/cancel`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not cancel this receipt");
    } finally {
      setBusyId(null);
    }
  }

  const filteredReceipts = receipts.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.number.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <ArrowDownLeft className="h-6 w-6 text-indigo-400" />
            Inbound Receipts
          </h1>
          <p className="text-xs text-slate-400">Manage vendor shipments and receive stock into warehouses</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Receipt
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by receipt # or supplier..."
        onReset={() => {
          setFilters({});
          setSearch("");
        }}
      />

      {/* Receipts Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Receipt #</th>
                <th className="px-5 py-3.5">Vendor / Supplier</th>
                <th className="px-5 py-3.5">Destination Warehouse</th>
                <th className="px-5 py-3.5">Line Items Received</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Loading receipts...
                  </td>
                </tr>
              )}
              {!loading && filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No receipts found matching these filters.
                  </td>
                </tr>
              )}
              {filteredReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold font-mono text-indigo-300">{r.number}</td>
                  <td className="px-5 py-3.5 font-semibold text-white flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {r.supplier}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <WarehouseIcon className="h-3.5 w-3.5 text-indigo-400" />
                      {getWarehouseName(r.warehouseId)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    <div className="space-y-0.5">
                      {r.lines.map((l, i) => (
                        <div key={i} className="text-[11px]">
                          <span className="text-slate-200 font-semibold">{getProductName(l.productId)}</span> —{" "}
                          <span className="font-mono text-indigo-300">{l.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DocActions
                      status={r.status}
                      busy={busyId === r.id}
                      validateLabel="Validate & Receive Stock"
                      onValidate={() => validate(r.id)}
                      onCancel={() => cancel(r.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateReceiptModal
          warehouses={warehouses}
          products={products}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreateReceiptModal({
  warehouses,
  products,
  onClose,
  onCreated,
}: {
  warehouses: Warehouse[];
  products: Product[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [supplier, setSupplier] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [lines, setLines] = useState<EditableLine[]>([{ productId: products[0]?.id ?? "", quantity: "10" }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/receipts", {
        supplier,
        warehouseId,
        lines: lines.map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create Inbound Receipt" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-semibold text-slate-300">Supplier / Vendor Name</label>
            <input
              required
              placeholder="e.g. Tata Steel Ltd"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-300">Destination Warehouse</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.location})
                </option>
              ))}
            </select>
          </div>
        </div>

        <LineItemsEditor products={products} lines={lines} onChange={setLines} />

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 mt-2"
        >
          {submitting ? "Creating Receipt..." : "Save Receipt (Draft)"}
        </button>
      </form>
    </Modal>
  );
}
