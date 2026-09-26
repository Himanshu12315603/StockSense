import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-panel px-6">
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="focus-ring flex items-center gap-2 px-2 py-1 text-sm"
        >
          <span className="flex h-8 w-8 items-center justify-center bg-brand-light font-display font-semibold text-brand-dark">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </span>
          <span className="text-ink">{user?.name}</span>
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-1 w-48 border border-line bg-panel py-1 shadow-sm">
            <div className="border-b border-line px-4 py-2 text-xs text-muted">{user?.role}</div>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
              className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-paper"
            >
              My Profile
            </button>
            <button
              onClick={() => {
                setOpen(false);
                logout();
                navigate("/login");
              }}
              className="block w-full px-4 py-2 text-left text-sm text-brick hover:bg-brick-light"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
