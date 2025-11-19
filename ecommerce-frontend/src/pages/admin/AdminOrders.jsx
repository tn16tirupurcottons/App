import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const paymentOptions = ["requires_payment", "processing", "paid", "failed"];

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const res = await axiosClient.get("/orders/all");
      return res.data.items;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, payload }) =>
      axiosClient.patch(`/orders/${id}/status`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminOrders"] }),
  });

  return (
    <AdminLayout title="Orders">
      <div className="bg-white rounded-3xl shadow p-6">
        {isLoading ? (
          <p>Loading orders…</p>
        ) : isError ? (
          <p className="text-red-600">Unable to load orders.</p>
        ) : (
          <div className="overflow-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-500">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((order) => (
                <tr key={order.id} className="border-t border-gray-50">
                  <td className="p-3">
                    <p className="font-semibold text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-gray-900">
                      {order.User?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500">{order.User?.email}</p>
                  </td>
                  <td className="p-3 font-semibold">
                    ₹{Number(order.total).toFixed(0)}
                  </td>
                  <td className="p-3">
                    <select
                      className="border rounded-full px-3 py-1 text-xs"
                      value={order.status}
                      onChange={(e) =>
                        updateStatus.mutate({
                          id: order.id,
                          payload: { status: e.target.value },
                        })
                      }
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      className="border rounded-full px-3 py-1 text-xs"
                      value={order.paymentStatus}
                      onChange={(e) =>
                        updateStatus.mutate({
                          id: order.id,
                          payload: { paymentStatus: e.target.value },
                        })
                      }
                    >
                      {paymentOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

