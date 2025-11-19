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

  return (
    <AdminLayout
      title="Customers"
      actions={
        <div className="w-full md:w-72">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full border border-white/20 bg-transparent rounded-full px-4 py-2 text-sm text-white placeholder:text-white/40"
          />
        </div>
      }
    >
      <div className="bg-graphite/80 border border-white/10 rounded-3xl p-4 text-white">
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <div className="p-6 text-center text-red-300">
            Unable to load customers right now.
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-white/60">No customers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/50 uppercase text-xs tracking-[0.3em]">
                  <th className="p-3">Customer</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Lifetime value</th>
                  <th className="p-3">Last address</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.map((customer) => (
                  <tr key={customer.id} className="border-t border-white/10">
                    <td className="p-3">
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-white/50 text-xs">{customer.email}</p>
                    </td>
                    <td className="p-3">{customer.orderCount}</td>
                    <td className="p-3">
                      ₹{Number(customer.lifetimeValue || 0).toFixed(0)}
                    </td>
                    <td className="p-3 text-white/70 text-xs">
                      {customer.lastOrder
                        ? `${customer.lastOrder.shippingAddress}, ${customer.lastOrder.shippingCity}`
                        : "—"}
                    </td>
                    <td className="p-3 text-white/60">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-14 bg-white/10 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

