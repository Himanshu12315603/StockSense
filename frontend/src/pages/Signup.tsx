import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import AuthLayout from "./AuthLayout";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Inventory Manager");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(name, email, password, role);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create an account" subtitle="Set up access for your team.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="border border-brick bg-brick-light px-3 py-2 text-sm text-brick">{error}</div>}
        <div>
          <label className="mb-1 block text-sm text-muted">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          />
        </div>
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
          <label className="mb-1 block text-sm text-muted">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          >
            <option>Inventory Manager</option>
            <option>Warehouse Staff</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Password</label>
          <input
            type="password"
            required
            minLength={6}
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-brand hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
