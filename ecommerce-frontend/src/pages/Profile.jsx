import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const res = await axiosClient.get("/orders");
      return res.data?.items || [];
    },
  });

  const orders = data || [];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-dark">
      <div className="max-w-2xl w-full card p-8 md:p-10 space-y-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Account</p>
          <h2 className="text-3xl font-display mt-2 text-dark">My Profile</h2>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-neutral-500">Name</p>
              <p className="text-base font-semibold text-neutral-900 break-words">
                {user?.name || "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout(() => {
                  navigate("/");
                });
              }}
              className="shrink-0 rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Email</p>
              <p className="text-base font-semibold text-neutral-900 break-words">
                {user?.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Joined</p>
              <p className="text-base font-semibold text-neutral-900">
                {formatDate(user?.joinedAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-neutral-900">Orders</h3>
            <Link
              to="/orders"
              className="text-sm font-semibold text-primary hover:underline underline-offset-2"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-neutral-100 rounded-xl" />
              <div className="h-10 bg-neutral-100 rounded-xl" />
            </div>
          ) : isError ? (
            <p className="text-sm text-red-600">Failed to load orders.</p>
          ) : orders.length ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200/70 bg-neutral-50/30 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 break-all">
                      Order {String(o.id).slice(0, 8)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {o.status} · {o.paymentStatus}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 tabular-nums">
                    ₹{Number(o.total || 0).toFixed(0)}
                  </p>
                </div>
              ))}
              {orders.length > 5 ? (
                <p className="text-xs text-neutral-500">Showing latest 5 orders.</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No orders yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

