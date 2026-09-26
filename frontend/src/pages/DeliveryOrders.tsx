import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api/client";
import { Delivery, Product, Warehouse } from "../types";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import LineItemsEditor, { EditableLine } from "../components/LineItemsEditor";

const STATUSES = ["Waiting", "Ready", "Done", "Canceled"];

export default function DeliveryOrders() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.warehouseId) params.set("warehouseId", filters.warehouseId);
    api
      .get<{ deliveries: Delivery[] }>(`/deliveries?${params.toString()}`)
      .then((res) => setDeliveries(res.deliveries))
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
      { key: "warehouseId", label: "Warehouse", options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
    ],
    [warehouses]
  );

  function productName(id: string) {
    return products.find((p) => p.id === id)?.name ?? id;
  }

  async function act(id: string, action: "ready" | "validate" | "cancel") {
    setBusyId(id);
    try {
      await api.post(`/deliveries/${id}/${action}`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : `Could not ${action} this delivery order`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FilterBar filters={filterConfig} values={filters} onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))} />
        <button
          onClick={() => setShowCreate(true)}
          className="focus-ring ml-4 h-9 shrink-0 bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + New delivery order
        </button>
      </div>

      <div className="border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Delivery</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Lines</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">Loading…</td></tr>
            )}
            {!loading && deliveries.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No delivery orders yet.</td></tr>
            )}
            {deliveries.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0 hover:bg-paper align-top">
                <td className="px-4 py-3 font-medium text-ink">{d.number}</td>
                <td className="px-4 py-3 text-ink/80">{d.customer}</td>
                <td className="px-4 py-3 text-ink/80">
                  {d.lines.map((l, i) => (
                    <div key={i}>{productName(l.productId)} — {l.quantity}</div>
                  ))}
                </td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3">
                  {d.status === "Waiting" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(d.id, "ready")}
                        disabled={busyId === d.id}
                        className="focus-ring h-8 bg-brand px-3 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                      >
                        Mark picked &amp; packed
                      </button>
                      <button
                        onClick={() => act(d.id, "cancel")}
                        disabled={busyId === d.id}
                        className="focus-ring h-8 border border-line px-3 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {d.status === "Ready" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(d.id, "validate")}
                        disabled={busyId === d.id}
                        className="focus-ring h-8 bg-moss px-3 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Validate (ship)
                      </button>
                      <button
                        onClick={() => act(d.id, "cancel")}
                        disabled={busyId === d.id}
                        className="focus-ring h-8 border border-line px-3 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {(d.status === "Done" || d.status === "Canceled") && (
                    <span className="text-xs text-muted">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateDeliveryModal
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

function CreateDeliveryModal({
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
  const [customer, setCustomer] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [lines, setLines] = useState<EditableLine[]>([{ productId: products[0]?.id ?? "", quantity: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/deliveries", {
        customer,
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
    <Modal title="New delivery order" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="border border-brick bg-brick-light px-3 py-2 text-sm text-brick">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-muted">Customer</label>
            <input
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Ship from warehouse</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
        <LineItemsEditor products={products} lines={lines} onChange={setLines} />
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring h-10 w-full bg-brand text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create delivery order"}
        </button>
      </form>
    </Modal>
  );
}
