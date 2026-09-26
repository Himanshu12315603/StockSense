import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api/client";
import { Category, Product, Warehouse } from "../types";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

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
      <div className="flex items-center justify-between">
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or SKU"
        />
        <button
          onClick={() => setShowCreate(true)}
          className="focus-ring ml-4 h-9 shrink-0 bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + New product
        </button>
      </div>

      <div className="border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">UoM</th>
              <th className="px-4 py-3 font-medium">Stock by location</th>
              <th className="px-4 py-3 font-medium">Total stock</th>
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
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  No products yet. Create your first one.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper align-top">
                <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-4 py-3 text-ink/80">{p.sku}</td>
                <td className="px-4 py-3 text-ink/80">{p.category}</td>
                <td className="px-4 py-3 text-ink/80">{p.uom}</td>
                <td className="px-4 py-3 text-ink/80">
                  {p.stockByWarehouse.length === 0 && <span className="text-muted">No stock recorded</span>}
                  {p.stockByWarehouse.map((s) => (
                    <div key={s.warehouseId}>
                      {s.warehouseName}: {s.quantity} {p.uom}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <span className={p.lowStock ? "font-medium text-amber" : "text-ink"}>
                    {p.totalStock} {p.uom}
                  </span>
                  {p.lowStock && <div className="text-xs text-amber">Below reorder point ({p.reorderPoint})</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
  const [reorderPoint, setReorderPoint] = useState("0");
  const [initialStock, setInitialStock] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <Modal title="New product" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="border border-brick bg-brick-light px-3 py-2 text-sm text-brick">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-sm text-muted">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">SKU / Code</label>
            <input
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Unit of measure</label>
            <input
              required
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              placeholder="pcs, kg, m…"
              className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
            >
              <option value="">New category…</option>
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
                placeholder="New category name"
                className="focus-ring mt-2 h-10 w-full border border-line bg-paper px-3 text-sm"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Reordering rule (min qty)</label>
            <input
              type="number"
              min={0}
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
              className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
            />
          </div>
          <div className="col-span-2 border-t border-line pt-3 text-sm font-medium text-ink">
            Initial stock (optional)
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Quantity</label>
            <input
              type="number"
              min={0}
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
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
          className="focus-ring h-10 w-full bg-brand text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create product"}
        </button>
      </form>
    </Modal>
  );
}
