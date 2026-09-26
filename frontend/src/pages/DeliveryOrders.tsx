import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api/client";
import { Delivery, Product, Warehouse } from "../types";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import LineItemsEditor, { EditableLine } from "../components/LineItemsEditor";
import { ArrowUpRight, Plus, UserCheck, Warehouse as WarehouseIcon, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const STATUSES = ["Waiting", "Ready", "Done", "Canceled"];

export default function DeliveryOrders() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
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
      { key: "warehouseId", label: "Source Warehouse", options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
    ],
    [warehouses]
  );

  function getProductName(id: string) {
    return products.find((p) => p.id === id)?.name ?? id;
  }
  function getWarehouseName(id: string) {
    return warehouses.find((w) => w.id === id)?.name ?? "Warehouse";
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

  const filteredDeliveries = deliveries.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.number.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <ArrowUpRight className="h-6 w-6 text-rose-400" />
            Outbound Delivery Orders
          </h1>
          <p className="text-xs text-slate-400">Pick, pack, and ship customer orders with real-time stock deduction</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Delivery Order
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order # or customer..."
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
                <th className="px-5 py-3.5">Order #</th>
                <th className="px-5 py-3.5">Customer / Client</th>
                <th className="px-5 py-3.5">Dispatch Warehouse</th>
                <th className="px-5 py-3.5">Items Ordered</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Loading delivery orders...
                  </td>
                </tr>
              )}
              {!loading && filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No delivery orders found.
                  </td>
                </tr>
              )}
              {filteredDeliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold font-mono text-rose-300">{d.number}</td>
                  <td className="px-5 py-3.5 font-semibold text-white flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {d.customer}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <WarehouseIcon className="h-3.5 w-3.5 text-indigo-400" />
                      {getWarehouseName(d.warehouseId)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    <div className="space-y-0.5">
                      {d.lines.map((l, i) => (
                        <div key={i} className="text-[11px]">
                          <span className="text-slate-200 font-semibold">{getProductName(l.productId)}</span> —{" "}
                          <span className="font-mono text-rose-300">{l.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {d.status === "Waiting" && (
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => act(d.id, "ready")}
                          disabled={busyId === d.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
                        >
                          {busyId === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          Mark Picked & Packed
                        </button>
                        <button
                          onClick={() => act(d.id, "cancel")}
                          disabled={busyId === d.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Cancel Order"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {d.status === "Ready" && (
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => act(d.id, "validate")}
                          disabled={busyId === d.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                        >
                          {busyId === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Validate & Ship
                        </button>
                        <button
                          onClick={() => act(d.id, "cancel")}
                          disabled={busyId === d.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Cancel Order"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {(d.status === "Done" || d.status === "Canceled") && (
                      <span className="text-slate-500 italic text-[11px]">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
  const [lines, setLines] = useState<EditableLine[]>([{ productId: products[0]?.id ?? "", quantity: "5" }]);
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
    <Modal title="Create Outbound Delivery Order" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-semibold text-slate-300">Customer / Client Name</label>
            <input
              required
              placeholder="e.g. Apex Motors Pvt Ltd"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-300">Ship From Warehouse</label>
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
          {submitting ? "Creating Order..." : "Create Delivery Order (Waiting)"}
        </button>
      </form>
    </Modal>
  );
}
