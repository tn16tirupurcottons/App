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
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: () => toast.error("Failed to delete banner"),
  });

  const BannerForm = ({ banner = null, onClose }) => {
    const [form, setForm] = useState({
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      image: banner?.image || "",
      images: banner?.images || (banner?.image ? [banner.image] : []),
      ctaLabel: banner?.ctaLabel || "Shop Now",
      ctaLink: banner?.ctaLink || "/catalog",
      segment: banner?.segment || "default",
      page: banner?.page || "home",
      position: banner?.position || "hero",
      displayOrder: banner?.displayOrder || 0,
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
        qc.invalidateQueries({ queryKey: ["banners"] });
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to save banner");
      },
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Ensure images array is properly formatted
      const payload = {
        ...form,
        images: form.images && form.images.length > 0 ? form.images : (form.image ? [form.image] : []),
        image: form.images && form.images.length > 0 ? form.images[0] : form.image,
      };
      saveMutation.mutate(payload);
    };

    return (
      <div className="bg-white rounded-xl p-4 md:p-6 space-y-4 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">{banner ? "Edit Banner" : "New Banner"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
                placeholder="Enter banner title"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter banner subtitle"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Banner Images * <span className="text-gray-500 font-normal">(Max 5, auto-rotates every 3s)</span>
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <ImageUploader
                images={form.images || []}
                onChange={(images) => {
                  const limited = images.slice(0, 5);
                  setForm({ 
                    ...form, 
                    images: limited,
                    image: limited[0] || "" // Keep backward compat
                  });
                }}
                maxImages={5}
                maxSizeMB={5}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2 font-medium">
              💡 Upload 1-5 images. They will rotate automatically in a carousel. Text overlay will be clearly visible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">CTA Label</label>
              <input
                type="text"
                value={form.ctaLabel}
                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">CTA Link</label>
              <input
                type="text"
                value={form.ctaLink}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="/catalog"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Page *</label>
              <select
                value={form.page}
                onChange={(e) => setForm({ ...form, page: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="home">Home</option>
                <option value="catalog">Catalog</option>
                <option value="product">Product</option>
                <option value="cart">Cart</option>
                <option value="checkout">Checkout</option>
                <option value="all">All Pages</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Position *</label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="hero">Hero (Top)</option>
                <option value="top">Top Section</option>
                <option value="middle">Middle Section</option>
                <option value="bottom">Bottom Section</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Segment</label>
              <select
                value={form.segment}
                onChange={(e) => setForm({ ...form, segment: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="default">Default</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="genz">Gen Z</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: Number(e.target.value) || 0 })
                }
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                min="0"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-gray-900 cursor-pointer">
              Active (Banner will be visible on selected page/position)
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 rounded-lg py-3 font-bold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isLoading || !form.title || !form.images?.length}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {saveMutation.isLoading ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout title="Banner Management">
        <div className="bg-graphite/80 border border-white/10 rounded-3xl p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/10 rounded-xl animate-pulse" />
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
      <div className="bg-graphite/80 border border-white/10 rounded-3xl p-4 md:p-6 space-y-4 text-white">
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

