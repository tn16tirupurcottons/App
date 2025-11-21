import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { Eye, X } from "lucide-react";

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled", "failed"];
const paymentOptions = ["requires_payment", "processing", "paid", "failed"];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminOrders"] });
    },
  });

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-3xl shadow p-6">
          <p>Loading orders…</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-3xl shadow p-6">
          <p className="text-red-600">Unable to load orders.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow p-6">
          <div className="overflow-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-500">
              <tr>
                      <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                      <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                      <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((order) => (
                      <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="p-3">
                          <p className="font-semibold text-gray-900 font-mono text-xs">
                            {order.id.substring(0, 8)}...
                          </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-gray-900">
                      {order.User?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500">{order.User?.email}</p>
                          {order.User?.mobileNumber && (
                            <p className="text-xs text-gray-500">{order.User.mobileNumber}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-gray-700">
                            {order.OrderItems?.length || 0} item(s)
                          </p>
                  </td>
                  <td className="p-3 font-semibold">
                          ₹{Number(order.total).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <select
                            className="border rounded-full px-3 py-1 text-xs w-full"
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
                            className="border rounded-full px-3 py-1 text-xs w-full"
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
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                        <td colSpan="7" className="p-6 text-center text-gray-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Order Information</h3>
                        <p className="text-sm"><strong>Order ID:</strong> {selectedOrder.id}</p>
                        <p className="text-sm"><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        <p className="text-sm"><strong>Status:</strong> <span className="capitalize">{selectedOrder.status}</span></p>
                        <p className="text-sm"><strong>Payment:</strong> <span className="capitalize">{selectedOrder.paymentStatus}</span></p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Customer Information</h3>
                        <p className="text-sm"><strong>Name:</strong> {selectedOrder.User?.name || "Guest"}</p>
                        <p className="text-sm"><strong>Email:</strong> {selectedOrder.User?.email || "N/A"}</p>
                        <p className="text-sm"><strong>Mobile:</strong> {selectedOrder.User?.mobileNumber || "N/A"}</p>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Shipping Address</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm">{selectedOrder.shippingName}</p>
                        <p className="text-sm">{selectedOrder.shippingAddress}</p>
                        <p className="text-sm">
                          {selectedOrder.shippingCity}, {selectedOrder.shippingState} - {selectedOrder.shippingZip}
                        </p>
                        <p className="text-sm">{selectedOrder.shippingCountry}</p>
                        <p className="text-sm mt-2"><strong>Phone:</strong> {selectedOrder.shippingPhone}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Order Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.OrderItems?.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                            {item.Product?.thumbnail && (
                              <img
                                src={item.Product.thumbnail}
                                alt={item.Product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.Product?.name || "Product"}</p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                                {item.selectedSize && ` • Size: ${item.selectedSize}`}
                                {item.selectedColor && ` • Color: ${item.selectedColor}`}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              ₹{(item.quantity * item.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Totals */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>₹{Number(selectedOrder.taxTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>₹{Number(selectedOrder.shippingFee || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                          <span>Total:</span>
                          <span>₹{Number(selectedOrder.total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

