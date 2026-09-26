import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-lg space-y-6">
      <div className="border border-line bg-panel px-6 py-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center bg-brand-light font-display text-2xl font-semibold text-brand-dark">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </span>
          <div>
            <div className="font-display text-lg font-semibold text-ink">{user?.name}</div>
            <div className="text-sm text-muted">{user?.role}</div>
          </div>
        </div>
        <dl className="mt-6 space-y-3 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd className="text-ink">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Role</dt>
            <dd className="text-ink">{user?.role}</dd>
          </div>
        </dl>
      </div>
      <button
        onClick={logout}
        className="focus-ring h-10 border border-line px-4 text-sm font-medium text-brick hover:bg-brick-light"
      >
        Log out
      </button>
    </div>
  );
}
