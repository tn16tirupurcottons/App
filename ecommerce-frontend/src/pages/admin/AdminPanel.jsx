import React from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";

function orderStatusBadgeClass(status) {
  const s = (status || "pending").toLowerCase();
  if (s.includes("cancel")) return "bg-red-50 text-red-800 border border-red-200";
  if (s.includes("ship") || s.includes("deliver")) return "bg-emerald-50 text-emerald-800 border border-emerald-200";
  if (s.includes("pend") || s.includes("process")) return "bg-amber-50 text-amber-800 border border-amber-200";
  return "bg-neutral-100 text-neutral-800 border border-neutral-200";
}

export default function AdminPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminOverview"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/dashboard/overview");
      return res.data;
    },
  });

  const metrics = data?.metrics || {};
  const latestOrders = data?.latestOrders || [];
  const lowStock = data?.lowStock || [];

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="card p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-neutral-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
              <div className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-700 font-semibold">Failed to load overview.</p>
            <p className="text-sm text-red-600 mt-1">Please try refreshing the page.</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <MetricCard label="Products" value={metrics.productCount} />
              <MetricCard label="Categories" value={metrics.categoryCount} />
              <MetricCard label="Orders" value={metrics.orderCount} />
              <MetricCard label="Customers" value={metrics.userCount} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
              <section className="card p-4 md:p-5">
                <h3 className="text-base md:text-lg font-semibold mb-3 text-neutral-900">Latest Orders</h3>
                <div className="space-y-2 md:space-y-3">
                  {latestOrders.length > 0 ? (
                    latestOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg md:rounded-xl p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 text-sm md:text-base">
                            ₹{Number(order.total || 0).toFixed(0)}
                          </p>
                          <p className="text-xs md:text-sm text-neutral-600 truncate">
                            {order.User?.name || "Guest"}
                          </p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <span
                            className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md mb-1 ${orderStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status || "pending"}
                          </span>
                          <p className="text-xs text-neutral-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-neutral-600">No orders yet.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="card p-4 md:p-5">
                <h3 className="text-base md:text-lg font-semibold mb-3 text-neutral-900">Low Stock Alerts</h3>
                <div className="space-y-2 md:space-y-3 max-h-[400px] overflow-y-auto">
                  {lowStock.length > 0 ? (
                    lowStock.map((product) => (
                      <div
                        key={product.id}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg md:rounded-xl p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 text-sm md:text-base truncate">{product.name}</p>
                          <p className="text-xs md:text-sm text-neutral-600">{product.brand || "TN16"}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-block text-xs md:text-sm font-semibold text-red-800 bg-red-50 border border-red-200 px-2 py-1 rounded-md">
                            {product.inventory || 0} pcs
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-neutral-600">Inventory looks good.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="card p-3 md:p-4 hover:shadow-md transition-shadow">
      <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 font-semibold">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-neutral-900 mt-1 md:mt-2 tabular-nums">{value ?? 0}</p>
    </div>
  );
}
