import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";

export default function AdminCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    heroImage: "",
    accentColor: "#f97316",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data.items || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => axiosClient.post("/categories", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminCategories"] });
      setForm({
        name: "",
        slug: "",
        description: "",
        heroImage: "",
        accentColor: "#f97316",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/categories/${id}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminCategories"] }),
  });

  return (
    <AdminLayout title="Categories">
      <div className="bg-white rounded-3xl shadow p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <form
            className="bg-gray-50 rounded-3xl p-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
          >
            <h3 className="font-semibold text-gray-900">Add category</h3>
            <input
              className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm"
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <textarea
              className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm"
              placeholder="Hero image URL"
              value={form.heroImage}
              onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
            />
            <input
              type="color"
              className="w-full border border-gray-200 rounded-full px-3 py-2"
              value={form.accentColor}
              onChange={(e) =>
                setForm({ ...form, accentColor: e.target.value })
              }
            />
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white rounded-full py-2 font-semibold hover:bg-neutral-800"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? "Saving…" : "Create"}
            </button>
          </form>

          <div className="lg:col-span-2">
            {isLoading ? (
              <p>Loading categories…</p>
            ) : isError ? (
              <p className="text-red-600">Unable to fetch categories.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {data.map((cat) => (
                  <div
                    key={cat.id}
                    className="border border-gray-100 rounded-3xl p-4 flex items-center gap-4"
                  >
                    <div
                      className="h-14 w-14 rounded-2xl text-white grid place-items-center"
                      style={{ backgroundColor: cat.accentColor || "#f97316" }}
                    >
                      {cat.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-500">{cat.slug}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete ${cat.name}? Products referencing it must be reassigned.`
                          )
                        ) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                      className="text-xs text-red-500 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {!data.length && (
                  <p className="text-gray-500">No categories yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

