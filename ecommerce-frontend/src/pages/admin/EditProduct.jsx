import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import ImageUploader from "../../components/ImageUploader";
import { useToast } from "../../components/Toast";
import axiosClient from "../../api/axiosClient";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data.items || [];
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get(`/products/${id}`);
        const product = res.data;

        const gallery = [];
        if (product.thumbnail) gallery.push(product.thumbnail);
        if (product.gallery && Array.isArray(product.gallery)) {
          product.gallery.forEach((url) => {
            if (url && !gallery.includes(url)) gallery.push(url);
          });
        }

        setForm({
          name: product.name || "",
          price: product.price || "",
          brand: product.brand || "",
          categoryId: product.categoryId || "",
          description: product.description || "",
          inventory: product.inventory || 0,
          sizes: (product.sizes || []).join(","),
          colors: (product.colors || []).join(","),
          gallery: gallery,
          isFeatured: product.isFeatured || false,
        });
      } catch (error) {
        toast.error("Failed to load product details");
      }
    };
    load();
  }, [id, toast]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);

    try {
      if (!form.gallery || form.gallery.length === 0) {
        toast.error("Please upload at least one product image");
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price),
        inventory: Number(form.inventory),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        gallery: form.gallery,
        thumbnail: form.gallery[0] || "",
      };

      await axiosClient.put(`/admin/products/${id}`, payload);

      toast.success("Product updated successfully!");
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <AdminLayout title="Edit Product">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow p-4 md:p-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Product">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow p-4 md:p-6">

        {/* FORM START */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <Input
                label="Product Name *"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              <Input
                label="Price (INR) *"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />
              <Input
                label="Brand *"
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                required
              />

              <label className="block text-sm font-semibold text-gray-700">
                Category *
                <select
                  className="w-full border-2 border-gray-200 rounded-full px-4 py-2.5 text-sm mt-1 focus:outline-none focus:border-pink-500"
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <Input
                label="Inventory"
                type="number"
                min="0"
                value={form.inventory}
                onChange={(e) => handleChange("inventory", e.target.value)}
              />
              <Input
                label="Sizes (comma separated)"
                value={form.sizes}
                onChange={(e) => handleChange("sizes", e.target.value)}
                placeholder="S, M, L, XL"
              />
              <Input
                label="Colors (comma separated)"
                value={form.colors}
                onChange={(e) => handleChange("colors", e.target.value)}
                placeholder="White, Black, Blue"
              />

              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => handleChange("isFeatured", e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span>Featured Product</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition"
              rows="4"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Product Images *{" "}
              <span className="text-gray-400 font-normal">
                (First image will be the primary/thumbnail)
              </span>
            </label>
            <ImageUploader
              images={form.gallery}
              onChange={(images) => handleChange("gallery", images)}
              maxImages={10}
              maxSizeMB={5}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="flex-1 border-2 border-gray-300 text-gray-700 rounded-full py-3 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
              disabled={
                saving ||
                !form.name ||
                !form.price ||
                !form.categoryId ||
                !form.gallery.length
              }
            >
              {saving ? "Saving..." : "Update Product"}
            </button>
          </div>

        </form>
        {/* FORM END */}

      </div>
    </AdminLayout>
  );
}

function Input({ label, className = "", ...rest }) {
  return (
    <label className={`block text-sm font-semibold text-gray-700 ${className}`}>
      <span className="block mb-1.5">{label}</span>
      <input
        {...rest}
        className="w-full border-2 border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500 transition"
      />
    </label>
  );
}
