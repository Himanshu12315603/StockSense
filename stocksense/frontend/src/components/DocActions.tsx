import React from "react";
import { DocStatus } from "../types";

interface Props {
  status: DocStatus;
  onValidate: () => void;
  onCancel: () => void;
  validateLabel?: string;
  busy?: boolean;
}

export default function DocActions({ status, onValidate, onCancel, validateLabel = "Validate", busy }: Props) {
  if (status === "Done" || status === "Canceled") return <span className="text-xs text-muted">No actions</span>;
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onValidate}
        disabled={busy}
        className="focus-ring h-8 bg-moss px-3 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {validateLabel}
      </button>
      <button
        onClick={onCancel}
        disabled={busy}
        className="focus-ring h-8 border border-line px-3 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
