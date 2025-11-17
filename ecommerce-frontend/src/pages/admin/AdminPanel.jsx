import React from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";

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
      <div className="bg-white rounded-3xl shadow p-6">
        {isLoading ? (
          <p>Loading analytics…</p>
        ) : isError ? (
          <p className="text-red-600">Failed to load overview.</p>
        ) : (
          <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Products" value={metrics.productCount} />
            <MetricCard label="Categories" value={metrics.categoryCount} />
            <MetricCard label="Orders" value={metrics.orderCount} />
            <MetricCard label="Customers" value={metrics.userCount} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">Latest Orders</h3>
              <div className="space-y-3">
                {latestOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-100 rounded-2xl p-4 flex justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        ₹{order.total?.toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.User?.name || "Guest"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase tracking-widest text-pink-600">
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!latestOrders.length && (
                  <p className="text-sm text-gray-500">No orders yet.</p>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Low stock alerts</h3>
              <div className="space-y-3">
                {lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-100 rounded-2xl p-4 flex justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {product.inventory} pcs
                    </span>
                  </div>
                ))}
                {!lowStock.length && (
                  <p className="text-sm text-gray-500">Inventory looks good.</p>
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
    <div className="rounded-2xl border border-gray-100 p-4 bg-gradient-to-br from-white to-gray-50">
      <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value ?? 0}</p>
    </div>
  );
}
