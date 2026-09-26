import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import AuthLayout from "./AuthLayout";
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("demo@stocksense.app");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<{ message: string; demoOtp?: string }>("/auth/forgot-password", { email });
      setMessage(res.message);
      setDemoOtp(res.demoOtp ?? null);
      if (res.demoOtp) setCode(res.demoOtp);
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      navigate("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "request") {
    return (
      <AuthLayout title="Reset Password" subtitle="Request a 6-digit OTP code to update your credentials.">
        <form onSubmit={requestOtp} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block font-semibold text-slate-300">Registered Email</label>
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 mt-2"
          >
            {submitting ? "Generating OTP..." : "Send Reset Code"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-center text-slate-400 pt-2">
            <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
              Back to log in
            </Link>
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Enter Reset Code" subtitle={message ?? "Check your email for the 6-digit code."}>
      <form onSubmit={resetPassword} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        {demoOtp && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              Demo OTP auto-generated: <strong className="font-mono text-white tracking-widest">{demoOtp}</strong>
            </span>
          </div>
        )}

        <div>
          <label className="mb-1 block font-semibold text-slate-300">6-Digit Code</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono text-sm tracking-widest focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-300">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 mt-2"
        >
          {submitting ? "Updating..." : "Update Password"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </AuthLayout>
  );
}
