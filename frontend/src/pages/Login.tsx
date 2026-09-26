import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@stocksense.app");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back to your warehouse floor.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="border border-brick bg-brick-light px-3 py-2 text-sm text-brick">{error}</div>}
        <div>
          <label className="mb-1 block text-sm text-muted">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm text-muted">Password</label>
            <Link to="/forgot-password" className="text-sm text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring h-10 w-full bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
        <p className="text-center text-sm text-muted">
          New to StockSense?{" "}
          <Link to="/signup" className="text-brand hover:underline">
            Create an account
          </Link>
        </p>
        <p className="border-t border-line pt-3 text-center text-xs text-muted">
          Demo login is pre-filled — just press Log in.
        </p>
      </form>
    </AuthLayout>
  );
}
