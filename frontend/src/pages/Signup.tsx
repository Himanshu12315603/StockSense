import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import AuthLayout from "./AuthLayout";
import { User, Mail, Lock, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";

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
    <AuthLayout title="Create Team Account" subtitle="Set up instant access for your inventory team.">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              required
              placeholder="e.g. Vikram Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Role & Access Level</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("Inventory Manager")}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                role === "Inventory Manager"
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Manager</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Full Catalog &amp; Audit Access</p>
            </button>

            <button
              type="button"
              onClick={() => setRole("Warehouse Staff")}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                role === "Warehouse Staff"
                  ? "bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-600/10"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <UserCheck className="h-4 w-4" />
                <span>Staff</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Receipts &amp; Dispatch</p>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 mt-2"
        >
          {submitting ? "Creating Account..." : "Create Account"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-slate-400 pt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
