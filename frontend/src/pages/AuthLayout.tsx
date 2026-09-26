import React from "react";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center bg-brand font-display text-base font-bold text-white">
            S
          </div>
          <span className="font-display text-xl font-semibold text-white">StockSense</span>
        </div>
        <div className="bg-panel px-6 py-7">
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
