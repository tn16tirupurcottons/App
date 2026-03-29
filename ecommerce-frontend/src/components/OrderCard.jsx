import React from "react";
import { Link } from "react-router-dom";

const STATUS_BADGE = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function OrderCard({ order }) {
  const status = String(order?.status || "pending").toLowerCase();
  const badgeClass = STATUS_BADGE[status] || "bg-neutral-100 text-neutral-700";

  return (
    <article className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200/70 bg-neutral-50/30 px-4 py-3">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-neutral-900 break-all">
          Order {String(order?.id || "").slice(0, 8)}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
            {status}
          </span>
          <span className="text-xs text-neutral-500">{formatDate(order?.createdAt)}</span>
        </div>
      </div>
      <div className="text-right space-y-2 shrink-0">
        <p className="text-sm font-semibold text-neutral-900 tabular-nums">
          ₹{Number(order?.total || 0).toFixed(0)}
        </p>
        <Link
          to={`/orders/${order?.id}`}
          className="inline-block text-xs font-semibold text-primary hover:underline underline-offset-2"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

