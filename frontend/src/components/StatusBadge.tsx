import React from "react";
import { DocStatus } from "../types";
import { Clock, CheckCircle2, AlertCircle, XCircle, Sparkles } from "lucide-react";

interface StatusBadgeProps {
  status: DocStatus | "In Stock" | "Low Stock" | "Out of Stock" | string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const py = size === "sm" ? "py-0.5 px-2 text-xs" : "py-1 px-2.5 text-xs font-medium";

  switch (status) {
    case "Draft":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 text-slate-300 ${py}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
          Draft
        </span>
      );
    case "Waiting":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 ${py}`}>
          <Clock className="h-3 w-3 text-amber-400 animate-spin-slow" />
          Waiting
        </span>
      );
    case "Ready":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 text-indigo-300 ${py}`}>
          <Sparkles className="h-3 w-3 text-indigo-400" />
          Ready
        </span>
      );
    case "Done":
    case "In Stock":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 ${py}`}>
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          {status === "In Stock" ? "In Stock" : "Done"}
        </span>
      );
    case "Low Stock":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 animate-pulse-subtle ${py}`}>
          <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
          Low Stock
        </span>
      );
    case "Out of Stock":
    case "Canceled":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 text-rose-300 ${py}`}>
          <XCircle className="h-3.5 w-3.5 text-rose-400" />
          {status === "Out of Stock" ? "Out of Stock" : "Canceled"}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 ${py}`}>
          {status}
        </span>
      );
  }
}
