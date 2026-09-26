import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import AuthLayout from "./AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
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
      <AuthLayout title="Reset your password" subtitle="We'll send a one-time code to your email.">
        <form onSubmit={requestOtp} className="space-y-4">
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
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring h-10 w-full bg-brand text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send code"}
          </button>
          <p className="text-center text-sm">
            <Link to="/login" className="text-brand hover:underline">
              Back to log in
            </Link>
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Enter the code" subtitle={message ?? "Check your email for the 6-digit code."}>
      <form onSubmit={resetPassword} className="space-y-4">
        {error && <div className="border border-brick bg-brick-light px-3 py-2 text-sm text-brick">{error}</div>}
        {demoOtp && (
          <div className="border border-amber bg-amber-light px-3 py-2 text-sm text-ink">
            No email service is connected in this demo — your code is <strong>{demoOtp}</strong>.
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-muted">6-digit code</label>
          <input
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm tracking-widest"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">New password</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="focus-ring h-10 w-full border border-line bg-paper px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring h-10 w-full bg-brand text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}
