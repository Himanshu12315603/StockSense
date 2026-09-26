import React from "react";
import { Product } from "../types";
import { Plus, Trash2, Package } from "lucide-react";

export interface EditableLine {
  productId: string;
  quantity: string;
}

interface Props {
  products: Product[];
  lines: EditableLine[];
  onChange: (lines: EditableLine[]) => void;
}

export default function LineItemsEditor({ products, lines, onChange }: Props) {
  function updateLine(index: number, patch: Partial<EditableLine>) {
    const next = lines.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function addLine() {
    const defaultProduct = products[0]?.id ?? "";
    onChange([...lines, { productId: defaultProduct, quantity: "1" }]);
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-indigo-400" />
          Document Line Items
        </label>
        <span className="text-xs text-slate-500 font-mono">{lines.length} Line(s)</span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {lines.map((line, i) => {
          const selectedProduct = products.find((p) => p.id === line.productId);
          return (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex-1">
                <select
                  value={line.productId}
                  onChange={(e) => updateLine(i, { productId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.sku}] — Total Stock: {p.totalStock} {p.uom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-28 flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 font-mono">{selectedProduct?.uom || "pcs"}</span>
              </div>

              <button
                type="button"
                onClick={() => removeLine(i)}
                disabled={lines.length === 1}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 transition-colors"
                title="Remove line item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addLine}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors pt-1"
      >
        <Plus className="h-4 w-4" />
        Add another line item
      </button>
    </div>
  );
}
