import React, { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { Warehouse } from "../types";
import Modal from "../components/Modal";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    api.get<{ warehouses: Warehouse[] }>("/warehouses").then((res) => setWarehouses(res.warehouses)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Warehouses</h2>
          <p className="text-sm text-muted">Locations stock can be received into, shipped from, or moved between.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="focus-ring h-9 shrink-0 bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + New warehouse
        </button>
      </div>

      <div className="border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Location</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={3} className="px-4 py-6 text-center text-muted">Loading…</td></tr>}
            {!loading && warehouses.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-muted">No warehouses yet.</td></tr>
            )}
            {warehouses.map((w) => (
              <tr key={w.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3 font-medium text-ink">{w.name}</td>
                <td className="px-4 py-3 text-ink/80">{w.code}</td>
                <td className="px-4 py-3 text-ink/80">{w.location || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateWarehouseModal
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

function CreateWarehouseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/warehouses", { name, code, location });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="New warehouse" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="border border-brick bg-brick-light px-3 py-2 text-sm text-brick">{error}</div>}
        <div>
          <label className="mb-1 block text-sm text-muted">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="WH-03"
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring h-10 w-full bg-brand text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create warehouse"}
        </button>
      </form>
    </Modal>
  );
}
