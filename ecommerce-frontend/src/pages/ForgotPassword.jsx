import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) return;
    setLoading(true);
    setStatus({ type: null, message: "" });
    try {
      await axiosClient.post("/auth/forgot-password", { identifier });
      setStatus({
        type: "success",
        message:
          "If the account exists, reset instructions have been sent to your inbox.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message || "Unable to send reset instructions.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-dark">
      <div className="max-w-md w-full card p-8 md:p-10 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            Account recovery
          </p>
          <h2 className="text-3xl font-display">Forgot Password</h2>
          <p className="text-sm text-muted">
            Enter the email or mobile number linked to your TN16 account. We’ll
            send you a secure reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Email or Mobile
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com or +91985..."
              className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
              required
            />
          </div>

          {status.message && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Remembered your password?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

