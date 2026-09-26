import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api/client";
import { Product, Receipt, Warehouse } from "../types";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import DocActions from "../components/DocActions";
import LineItemsEditor, { EditableLine } from "../components/LineItemsEditor";

const STATUSES = ["Draft", "Done", "Canceled"];

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
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
      { key: "warehouseId", label: "Warehouse", options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
    ],
    [warehouses]
  );

  function productName(id: string) {
    return products.find((p) => p.id === id)?.name ?? id;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FilterBar filters={filterConfig} values={filters} onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))} />
        <button
          onClick={() => setShowCreate(true)}
          className="focus-ring ml-4 h-9 shrink-0 bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + New receipt
        </button>
      </div>

      <div className="border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Receipt</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Lines</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">Loading…</td>
              </tr>
            )}
            {!loading && receipts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">No receipts yet.</td>
              </tr>
            )}
            {receipts.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-paper align-top">
                <td className="px-4 py-3 font-medium text-ink">{r.number}</td>
                <td className="px-4 py-3 text-ink/80">{r.supplier}</td>
                <td className="px-4 py-3 text-ink/80">
                  {r.lines.map((l, i) => (
                    <div key={i}>
                      {productName(l.productId)} — {l.quantity}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <DocActions
                    status={r.status}
                    busy={busyId === r.id}
                    validateLabel="Validate receipt"
                    onValidate={() => validate(r.id)}
                    onCancel={() => cancel(r.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
  const [lines, setLines] = useState<EditableLine[]>([{ productId: products[0]?.id ?? "", quantity: "" }]);
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
    <Modal title="New receipt" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="border border-brick bg-brick-light px-3 py-2 text-sm text-brick">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-muted">Supplier</label>
            <input
              required
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Warehouse</label>
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
          {submitting ? "Creating…" : "Create receipt (draft)"}
        </button>
      </form>
    </Modal>
  );
}
