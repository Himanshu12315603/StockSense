import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import AuthLayout from "./AuthLayout";
import { Eye, EyeOff, UserCheck, Shield, Lock, Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@stocksense.app");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
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

  async function quickDemoLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
    setSubmitting(true);
    try {
      await login(demoEmail, "password123");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in with demo account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Log in to StockSense" subtitle="Access your enterprise inventory dashboard.">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block font-semibold text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="font-semibold text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-indigo-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 mt-2"
        >
          {submitting ? "Logging in..." : "Log in"}
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Quick One-Click Demo Logins */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center">
            One-Click Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin("demo@stocksense.app")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Shield className="h-3.5 w-3.5" />
                <span>Demo Manager</span>
              </div>
              <p className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Full Admin Rights</p>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin("staff@stocksense.app")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Warehouse Staff</span>
              </div>
              <p className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Floor Operations</p>
            </button>
          </div>
        </div>

        <p className="text-center text-slate-400 pt-2">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
