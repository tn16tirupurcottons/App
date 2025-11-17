import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";

const initialForm = {
  name: "",
  price: "",
  brand: "",
  categoryId: "",
  description: "",
  inventory: 10,
  sizes: "S,M,L,XL",
  colors: "White,Black",
  thumbnail: "",
  gallery: "",
  isFeatured: false,
};

export default function CreateProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data.items || [];
    },
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        inventory: Number(form.inventory),
        sizes: form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors: form.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        gallery: form.gallery
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
      };

      await axiosClient.post("/admin/products", payload);
      setFeedback({ type: "success", message: "Product created successfully." });
      setForm(initialForm);
      setTimeout(() => navigate("/admin/products"), 900);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to create product.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Create Product">
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
            required
          />
          <Input
            label="Price (INR)"
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            required
          />
          <Input
            label="Brand"
            value={form.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
            required
          />
          <label className="text-sm font-semibold text-gray-700">
            Category
            <select
              className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm mt-1"
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
          <textarea
            className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
            rows="5"
            placeholder="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
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
            disabled={loading}
          >
            {loading ? "Saving…" : "Create Product"}
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

