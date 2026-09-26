import React from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface Props {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export default function FilterBar({ filters, values, onChange, search, onSearchChange, searchPlaceholder }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 border border-line bg-panel px-4 py-3">
      {onSearchChange && (
        <input
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder ?? "Search"}
          className="focus-ring h-9 w-52 border border-line bg-paper px-3 text-sm text-ink placeholder:text-muted"
        />
      )}
      {filters.map((f) => (
        <select
          key={f.key}
          value={values[f.key] ?? ""}
          onChange={(e) => onChange(f.key, e.target.value)}
          className="focus-ring h-9 border border-line bg-paper px-2 text-sm text-ink"
        >
          <option value="">{f.label}: All</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
