import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import ProductCard from "../components/ProductCard";
import { ChevronDown } from "lucide-react";

const OFFER_TAGS = [
  { value: "", label: "All Offers" },
  { value: "extra-40-off", label: "Extra 40% Off" },
  { value: "summer-sale", label: "Summer Sale" },
  { value: "limited-time", label: "Limited Time" },
  { value: "flash-sale", label: "Flash Sale" },
];

export default function Offers() {
  const [selectedTag, setSelectedTag] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["offers", selectedTag],
    queryFn: async () => {
      const params = { limit: 100 };
      if (selectedTag) params.offerTag = selectedTag;
      const qs = new URLSearchParams(params).toString();
      const res = await axiosClient.get(`/products?${qs}&offer=true`);
      return res.data;
    },
    retry: 1,
  });

  // Show products with any discount or marked as offers
  const products = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((p) => {
      const hasDiscount = Number(p.discount || 0) > 0 || Number(p.discountPercentage || 0) > 0;
      const isOffer = p.isOnOffer === true;
      return hasDiscount || isOffer;
    });
  }, [data]);

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-gradient-to-r from-neutral-900 to-neutral-800 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1600&q=75')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="relative z-10 text-center max-w-2xl px-6">
          <div className="inline-block bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-4">
            Exclusive Deals
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white uppercase tracking-tighter leading-tight">
            Extra 40% Off
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80">Curated offers, best deals, limited time savings.</p>
          <p className="mt-3 text-xs sm:text-sm text-white/70">⏱️ Limited time offer · Grab before sold out</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-12 sm:py-16">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Filter by:</span>
          <div className="flex flex-wrap gap-2">
            {OFFER_TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => setSelectedTag(tag.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTag === tag.value
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700 font-medium">Unable to load offers right now.</p>
            <p className="text-red-600 text-sm mt-1">Please try again later.</p>
          </div>
        )}

        {/* Products Grid */}
        {!isError && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {isLoading ? "Loading..." : `${products.length} offer${products.length !== 1 ? "s" : ""} available`}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {selectedTag ? `Showing: ${selectedTag.replace(/-/g, " ")}` : "Showing all offers"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {isLoading
                ? new Array(12).fill(null).map((_, idx) => (
                    <div key={idx} className="aspect-[3/4] rounded-lg bg-neutral-100 animate-pulse" />
                  ))
                : products.length > 0
                ? products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                : null}
            </div>

            {!isLoading && products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No offers at the moment</h3>
                <p className="text-neutral-600 mb-6">Check back soon for amazing deals on your favorite items.</p>
                <a
                  href="/catalog"
                  className="inline-block bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition"
                >
                  Browse All Products
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
