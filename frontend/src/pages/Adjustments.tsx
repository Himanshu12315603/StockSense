import React, { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { Adjustment, Product, Warehouse } from "../types";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import DocActions from "../components/DocActions";
import { SlidersHorizontal, Plus, Warehouse as WarehouseIcon, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<{ adjustments: Adjustment[] }>("/adjustments")
      .then((res) => setAdjustments(res.adjustments))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.get<{ warehouses: Warehouse[] }>("/warehouses").then((res) => setWarehouses(res.warehouses));
    api.get<{ products: Product[] }>("/products").then((res) => setProducts(res.products));
    load();
  }, []);

  function getWarehouseName(id: string) {
    return warehouses.find((w) => w.id === id)?.name ?? id;
  }
  function getProductName(id: string) {
    return products.find((p) => p.id === id)?.name ?? id;
  }

  async function validate(id: string) {
    setBusyId(id);
    try {
      await api.post(`/adjustments/${id}/validate`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not validate this adjustment");
    } finally {
      setBusyId(null);
    }
  }
  async function cancel(id: string) {
    setBusyId(id);
    try {
      await api.post(`/adjustments/${id}/cancel`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not cancel this adjustment");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-indigo-400" />
            Physical Inventory Audit & Reconciliation
          </h1>
          <p className="text-xs text-slate-400">Perform physical stock counts, calculate variance deltas, and adjust live balances</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          Log Stock Count
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Audit #</th>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Warehouse</th>
                <th className="px-5 py-3.5">System Qty</th>
                <th className="px-5 py-3.5">Counted Qty</th>
                <th className="px-5 py-3.5">Variance Delta</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    Loading stock adjustments...
                  </td>
                </tr>
              )}
              {!loading && adjustments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    No physical count adjustments recorded.
                  </td>
                </tr>
              )}
              {adjustments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold font-mono text-indigo-300">{a.number}</td>
                  <td className="px-5 py-3.5 font-bold text-white">{getProductName(a.productId)}</td>
                  <td className="px-5 py-3.5 text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <WarehouseIcon className="h-3.5 w-3.5 text-indigo-400" />
                      {getWarehouseName(a.warehouseId)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono">{a.systemQty}</td>
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-200">{a.countedQty}</td>
                  <td className="px-5 py-3.5">
                    {a.delta === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-mono">
                        <CheckCircle className="h-3 w-3" /> 0 (Match)
                      </span>
                    ) : a.delta > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold">
                        <TrendingUp className="h-3 w-3" /> +{a.delta}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-mono font-bold">
                        <TrendingDown className="h-3 w-3" /> {a.delta}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DocActions
                      status={a.status}
                      busy={busyId === a.id}
                      validateLabel="Apply Count & Reconcile"
                      onValidate={() => validate(a.id)}
                      onCancel={() => cancel(a.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showCreate && (
        <CreateAdjustmentModal
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

function CreateAdjustmentModal({
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
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [countedQty, setCountedQty] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentStock =
    products.find((p) => p.id === productId)?.stockByWarehouse.find((s) => s.warehouseId === warehouseId)
      ?.quantity ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/adjustments", { warehouseId, productId, countedQty: Number(countedQty) });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Log Physical Stock Count Audit" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Select Product to Audit</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Warehouse Location</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Current System Recorded Stock:</span>
          <span className="font-extrabold text-indigo-400 text-sm font-mono">{currentStock}</span>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Physically Counted Quantity</label>
          <input
            type="number"
            required
            min={0}
            placeholder="Enter exact count..."
            value={countedQty}
            onChange={(e) => setCountedQty(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 mt-2"
        >
          {submitting ? "Saving Audit..." : "Save Count Log (Draft)"}
        </button>
      </form>
    </Modal>
  );
}
