import React from "react";
import { DocStatus } from "../types";

const STYLES: Record<DocStatus, { dot: string; text: string }> = {
  Draft: { dot: "bg-muted", text: "text-muted" },
  Waiting: { dot: "bg-amber", text: "text-amber" },
  Ready: { dot: "bg-brand", text: "text-brand" },
  Done: { dot: "bg-moss", text: "text-moss" },
  Canceled: { dot: "bg-brick", text: "text-brick" },
};

export default function StatusBadge({ status }: { status: DocStatus }) {
  const style = STYLES[status] ?? STYLES.Draft;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span className={style.text}>{status}</span>
    </span>
  );
}
