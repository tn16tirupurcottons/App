import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import ImageUploader from "../../components/ImageUploader";
import { useToast } from "../../components/Toast";
import { Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import axiosClient from "../../api/axiosClient";

export default function BannerManagement() {
  const toast = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      try {
        const res = await axiosClient.get("/admin/banners");
        return res.data.items || [];
      } catch (err) {
        // If endpoint doesn't exist, return empty array
        return [];
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      toast.success("Banner deleted");
      qc.invalidateQueries(["banners"]);
    },
    onError: () => toast.error("Failed to delete banner"),
  });

  const BannerForm = ({ banner = null, onClose }) => {
    const [form, setForm] = useState({
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      image: banner?.image || "",
      ctaLabel: banner?.ctaLabel || "Shop Now",
      ctaLink: banner?.ctaLink || "/catalog",
      segment: banner?.segment || "default",
      order: banner?.order || 0,
      isActive: banner?.isActive !== undefined ? banner.isActive : true,
    });

    const saveMutation = useMutation({
      mutationFn: async (payload) => {
        if (banner) {
          return await axiosClient.put(`/admin/banners/${banner.id}`, payload);
        } else {
          return await axiosClient.post("/admin/banners", payload);
        }
      },
      onSuccess: () => {
        toast.success(banner ? "Banner updated" : "Banner created");
        qc.invalidateQueries(["banners"]);
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to save banner");
      },
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      saveMutation.mutate(form);
    };

    return (
      <div className="bg-gray-50 rounded-xl p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{banner ? "Edit Banner" : "New Banner"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Image *</label>
            <ImageUploader
              images={form.image ? [form.image] : []}
              onChange={(images) => setForm({ ...form, image: images[0] || "" })}
              maxImages={1}
              maxSizeMB={5}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">CTA Label</label>
              <input
                type="text"
                value={form.ctaLabel}
                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">CTA Link</label>
              <input
                type="text"
                value={form.ctaLink}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                placeholder="/catalog"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Segment</label>
              <select
                value={form.segment}
                onChange={(e) => setForm({ ...form, segment: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
              >
                <option value="default">Default</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="genz">Gen Z</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-600 rounded"
              />
              <label className="text-sm font-semibold text-gray-700">Active</label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 rounded-lg py-2 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isLoading || !form.title || !form.image}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
            >
              {saveMutation.isLoading ? "Saving..." : banner ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout title="Banner Management">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow p-4 md:p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Banner Management"
      actions={
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold text-sm md:text-base transition shadow-lg flex items-center gap-2"
        >
          <Plus size={18} />
          <span>New Banner</span>
        </button>
      }
    >
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow p-4 md:p-6 space-y-4">
        {showForm && (
          <BannerForm
            banner={editing}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        )}

        {!showForm && (
          <>
            {banners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No banners yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold"
                >
                  Create First Banner
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center"
                  >
                    {banner.image && (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full md:w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{banner.segment}</span>
                        <span className={`text-xs px-2 py-1 rounded ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(banner);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this banner?")) {
                            deleteMutation.mutate(banner.id);
                          }
                        }}
                        className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

