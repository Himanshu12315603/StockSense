import React, { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { Warehouse } from "../types";
import Modal from "../components/Modal";
import { Warehouse as WarehouseIcon, MapPin, Plus, Building, Tag } from "lucide-react";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<{ warehouses: Warehouse[] }>("/warehouses")
      .then((res) => setWarehouses(res.warehouses))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <WarehouseIcon className="h-6 w-6 text-indigo-400" />
            Facility & Warehouse Locations
          </h1>
          <p className="text-xs text-slate-400">Configure logistics hubs, production floors, and regional depots</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Warehouse Location
        </button>
      </div>

      {/* Grid of Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Loading warehouse facilities...
          </div>
        )}
        {!loading && warehouses.length === 0 && (
          <div className="col-span-full glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
            No warehouses registered yet.
          </div>
        )}

        {!loading &&
          warehouses.map((w) => (
            <div
              key={w.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 shadow-xl group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Building className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 text-xs font-mono font-bold text-indigo-300 border border-slate-800">
                  <Tag className="h-3 w-3 text-indigo-400" />
                  {w.code}
                </span>
              </div>

              <h3 className="text-base font-bold text-white font-display group-hover:text-indigo-300 transition-colors">
                {w.name}
              </h3>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{w.location || "Location not specified"}</span>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
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
    <Modal title="Register New Warehouse Facility" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Warehouse Name</label>
          <input
            required
            placeholder="e.g. Central Hub Ludhiana"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Facility Code</label>
          <input
            required
            placeholder="e.g. WH-MAIN"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-300">City / Location Address</label>
          <input
            placeholder="e.g. Ludhiana, Punjab"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 mt-2"
        >
          {submitting ? "Registering..." : "Register Warehouse"}
        </button>
      </form>
    </Modal>
  );
}
