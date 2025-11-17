import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroBanner from "../components/HeroBanner";
import CategoryGrid from "../components/CategoryGrid";
import ProductCard from "../components/ProductCard";
import axiosClient from "../api/axiosClient";

const fallbackFilters = [
  { label: "Men's Shirts", slug: "mens-shirts" },
  { label: "Women Kurtas", slug: "women-kurtas" },
  { label: "Kids Wear", slug: "kids-wear" },
  { label: "Athleisure", slug: "athleisure" },
  { label: "Accessories", slug: "accessories" },
];

const fallbackProducts = [
  {
    id: "fallback-1",
    name: "TN16 Heritage Cuban Shirt",
    price: 1899,
    discount: 200,
    brand: "TN16",
    thumbnail:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    Category: { name: "Men" },
  },
  {
    id: "fallback-2",
    name: "Zari Pinstripe Kurta Set",
    price: 2499,
    discount: 0,
    brand: "TN16",
    thumbnail:
      "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=800&q=80",
    Category: { name: "Women" },
  },
  {
    id: "fallback-3",
    name: "Organic Playtime Co-ord",
    price: 1299,
    discount: 150,
    brand: "TN16",
    thumbnail:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
    Category: { name: "Kids" },
  },
  {
    id: "fallback-4",
    name: "FlexMove Athleisure Hoodie",
    price: 1699,
    discount: 100,
    brand: "TN16",
    thumbnail:
      "https://images.unsplash.com/photo-1484519332611-516457305ff6?auto=format&fit=crop&w=800&q=80",
    Category: { name: "Athleisure" },
  },
];

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${
      active
        ? "bg-pink-600 text-white border-pink-600"
        : "bg-white text-gray-700 border-gray-200 hover:border-pink-400"
    }`}
  >
    {label}
  </button>
);

export default function Home() {
  const [activeCategorySlug, setActiveCategorySlug] = useState("");

  const { data: categoryResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data;
    },
  });

  const categories = categoryResponse?.items || [];

  const filterChips = useMemo(() => {
    if (!categories.length) return fallbackFilters;
    return categories.slice(0, 6).map((cat) => ({
      label: cat.name,
      slug: cat.slug,
    }));
  }, [categories]);

  const {
    data: productResponse,
    isLoading: productsLoading,
    isError,
  } = useQuery({
    queryKey: ["featuredProducts", activeCategorySlug],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 12, featured: "true" });
      if (activeCategorySlug) params.append("categorySlug", activeCategorySlug);
      const res = await axiosClient.get(`/products?${params.toString()}`);
      return res.data;
    },
  });

  const products = productResponse?.items || [];
  const displayProducts =
    !productsLoading && !products.length ? fallbackProducts : products;

  return (
    <div className="bg-gray-50">
      <HeroBanner />

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <FilterChip
            label="All Fits"
            active={!activeCategorySlug}
            onClick={() => setActiveCategorySlug("")}
          />
          {filterChips.map((chip) => (
            <FilterChip
              key={chip.slug}
              label={chip.label}
              active={activeCategorySlug === chip.slug}
              onClick={() => setActiveCategorySlug(chip.slug)}
            />
          ))}
        </div>
      </section>

      <CategoryGrid categories={categories} loading={categoriesLoading} />

      <section className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-pink-500 font-semibold">
              Inspired by LimeRoad
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Cotton Drops
            </h2>
          </div>
          <button className="text-sm font-semibold text-pink-600 hover:text-pink-700">
            View catalog
          </button>
        </div>

        {isError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            Failed to load apparel picks. Please try again.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {productsLoading
            ? new Array(8).fill(null).map((_, idx) => (
                <div
                  key={idx}
                  className="h-80 bg-white rounded-2xl animate-pulse"
                ></div>
              ))
            : displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}

          {!productsLoading && !products.length && (
            <div className="col-span-full text-center text-gray-500">
              Showing curated TN16 looks while live inventory syncs.
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900">
            Craft from Tirupur
          </h3>
          <p className="text-gray-600 mt-2">
            Every TN16 weave passes through breathable cotton checks, azo-free
            dyes and festival-ready finishing inspired by South-Indian verandas.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• Hypoallergenic cotton blends for humid climates</li>
            <li>• LimeRoad-style curation with visual storytelling</li>
            <li>• Rapid dispatch with eco packaging</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-orange-400 rounded-3xl text-white p-6 shadow-lg">
          <h3 className="text-xl font-bold">TN16 Tirupur Cotton</h3>
          <p className="text-white/90 mt-2">
            New arrivals drop every Thursday. Get early access as an insider.
          </p>
          <button className="mt-6 bg-white text-pink-600 font-semibold px-6 py-3 rounded-full shadow-lg">
            Join Insider Club
          </button>
        </div>
      </section>
    </div>
  );
}
