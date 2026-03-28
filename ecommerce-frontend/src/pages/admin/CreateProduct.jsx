import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../admin/components/AdminLayout";
import ImageUploader from "../../components/ImageUploader";
import AutocompleteInput from "../../components/AutocompleteInput";
import AutocompleteColorsInput from "../../components/AutocompleteColorsInput";
import { useToast } from "../../components/Toast";
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
  gallery: [],
  isFeatured: false,
};

export default function CreateProduct() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data.items || [];
    },
  });

  // Fetch all products for autocomplete suggestions
  const { data: allProductsData } = useQuery({
    queryKey: ["allProductsForSuggestions"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/products?limit=1000");
      const products = res.data.items || [];
      // Ensure categoryId is accessible (handle both plain objects and Sequelize models)
      return products.map((p) => ({
        ...p,
        categoryId: p.categoryId || p.Category?.id || null,
      }));
    },
  });

  // Extract unique suggestions filtered by selected category
  const productNameSuggestions = useMemo(() => {
    if (!allProductsData || !form.categoryId) return [];
    const names = new Set();
    allProductsData.forEach((p) => {
      // Only include products from the selected category
      if (p.name && p.categoryId === form.categoryId) {
        names.add(p.name);
      }
    });
    return Array.from(names).sort();
  }, [allProductsData, form.categoryId]);

  const brandSuggestions = useMemo(() => {
    if (!allProductsData || !form.categoryId) return [];
    const brands = new Set();
    allProductsData.forEach((p) => {
      // Only include brands from the selected category
      if (p.brand && p.categoryId === form.categoryId) {
        brands.add(p.brand);
      }
    });
    return Array.from(brands).sort();
  }, [allProductsData, form.categoryId]);

  const colorSuggestions = useMemo(() => {
    if (!allProductsData || !form.categoryId) return [];
    const colors = new Set();
    allProductsData.forEach((p) => {
      // Only include colors from the selected category
      if (p.categoryId === form.categoryId && p.colors && Array.isArray(p.colors)) {
        p.colors.forEach((c) => {
          if (c && c.trim()) colors.add(c.trim());
        });
      }
    });
    return Array.from(colors).sort();
  }, [allProductsData, form.categoryId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.gallery || form.gallery.length === 0) {
        toast.error("Please upload at least one product image");
        setLoading(false);
        return;
      }

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
        gallery: form.gallery,
        thumbnail: form.gallery[0] || "",
      };

      await axiosClient.post("/admin/products", payload);
      toast.success("Product created successfully!");
      setForm(initialForm);
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Create Product">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow p-4 md:p-6">
        
        {/* ✅ FORM START (YOU MISSED THIS) */}
        <form onSubmit={handleSubmit}>
          
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Category *
                <select
                  className="w-full border-2 border-gray-200 rounded-full px-4 py-2.5 text-sm mt-1 focus:outline-none focus:border-neutral-900"
                  value={form.categoryId}
                  onChange={(e) => {
                    handleChange("categoryId", e.target.value);
                    // Clear name, brand, and colors when category changes to show fresh suggestions
                    if (e.target.value !== form.categoryId) {
                      handleChange("name", "");
                      handleChange("brand", "");
                      handleChange("colors", "");
                    }
                  }}
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

              <AutocompleteInput
                label="Product Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                suggestions={productNameSuggestions}
                placeholder={form.categoryId ? "e.g., Heritage Cuban Shirt" : "Select category first"}
                required
                disabled={!form.categoryId}
              />
              <Input
                label="Price (INR) *"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
                placeholder="1899"
              />
              <AutocompleteInput
                label="Brand"
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                suggestions={brandSuggestions}
                placeholder={form.categoryId ? "TN16" : "Select category first"}
                required
                disabled={!form.categoryId}
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Inventory"
                type="number"
                min="0"
                value={form.inventory}
                onChange={(e) => handleChange("inventory", e.target.value)}
                placeholder="10"
              />
              <Input
                label="Sizes (comma separated)"
                value={form.sizes}
                onChange={(e) => handleChange("sizes", e.target.value)}
                placeholder="S, M, L, XL"
              />
              <AutocompleteColorsInput
                label="Colors (comma separated)"
                value={form.colors}
                onChange={(e) => handleChange("colors", e.target.value)}
                suggestions={colorSuggestions}
                placeholder={form.categoryId ? "White, Black, Blue" : "Select category first"}
                disabled={!form.categoryId}
              />
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => handleChange("isFeatured", e.target.checked)}
                  className="w-4 h-4 text-neutral-900 rounded focus:ring-neutral-900"
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
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 transition"
              rows="4"
              placeholder="Describe the product..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>

          {/* Image Upload */}
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

          {/* Submit Button */}
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
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              disabled={
                loading ||
                !form.name ||
                !form.price ||
                !form.categoryId ||
                !form.gallery.length
              }
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>

        </form>
        {/* ✅ FORM END */}
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
        className="w-full border-2 border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 transition"
      />
    </label>
  );
}
