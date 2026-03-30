import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../components/Toast";

const emptyForm = {
  name: "",
  description: "",
  heroImage: "",
  accentColor: "#f97316",
  isActive: true,
};

export default function AdminCategories() {
  const qc = useQueryClient();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories", {
        params: { includeInactive: "true" },
      });
      return res.data.items || [];
    },
  });

  const categories = data || [];

  const refresh = () => qc.invalidateQueries({ queryKey: ["adminCategories"] });

  const createMutation = useMutation({
    mutationFn: (payload) => axiosClient.post("/categories", payload),
    onSuccess: () => {
      toast.success("Category created");
      setForm(emptyForm);
      setEditingId(null);
      setModalOpen(false);
      refresh();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => axiosClient.put(`/categories/${id}`, payload),
    onSuccess: () => {
      toast.success("Category updated");
      setForm(emptyForm);
      setEditingId(null);
      setModalOpen(false);
      refresh();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, nextActive }) =>
      axiosClient.put(`/categories/${id}`, { isActive: nextActive }),
    onSuccess: () => {
      toast.success("Status updated");
      refresh();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Status update failed"),
  });

  const uploadImage = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setUploading(true);
    try {
      const res = await axiosClient.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.url;
      if (!url) throw new Error("Upload did not return url");
      setForm((p) => ({ ...p, heroImage: url }));
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      heroImage: cat.heroImage || cat.image || "",
      accentColor: cat.accentColor || "#f97316",
      isActive: cat.isActive ?? true,
    });
    setModalOpen(true);
  };

  const payload = useMemo(() => {
    return {
      name: form.name?.trim() || "",
      description: form.description?.trim() || "",
      heroImage: form.heroImage || "",
      accentColor: form.accentColor || "#f97316",
      isActive: Boolean(form.isActive),
    };
  }, [form]);

  const save = () => {
    if (!payload.name) {
      toast.error("Name is required");
      return;
    }
    if (editingId) updateMutation.mutate({ id: editingId, payload });
    else createMutation.mutate(payload);
  };

  return (
    <AdminLayout
      title="Categories"
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-full bg-neutral-900 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          Add category
        </button>
      }
    >
      <div className="bg-white rounded-3xl shadow p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            Unable to fetch categories.
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-neutral-600 py-10">No categories yet.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-600 uppercase text-xs tracking-[0.3em] border-b border-neutral-200 bg-neutral-50">
                    <th className="p-3">Image</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Active</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-neutral-200 hover:bg-neutral-50 transition"
                    >
                      <td className="p-3">
                        {cat.heroImage || cat.image ? (
                          <img
                            src={cat.heroImage || cat.image}
                            alt={cat.name}
                            className="w-12 h-12 object-cover rounded-xl border border-neutral-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-neutral-200 bg-neutral-50" />
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-neutral-900">{cat.name}</p>
                      </td>
                      <td className="p-3 text-neutral-600 text-xs">{cat.slug}</td>
                      <td className="p-3 text-neutral-700 text-xs line-clamp-2 max-w-[260px]">
                        {cat.description || "—"}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: cat.id,
                              nextActive: !(cat.isActive ?? true),
                            })
                          }
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                            cat.isActive ?? true
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                          }`}
                          disabled={toggleActiveMutation.isPending}
                        >
                          {cat.isActive ?? true ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(cat)}
                          className="text-neutral-900 hover:underline text-xs font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="card p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {cat.heroImage || cat.image ? (
                      <img
                        src={cat.heroImage || cat.image}
                        alt={cat.name}
                        className="w-16 h-16 object-cover rounded-xl border border-neutral-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-neutral-200 bg-neutral-50" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900">{cat.name}</p>
                      <p className="text-xs text-neutral-600 mt-1 truncate">{cat.slug}</p>
                      <p className="text-xs text-neutral-700 mt-2 line-clamp-2">{cat.description || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: cat.id,
                          nextActive: !(cat.isActive ?? true),
                        })
                      }
                      disabled={toggleActiveMutation.isPending}
                      className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold border transition ${
                        cat.isActive ?? true
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {cat.isActive ?? true ? "Active" : "Inactive"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(cat)}
                      className="px-3 py-2 rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-900 hover:bg-neutral-50"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen ? (
        <div
          className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center px-4 py-6"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl card rounded-2xl border border-neutral-200 bg-white p-5 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingId ? "Edit category" : "Add category"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-neutral-800 hover:bg-neutral-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-neutral-600 font-semibold">Name *</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm"
                    placeholder="e.g. Men"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-neutral-600 font-semibold">Accent color</span>
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-full px-2 py-2"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs text-neutral-600 font-semibold">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-neutral-200 bg-white rounded-2xl px-4 py-2 text-sm min-h-[92px]"
                  placeholder="Category description"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs text-neutral-600 font-semibold">Image (Cloudinary)</span>
                <div className="flex items-center gap-4 flex-wrap">
                  {form.heroImage ? (
                    <img
                      src={form.heroImage}
                      alt="Category"
                      className="w-28 h-20 object-cover rounded-xl border border-neutral-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-28 h-20 rounded-xl border border-neutral-200 bg-neutral-50" />
                  )}
                  <div className="flex-1 min-w-[180px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadImage(e.target.files?.[0])}
                      disabled={uploading}
                      className="w-full text-sm"
                    />
                    {uploading ? <p className="text-xs text-neutral-600 mt-1">Uploading…</p> : null}
                  </div>
                </div>
              </label>

              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                  Active
                </label>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || uploading}
                  className="rounded-full bg-neutral-900 text-white px-6 py-2 text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {editingId ? "Save changes" : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}

