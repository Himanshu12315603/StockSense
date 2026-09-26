import React from "react";
import { Product } from "../types";

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
    onChange([...lines, { productId: products[0]?.id ?? "", quantity: "" }]);
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm text-muted">Line items</label>
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            value={line.productId}
            onChange={(e) => updateLine(i, { productId: e.target.value })}
            className="focus-ring h-10 flex-1 border border-line bg-paper px-3 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            required
            placeholder="Qty"
            value={line.quantity}
            onChange={(e) => updateLine(i, { quantity: e.target.value })}
            className="focus-ring h-10 w-24 border border-line bg-paper px-3 text-sm"
          />
          <button
            type="button"
            onClick={() => removeLine(i)}
            disabled={lines.length === 1}
            className="focus-ring h-10 w-10 text-muted hover:text-brick disabled:opacity-30"
            aria-label="Remove line"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={addLine} className="focus-ring text-sm text-brand hover:underline">
        + Add line
      </button>
    </div>
  );
}
