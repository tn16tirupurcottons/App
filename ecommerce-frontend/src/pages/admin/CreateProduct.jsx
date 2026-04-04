import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../admin/components/AdminLayout";
import EnhancedImageUploader from "../../components/EnhancedImageUploader";
import AutocompleteInput from "../../components/AutocompleteInput";
import { useToast } from "../../components/Toast";
import axiosClient from "../../api/axiosClient";

const initialForm = {
  name: "",
  price: "",
  brand: "",
  parentCategoryId: "",
  categoryId: "",
  description: "",
  inventory: 10,
  sizes: "S,M,L,XL",
  colors: "White,Black",
  gallery: [],
};

export default function CreateProduct() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data.items || [];
    },
  });

  // 🔥 STATIC PRODUCT NAMES
  const staticNames = {
    "mens-wear": [
      "Slim Fit Shirt",
      "Casual Shirt",
      "Formal Shirt",
      "Denim Shirt",
      "Linen Shirt",
      "Polo Shirt",
      "T-Shirt",
      "Henley Shirt",
      "Oxford Shirt",
      "Chino Pants",
      "Casual Jacket",
      "Blazer",
      "Hoodie",
      "Sweater",
      "Cargo Pants",
      "Jeans",
      "Short Sleeve Tee",
      "Full Sleeve Shirt",
      "Premium Cotton Shirt",
      "Urban Wear"
    ],
    "womens-wear": [
      "Floral Dress",
      "Party Dress",
      "Maxi Dress",
      "Kurti Set",
      "Designer Dress",
      "Summer Dress",
      "Cocktail Dress",
      "Evening Gown",
      "Casual Shirt",
      "Blouse",
      "Saree",
      "Lehenga",
      "Salwar Top",
      "Ethnic Suit",
      "Palazzo Pants",
      "Jeans",
      "Cardigan",
      "Sweater Dress",
      "Sundress",
      "Designer Top"
    ],
    "kids-wear": [
      "Boys T-Shirt",
      "Girls Dress",
      "Kids Wear Set",
      "Cartoon Print Tee",
      "School Uniform",
      "Party Wear Dress",
      "Casual Shorts",
      "Jogger Pants",
      "Hoodie Jacket",
      "Denim Jacket",
      "Summer Dress",
      "Ethnic Wear",
      "Sports Shirt",
      "Casual Dress",
      "Printed Tee",
      "Windbreaker Jacket",
      "Jersey Shirt",
      "Playsuit",
      "Party Suit",
      "Trendy Outfit"
    ],
    "ethnic-wear": [
      "Traditional Saree",
      "Lehenga Choli",
      "Anarkali Suit",
      "Salwar Kameez",
      "Kurta Pajama",
      "Silk Saree",
      "Embroidered Suit",
      "Chikankari Kurta",
      "Bandhani Dress",
      "Block Print Saree",
      "Tiered Skirt",
      "Traditional Blouse",
      "Gharara",
      "Sharara",
      "Chaniya Choli",
      "Dhoti Kurta",
      "Silk Dupatta",
      "Embellished Dress",
      "Festival Wear",
      "Heritage Collection"
    ],
    "western-wear": [
      "Denim Jeans",
      "Casual T-Shirt",
      "Button-Up Shirt",
      "Leather Jacket",
      "Denim Jacket",
      "Cargo Pants",
      "Shorts",
      "Hoodie",
      "Sweatshirt",
      "Sneaker Outfit",
      "Bomber Jacket",
      "Flannel Shirt",
      "Tank Top",
      "Skirt",
      "Casual Blazer",
      "Joggers",
      "Jumpsuit",
      "Kaftan",
      "Dungarees",
      "Street Style"
    ],
    "casual-wear": [
      "Casual Shirt",
      "Comfortable Tee",
      "Lounge Pants",
      "Relaxed Fit Tee",
      "Cotton Saree",
      "Comfort Dress",
      "Weekend Wear",
      "Work From Home",
      "Casual Pants",
      "Slip-On Jacket",
      "Relaxed Shirt",
      "Casual Shorts",
      "Hoodie Tee",
      "Casual Kurta",
      "Comfortable Dress",
      "Soft Cotton Shirt",
      "Casual Skirt",
      "Linen Pants",
      "Comfort Top",
      "Easy Breezy Wear"
    ],
    "formal-wear": [
      "Formal Shirt",
      "Dress Pants",
      "Blazer Jacket",
      "Formal Suit",
      "Dress Shoes",
      "Saree",
      "Formal Gown",
      "Executive Suit",
      "Formal Kurta",
      "Tie",
      "Dress Coat",
      "Formal Blouse",
      "Pencil Skirt",
      "Formal Dress",
      "Professional Wear",
      "Office Suit",
      "Formal Top",
      "Black Formal Dress",
      "Corporate Outfit",
      "Premium Formal"
    ],
    "party-wear": [
      "Evening Gown",
      "Cocktail Dress",
      "Party Dress",
      "Sequin Dress",
      "Art Silk Saree",
      "Lehenga Top",
      "Silk Dress",
      "Glamour Outfit",
      "Festival Wear",
      "Velvet Dress",
      "Embellished Gown",
      "Satin Dress",
      "Beaded Dress",
      "Party Suit",
      "Festive Outfit",
      "Celebration Dress",
      "Luxury Wear",
      "Designer Dress",
      "Elegant Gown",
      "Statement Dress"
    ],
    "summer-wear": [
      "Summer Dress",
      "Light Shirt",
      "Linen Dress",
      "Cotton Saree",
      "Sleeveless Dress",
      "Summer Shorts",
      "Light Pants",
      "Breathable Tee",
      "Sun Dress",
      "Beach Wear",
      "White Cotton Shirt",
      "Summer Kurta",
      "Light Jacket",
      "Breezy Dress",
      "Cool Shirt",
      "Summer Top",
      "Light Blouse",
      "Cotton Dress",
      "Summer Skirt",
      "Heat-Friendly Outfit"
    ],
    "winter-wear": [
      "Winter Jacket",
      "Sweater",
      "Wool Coat",
      "Shawl",
      "Scarf",
      "Thermal Wear",
      "Hoodie",
      "Fleece Jacket",
      "Cardigan",
      "Wool Pants",
      "Warm Dress",
      "Wool Saree",
      "Waistcoat",
      "Pullover",
      "Winter Kurta",
      "Quilted Jacket",
      "Thermal Shirt",
      "Chunky Knit",
      "Warm Leggings",
      "Cozy Outfit"
    ],
  };

  // 🔥 SUGGESTIONS
  const rootCategories = categories.filter((cat) => !cat.parentId);
  const subCategories = categories.filter((cat) => String(cat.parentId) === String(form.parentCategoryId));

  const productNameSuggestions = useMemo(() => {
    if (!form.categoryId || !categories.length) return [];
    const selected = categories.find((c) => String(c.id) === String(form.categoryId));
    return staticNames[selected?.slug] || [];
  }, [form.categoryId, categories]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleParentCategoryChange = (value) => {
    // Keep the parent category as the selected product category by default.
    // Optional child selection can narrow the product into a sub-category.
    setForm((prev) => ({
      ...prev,
      parentCategoryId: value,
      categoryId: value,
    }));
  };

  // 🚀 AUTO FILL NAME
  const autoFillName = () => {
    if (!form.categoryId) {
      toast.error("Select category first");
      return;
    }

    const selected = categories.find(c => c.id === form.categoryId);
    const names = staticNames[selected.slug] || [];

    const randomName = names[Math.floor(Math.random() * names.length)];
    handleChange("name", randomName);

    toast.success("Auto name filled 🔥");
  };

  // 🧠 AI DESCRIPTION GENERATOR
  const generateDescription = () => {
    if (!form.name) {
      toast.error("Enter product name first");
      return;
    }

    const desc = `${form.name} designed for modern comfort and style. Crafted from premium quality fabric, this outfit offers breathability, durability, and a perfect fit for everyday wear. Ideal for both casual and semi-formal occasions.`;

    handleChange("description", desc);
    toast.success("AI Description generated ✨");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error("Please choose a category");
      return;
    }
    if (!form.name?.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error("Enter a valid price greater than 0");
      return;
    }
    if (!form.gallery?.length) {
      toast.error("Please upload at least 1 product image");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        categoryId: form.categoryId,
        thumbnail: form.gallery[0],
      };

      const res = await axiosClient.post("/admin/products", payload);
      toast.success(res.data?.message || "Product created!");
      navigate("/admin/products");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Error creating product";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Create Product">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">

        {/* CATEGORY */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Main category</label>
            <select
              value={form.parentCategoryId}
              onChange={(e) => handleParentCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select main category</option>
              {rootCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Sub-category</label>
            <select
              value={form.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              disabled={!form.parentCategoryId || !subCategories.length}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="">Select sub-category (optional)</option>
              {subCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PRODUCT NAME */}
        <AutocompleteInput
          label="Product Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          suggestions={productNameSuggestions}
        />

        <button type="button" onClick={autoFillName}>
          ⚡ Auto Fill Name
        </button>

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <button type="button" onClick={generateDescription}>
          🤖 Generate Description
        </button>

        {/* PRICE */}
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />

        {/* IMAGE */}
        <EnhancedImageUploader
          images={form.gallery}
          onChange={(images) => handleChange("gallery", images)}
        />

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 transition"
          >
            Cancel / Back
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create & Back"}
          </button>
        </div>

      </form>
    </AdminLayout>
  );
}