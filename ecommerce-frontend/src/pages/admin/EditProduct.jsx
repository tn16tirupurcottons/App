import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
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
        setForm({
          name: product.name,
          price: product.price,
          brand: product.brand || "",
          categoryId: product.categoryId || "",
          description: product.description || "",
          inventory: product.inventory || 0,
          sizes: (product.sizes || []).join(","),
          colors: (product.colors || []).join(","),
          thumbnail: product.thumbnail || "",
          gallery: (product.gallery || []).join("\n"),
          isFeatured: product.isFeatured || false,
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: "Failed to load product details.",
        });
      }
    };
    load();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        inventory: Number(form.inventory),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        gallery: form.gallery.split("\n").map((url) => url.trim()).filter(Boolean),
      };

      await axiosClient.put(`/admin/products/${id}`, payload);
      setFeedback({ type: "success", message: "Product updated." });
      setTimeout(() => navigate("/admin/products"), 900);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <AdminLayout title="Edit Product">
        <div className="bg-white rounded-3xl shadow p-6">
          <p>Loading product…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Product">
      <div className="bg-white rounded-3xl shadow p-6">
        {feedback.message && (
          <p
            className={`mb-4 text-sm ${
              feedback.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {feedback.message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <Input
            label="Price (INR)"
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
          />
          <Input
            label="Brand"
            value={form.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
          />
          <label className="text-sm font-semibold text-gray-700">
            Category
            <select
              className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm mt-1"
              value={form.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
            rows="5"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Input
            label="Inventory"
            type="number"
            value={form.inventory}
            onChange={(e) => handleChange("inventory", e.target.value)}
          />
          <Input
            label="Sizes (comma separated)"
            value={form.sizes}
            onChange={(e) => handleChange("sizes", e.target.value)}
          />
          <Input
            label="Colors (comma separated)"
            value={form.colors}
            onChange={(e) => handleChange("colors", e.target.value)}
          />
          <Input
            label="Thumbnail URL"
            value={form.thumbnail}
            onChange={(e) => handleChange("thumbnail", e.target.value)}
          />
          <label className="text-sm font-semibold text-gray-700">
            Gallery (one URL per line)
            <textarea
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm mt-1"
              rows="4"
              value={form.gallery}
              onChange={(e) => handleChange("gallery", e.target.value)}
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => handleChange("isFeatured", e.target.checked)}
            />
            Featured
          </label>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-pink-600 text-white rounded-full py-3 font-semibold"
            disabled={saving}
          >
            {saving ? "Saving…" : "Update Product"}
          </button>
        </div>
      </form>
      </div>
    </AdminLayout>
  );
}

function Input({ label, className = "", ...rest }) {
  return (
    <label className={`text-sm font-semibold text-gray-700 ${className}`}>
      <span className="block mb-1">{label}</span>
      <input
        {...rest}
        className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm"
      />
    </label>
  );
}

