import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import CategoryHeroBanner from "./CategoryHeroBanner";
import ProductCard from "./ProductCard";
import DealTimer from "./DealTimer";
import StockProgress from "./StockProgress";
import OfferBadge from "./OfferBadge";
import ProductList from "../components/ProductList";
import { getProductImage } from "../utils/imageUtils";

const formatCategoryLabel = (slug) => {
  if (!slug) return "Category";
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const fetchOffers = async (categorySlug) => {
  const res = await axiosClient.get(`/offers/category/${categorySlug}`);
  return res.data;
};

const fetchLightningDeals = async (categorySlug) => {
  const res = await axiosClient.get(`/deals/category/${categorySlug}`);
  return res.data;
};

const DealCard = ({ product }) => {
  const finalPrice = Number(product.price || 0) - Number(product.discount || 0);
  const remaining = Math.max(0, Number(product.dealStock || 0) - Number(product.dealSold || 0));
  return (
    <div className="min-w-[280px] max-w-[280px] shrink-0 rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
      <div className="relative h-56 overflow-hidden bg-neutral-100">
        <img
          src={getProductImage(product, product.Category?.name)}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <OfferBadge label="Lightning" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="text-base font-semibold text-neutral-900 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-neutral-900">₹{finalPrice.toFixed(0)}</span>
          {product.discount > 0 && (
            <span className="text-xs line-through text-neutral-400">₹{Number(product.price || 0).toFixed(0)}</span>
          )}
        </div>
        <DealTimer endTime={product.dealEndTime} />
        <StockProgress remaining={remaining} total={Number(product.dealStock || 0)} />
      </div>
    </div>
  );
};

export default function CategoryMarketing({ categorySlug }) {
  const categoryLabel = formatCategoryLabel(categorySlug);

  const { data: offersResponse, isLoading: offersLoading, isError: offersError } = useQuery({
    queryKey: ["categoryOffers", categorySlug],
    queryFn: () => fetchOffers(categorySlug),
    enabled: Boolean(categorySlug),
    staleTime: 1000 * 60 * 5,
  });

  const { data: lightningResponse, isLoading: lightningLoading, isError: lightningError } = useQuery({
    queryKey: ["categoryLightning", categorySlug],
    queryFn: () => fetchLightningDeals(categorySlug),
    enabled: Boolean(categorySlug),
    staleTime: 1000 * 60 * 5,
  });

  const offers = offersResponse?.items || [];
  const lightningDeals = lightningResponse?.items || [];

  const hasOffers = offers.length > 0;
  const hasDeals = lightningDeals.length > 0;

  const heroDisclaimer = hasDeals
    ? `Deal prices update in real time for ${categoryLabel}.`
    : `Curated offers and new arrivals for ${categoryLabel}.`;

  return (
    <div className="space-y-12">
      <CategoryHeroBanner categorySlug={categorySlug} />

      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">Category marketing</p>
            <h2 className="mt-3 text-3xl font-semibold text-neutral-900">{categoryLabel} campaigns</h2>
          </div>
          <p className="text-sm text-neutral-600 max-w-2xl">{heroDisclaimer}</p>
        </div>
      </section>

      {hasDeals && (
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">Lightning Deals</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-900">Flash offers ending soon</h3>
            </div>
            <p className="text-sm text-neutral-600">Only best sellers with limited stock.</p>
          </div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-3">
            {lightningLoading ? (
              <div className="flex gap-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="min-w-[280px] h-72 rounded-3xl bg-neutral-100 animate-pulse" />
                ))}
              </div>
            ) : (
              lightningDeals.map((product) => <DealCard key={product.id} product={product} />)
            )}
          </div>
        </section>
      )}

      {hasOffers && (
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">Category Offers</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-900">Top discounts in {categoryLabel}</h3>
            </div>
            <p className="text-sm text-neutral-600">Sorted by highest discount.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.slice(0, 6).map((product) => (
              <div key={product.id} className="relative rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="absolute top-4 right-4">
                  <OfferBadge label={product.offerTag || "Offer"} />
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">Category shop</p>
          <h2 className="mt-2 text-3xl font-semibold text-neutral-900">Browse {categoryLabel}</h2>
        </div>
        <ProductList initialQuery={{ categorySlug }} />
      </section>
    </div>
  );
}
