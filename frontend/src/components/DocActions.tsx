import React from "react";
import { DocStatus } from "../types";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  status: DocStatus;
  onValidate: () => void;
  onCancel: () => void;
  validateLabel?: string;
  busy?: boolean;
}

export default function DocActions({
  status,
  onValidate,
  onCancel,
  validateLabel = "Validate & Post Stock",
  busy,
}: Props) {
  if (status === "Done" || status === "Canceled") {
    return <span className="text-xs text-slate-500 font-medium italic">No actions available</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onValidate}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        {validateLabel}
      </button>

      <button
        onClick={onCancel}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 text-slate-300 border border-slate-700 text-xs font-medium transition-all disabled:opacity-50"
      >
        <XCircle className="h-3.5 w-3.5" />
        Cancel
      </button>
    </div>
  );
}
