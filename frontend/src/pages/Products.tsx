import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api/client";
import { Category, Product, Warehouse } from "../types";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import {
  Package,
  Plus,
  LayoutGrid,
  List,
  Warehouse as WarehouseIcon,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Tag,
} from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (search) params.set("search", search);
    api
      .get<{ products: Product[] }>(`/products?${params.toString()}`)
      .then((res) => setProducts(res.products))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.get<{ categories: Category[] }>("/products/categories/all").then((res) => setCategories(res.categories));
    api.get<{ warehouses: Warehouse[] }>("/warehouses").then((res) => setWarehouses(res.warehouses));
  }, []);

  useEffect(load, [filters, search]);

  const filterConfig = useMemo(
    () => [{ key: "categoryId", label: "Category", options: categories.map((c) => ({ value: c.id, label: c.name })) }],
    [categories]
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-400" />
            Product Catalog & Inventory
          </h1>
          <p className="text-xs text-slate-400">Track SKUs, reorder levels, and location stock distribution</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter by name, SKU or keyword..."
        onReset={() => {
          setFilters({});
          setSearch("");
        }}
      />

      {/* Grid Mode View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-medium">
              Loading product catalog...
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="col-span-full glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
              No products found matching your filters.
            </div>
          )}

          {!loading &&
            products.map((p) => {
              const status = p.totalStock === 0 ? "Out of Stock" : p.lowStock ? "Low Stock" : "In Stock";

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`glass-card p-5 rounded-2xl border transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                    p.lowStock || p.totalStock === 0
                      ? "border-amber-500/30 hover:border-amber-500/50 shadow-lg shadow-amber-500/5"
                      : "border-slate-800 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 text-[10px] font-mono font-bold text-slate-400 border border-slate-800">
                      <Tag className="h-3 w-3 text-indigo-400" />
                      {p.sku}
                    </span>
                    <StatusBadge status={status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-white font-display line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Stock</p>
                      <p
                        className={`text-lg font-extrabold font-display ${
                          p.totalStock === 0
                            ? "text-rose-400"
                            : p.lowStock
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {p.totalStock} <span className="text-xs font-normal text-slate-400">{p.uom}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Reorder Min</p>
                      <p className="text-xs font-semibold text-slate-300">{p.reorderPoint} {p.uom}</p>
                    </div>
                  </div>

                  {/* Stock Locations preview */}
                  <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center gap-1 text-[10px]">
                    <WarehouseIcon className="h-3 w-3 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {p.stockByWarehouse.length > 0
                        ? `${p.stockByWarehouse.length} Warehouse Location(s)`
                        : "No warehouse stock"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Table Mode View */}
      {viewMode === "table" && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Product Name</th>
                  <th className="px-5 py-3.5">SKU Code</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">UoM</th>
                  <th className="px-5 py-3.5">Stock by Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Total Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      Loading products...
                    </td>
                  </tr>
                )}
                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                )}
                {products.map((p) => {
                  const status = p.totalStock === 0 ? "Out of Stock" : p.lowStock ? "Low Stock" : "In Stock";

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-bold text-white">{p.name}</td>
                      <td className="px-5 py-3.5 font-mono text-indigo-300 font-bold">{p.sku}</td>
                      <td className="px-5 py-3.5 text-slate-300">{p.category}</td>
                      <td className="px-5 py-3.5 text-slate-400">{p.uom}</td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {p.stockByWarehouse.map((s) => (
                          <div key={s.warehouseId} className="text-[11px]">
                            <span className="text-slate-300 font-semibold">{s.warehouseName}:</span> {s.quantity} {p.uom}
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-sm font-display text-white">
                        {p.totalStock} <span className="text-xs font-normal text-slate-400">{p.uom}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal title={selectedProduct.name} onClose={() => setSelectedProduct(null)} wide>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">SKU Code</span>
                <p className="font-mono text-sm font-bold text-indigo-300 mt-0.5">{selectedProduct.sku}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Category</span>
                <p className="text-sm font-semibold text-white mt-0.5">{selectedProduct.category}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Stock</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {selectedProduct.totalStock} {selectedProduct.uom}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Reorder Point</span>
                <p className="text-sm font-semibold text-amber-400 mt-0.5">
                  {selectedProduct.reorderPoint} {selectedProduct.uom}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <WarehouseIcon className="h-4 w-4 text-indigo-400" />
                Warehouse Stock Breakdown
              </h4>

              <div className="space-y-2">
                {selectedProduct.stockByWarehouse.length === 0 && (
                  <p className="text-slate-500 py-3 text-center">No stock lines recorded for this product yet.</p>
                )}
                {selectedProduct.stockByWarehouse.map((s) => (
                  <div
                    key={s.warehouseId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800"
                  >
                    <span className="font-semibold text-slate-200">{s.warehouseName}</span>
                    <span className="font-bold font-mono text-indigo-300 text-sm">
                      {s.quantity} {selectedProduct.uom}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New Product Modal */}
      {showCreate && (
        <CreateProductModal
          categories={categories}
          warehouses={warehouses}
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

function CreateProductModal({
  categories,
  warehouses,
  onClose,
  onCreated,
}: {
  categories: Category[];
  warehouses: Warehouse[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [uom, setUom] = useState("pcs");
  const [reorderPoint, setReorderPoint] = useState("10");
  const [initialStock, setInitialStock] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function generateSku() {
    if (!name) return;
    const clean = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    const rand = Math.floor(10 + Math.random() * 90);
    setSku(`SKU-${clean}-${rand}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let finalCategoryId = categoryId;
      if (!finalCategoryId && newCategory) {
        const res = await api.post<{ category: Category }>("/products/categories", { name: newCategory });
        finalCategoryId = res.category.id;
      }
      await api.post("/products", {
        name,
        sku,
        categoryId: finalCategoryId,
        uom,
        reorderPoint: Number(reorderPoint) || 0,
        initialStock: initialStock ? Number(initialStock) : undefined,
        warehouseId: initialStock ? warehouseId : undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add New Product to Catalog" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block font-semibold text-slate-300">Product Name</label>
            <input
              required
              placeholder="e.g. High-grade Steel Rods 12mm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">SKU / Code</label>
              <button
                type="button"
                onClick={generateSku}
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Auto-generate
              </button>
            </div>
            <input
              required
              placeholder="e.g. STL-ROD-12"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-300">Unit of Measure (UoM)</label>
            <input
              required
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              placeholder="pcs, kg, sqm, rolls, boxes..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-300">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">+ Add New Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {!categoryId && (
              <input
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Category Name"
                className="mt-2 w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-300">Reorder Threshold Min</label>
            <input
              type="number"
              min={0}
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-800">
            <span className="font-bold text-slate-200">Initial Stock Pre-fill (Optional)</span>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-400">Initial Quantity</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-400">Target Warehouse</label>
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
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 mt-2"
        >
          {submitting ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </Modal>
  );
}
