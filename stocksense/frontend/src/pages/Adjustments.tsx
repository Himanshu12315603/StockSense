import React, { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { Adjustment, Product, Warehouse } from "../types";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import DocActions from "../components/DocActions";

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

  function whName(id: string) {
    return warehouses.find((w) => w.id === id)?.name ?? id;
  }
  function productName(id: string) {
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
      <div className="flex items-center justify-between">
        <p className="max-w-xl text-sm text-muted">
          Fix mismatches between recorded stock and a physical count. Select a product and location, enter what
          you counted, and StockSense works out the difference.
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="focus-ring ml-4 h-9 shrink-0 bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + New count
        </button>
      </div>

      <div className="border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Adjustment</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Warehouse</th>
              <th className="px-4 py-3 font-medium">System</th>
              <th className="px-4 py-3 font-medium">Counted</th>
              <th className="px-4 py-3 font-medium">Delta</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-6 text-center text-muted">Loading…</td></tr>}
            {!loading && adjustments.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-muted">No stock counts yet.</td></tr>
            )}
            {adjustments.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3 font-medium text-ink">{a.number}</td>
                <td className="px-4 py-3 text-ink/80">{productName(a.productId)}</td>
                <td className="px-4 py-3 text-ink/80">{whName(a.warehouseId)}</td>
                <td className="px-4 py-3 text-ink/80">{a.systemQty}</td>
                <td className="px-4 py-3 text-ink/80">{a.countedQty}</td>
                <td className={`px-4 py-3 font-medium ${a.delta === 0 ? "text-ink" : a.delta > 0 ? "text-moss" : "text-brick"}`}>
                  {a.delta > 0 ? `+${a.delta}` : a.delta}
                </td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  <DocActions
                    status={a.status}
                    busy={busyId === a.id}
                    validateLabel="Apply count"
                    onValidate={() => validate(a.id)}
                    onCancel={() => cancel(a.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    <Modal title="New stock count" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="border border-brick bg-brick-light px-3 py-2 text-sm text-brick">{error}</div>}
        <div>
          <label className="mb-1 block text-sm text-muted">Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          >
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Warehouse / location</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          >
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="border border-line bg-paper px-3 py-2 text-sm text-ink">
          Recorded stock here: <strong>{currentStock}</strong>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Counted quantity</label>
          <input
            type="number"
            required
            min={0}
            value={countedQty}
            onChange={(e) => setCountedQty(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring h-10 w-full bg-brand text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save count (draft)"}
        </button>
      </form>
    </Modal>
  );
}
