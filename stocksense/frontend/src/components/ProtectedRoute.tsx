import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export function AppShell({ title }: { title: string }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto bg-paper p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted">Loading StockSense…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
