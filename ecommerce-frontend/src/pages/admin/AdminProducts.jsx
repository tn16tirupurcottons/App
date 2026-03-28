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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminProducts"] }),
  });

  const products = data?.items || [];

  return (
    <AdminLayout
      title="Manage Products"
      actions={
        <button
          onClick={() => navigate("/admin/create-product")}
          className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold text-sm md:text-base transition shadow-lg"
        >
          + Add Product
        </button>
      }
    >
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow p-4 md:p-6 space-y-4 md:space-y-6">
        <input
          className="w-full border-2 border-gray-200 rounded-full px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:border-neutral-900 transition"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 font-semibold">Failed to load products.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.sku || "No SKU"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{product.Category?.name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Inventory:</span>
                      <p className="font-medium">{product.inventory || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <p className="font-semibold">₹{Number(product.price || 0).toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-100"
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
                      className="flex-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!products.length && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-500">No products found.</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Inventory</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.sku || "No SKU"}</p>
                      </td>
                      <td className="p-3">{product.Category?.name || "—"}</td>
                      <td className="p-3">{product.inventory || 0}</td>
                      <td className="p-3 font-semibold">
                        ₹{Number(product.price || 0).toFixed(0)}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                            className="px-3 py-1 rounded-full border border-gray-300 text-xs font-semibold hover:bg-gray-100"
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
                            className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}
