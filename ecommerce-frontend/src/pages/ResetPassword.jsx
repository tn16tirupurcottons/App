import React, { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus({ type: "error", message: "Reset token missing." });
      return;
    }
    if (password.length < 6 || password !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords must match and be at least 6 characters.",
      });
      return;
    }
    setLoading(true);
    setStatus({ type: null, message: "" });
    try {
      await axiosClient.post("/auth/reset-password", { token, password });
      setStatus({
        type: "success",
        message: "Password updated. Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to reset password.",
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
            Secure reset
          </p>
          <h2 className="text-3xl font-display">Choose a new password</h2>
          <p className="text-sm text-muted">
            Create a strong password to protect your TN16 account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
              minLength={6}
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
            {loading ? "Updating..." : "Reset password"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Changed your mind?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

