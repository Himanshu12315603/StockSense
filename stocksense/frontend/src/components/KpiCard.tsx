import React from "react";

interface Props {
  label: string;
  value: number | string;
  accent?: "brand" | "amber" | "brick" | "moss" | "ink";
}

const ACCENTS: Record<string, string> = {
  brand: "border-l-brand",
  amber: "border-l-amber",
  brick: "border-l-brick",
  moss: "border-l-moss",
  ink: "border-l-ink",
};

export default function KpiCard({ label, value, accent = "ink" }: Props) {
  return (
    <div className={`bg-panel border border-line border-l-4 ${ACCENTS[accent]} px-5 py-4`}>
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 font-display text-3xl font-semibold text-ink">{value}</div>
    </div>
  );
}
