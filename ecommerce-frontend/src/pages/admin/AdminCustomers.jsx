import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminCustomers", search],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/users", {
        params: { role: "user", search, includeOrders: "true" },
      });
      return res.data.items || [];
    },
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <AdminLayout
      title="Customers"
      actions={
        <div className="w-full md:w-72">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-900"
          />
        </div>
      }
    >
      <div className="card p-4 md:p-6">
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <div className="p-6 text-center text-red-600">
            Unable to load customers right now.
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-neutral-600">No customers yet.</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {data.map((customer) => (
                <div
                  key={customer.id}
                  className="card p-4 space-y-2"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div>
                    <p className="font-semibold text-neutral-900">{customer.name}</p>
                    <p className="text-neutral-600 text-xs">{customer.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-600">Orders:</span>
                      <p className="font-medium text-neutral-900">{customer.orderCount}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600">Value:</span>
                      <p className="font-medium text-neutral-900">
                        ₹{Number(customer.lifetimeValue || 0).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  {customer.lastOrder && (
                    <p className="text-xs text-neutral-600">
                      Last: {customer.lastOrder.shippingCity}, {customer.lastOrder.shippingState}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-600 uppercase text-xs tracking-[0.3em] border-b border-neutral-200">
                    <th className="p-3">Customer</th>
                    <th className="p-3">Orders</th>
                    <th className="p-3">Lifetime value</th>
                    <th className="p-3">Last address</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((customer) => (
                    <tr key={customer.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition">
                      <td className="p-3">
                        <p className="font-semibold text-neutral-900">{customer.name}</p>
                        <p className="text-neutral-600 text-xs">{customer.email}</p>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-neutral-900">{customer.orderCount}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-neutral-900">
                          ₹{Number(customer.lifetimeValue || 0).toFixed(0)}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-600 text-xs">
                        {customer.lastOrder
                          ? `${customer.lastOrder.shippingAddress}, ${customer.lastOrder.shippingCity}`
                          : "—"}
                      </td>
                      <td className="p-3 text-neutral-600 text-xs">
                        {customer.lastOrder?.shippingPhone || "—"}
                      </td>
                      <td className="p-3 text-neutral-600">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-neutral-900 hover:underline text-xs font-semibold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </AdminLayout>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-14 bg-neutral-50 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

function CustomerDetailsModal({ customer, onClose }) {
  const { data: orders } = useQuery({
    queryKey: ["customerOrders", customer.id],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/orders", {
        params: { userId: customer.id },
      });
      return res.data.items || [];
    },
    enabled: !!customer,
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-large" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display text-neutral-900">{customer.name}</h2>
            <p className="text-neutral-600 text-sm mt-1">{customer.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-50 text-neutral-900"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-neutral-900">{customer.orderCount || 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-600 mb-1">Lifetime Value</p>
              <p className="text-2xl font-bold text-neutral-900">
                ₹{Number(customer.lifetimeValue || 0).toFixed(0)}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-600 mb-1">Member Since</p>
              <p className="text-lg font-semibold text-neutral-900">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {customer.lastOrder && (
            <div className="card p-4">
              <h3 className="font-semibold text-neutral-900 mb-3">Last Shipping Address</h3>
              <div className="text-sm text-neutral-900/70 space-y-1">
                <p>{customer.lastOrder.shippingName}</p>
                <p>{customer.lastOrder.shippingAddress}</p>
                <p>
                  {customer.lastOrder.shippingCity}, {customer.lastOrder.shippingState} {customer.lastOrder.shippingZip}
                </p>
                <p>{customer.lastOrder.shippingCountry}</p>
                {customer.lastOrder.shippingPhone && (
                  <p className="mt-2">Phone: {customer.lastOrder.shippingPhone}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Order History</h3>
            {orders && orders.length > 0 ? (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="card p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-neutral-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-neutral-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-neutral-900/70 mt-1">
                          {order.shippingCity}, {order.shippingState}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-900 text-lg">
                          ₹{Number(order.total || 0).toFixed(0)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "completed" ? "bg-green-100 text-green-700" :
                          order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-6 text-center text-neutral-600">
                No orders found for this customer.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

