import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";

export default function AdminProducts() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminProducts", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 100 });
      if (search) params.append("search", search);
      const res = await axiosClient.get(`/admin/products?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/admin/products/${id}`),
    onSuccess: () => qc.invalidateQueries(["adminProducts"]),
  });

  const products = data?.items || [];

  return (
    <AdminLayout
      title="Manage Products"
      actions={
        <button
          onClick={() => navigate("/admin/create-product")}
          className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold"
        >
          Add Product
        </button>
      }
    >
      <div className="bg-white rounded-3xl shadow p-6 space-y-4">
        <input
          className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm"
          placeholder="Search by name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isLoading ? (
          <p>Loading products…</p>
        ) : isError ? (
          <p className="text-red-600">Failed to load products.</p>
        ) : (
          <div className="overflow-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Inventory</th>
                  <th className="p-3">Price</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-gray-50">
                    <td className="p-3">
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.sku}</p>
                    </td>
                    <td className="p-3">{product.Category?.name || "—"}</td>
                    <td className="p-3">{product.inventory}</td>
                    <td className="p-3 font-semibold">
                      ₹{Number(product.price).toFixed(0)}
                    </td>
                    <td className="p-3 flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                        className="px-3 py-1 rounded-full border text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete ${product.name}? This cannot be undone.`
                            )
                          ) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      No products found.
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
