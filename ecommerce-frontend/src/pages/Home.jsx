import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getProductImage } from "../utils/imageUtils";
import { getShopPathForCategorySlug } from "../utils/catalogRoutes";
import BannerCarousel from "../components/BannerCarousel";
import ProductGrid from "../components/ProductGrid";
import ProductCard from "../components/ProductCard";

const DEFAULT_FILTERS = [
  { label: "All", slug: "" },
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Kids", slug: "kids" },
  { label: "Dresses", slug: "dresses" },
  { label: "Ethnic", slug: "ethnic" },
];

const FilterChip = memo(function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 h-8 px-3 rounded-full border text-xs font-medium",
        "transition-all duration-200 ease-in-out",
        active
          ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
          : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:shadow-sm hover:scale-[1.02]",
      ].join(" ")}
    >
      {label}
    </button>
  );
});

const SectionWrap = memo(function SectionWrap({ children }) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-3 md:p-4">
        {children}
      </div>
    </div>
  );
});

const DealBlock = memo(function DealBlock({ title, items = [], to = "/catalog" }) {
  const tiles = (items || []).slice(0, 4);
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-3 md:p-4 transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5">
      <div className="text-sm md:text-base font-semibold text-neutral-900">{title}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {tiles.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50 transition-all duration-200 ease-in-out hover:shadow-sm"
          >
            <div className="aspect-square bg-neutral-100">
              <img
                src={getProductImage(p, p.Category?.name || p.category?.name)}
                alt={p.name || ""}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 50vw, 200px"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getProductImage({ name: p.name, category: p.Category?.name || p.category?.name }, p.Category?.name || p.category?.name);
                }}
              />
            </div>
            <div className="p-2">
              <div className="text-xs text-neutral-600 line-clamp-1">
                {p.Category?.name || p.brand || "Store"}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link
        to={to}
        className="mt-3 inline-flex text-sm text-neutral-600 hover:text-neutral-900 transition-all duration-200 ease-in-out"
      >
        See more
      </Link>
    </div>
  );
});

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategorySlug = searchParams.get("category") || "";
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  const { data: categoryResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data;
    },
  });

  const categories = categoryResponse?.items || [];
  const chips = useMemo(() => {
    if (!categories.length) return DEFAULT_FILTERS;
    return [
      { label: "All", slug: "" },
      ...categories.slice(0, 10).map((cat) => ({ label: cat.name, slug: cat.slug })),
    ];
  }, [categories]);

  const categoryRowItems = useMemo(() => {
    const base = categories?.length
      ? categories
      : [
          { id: "c1", name: "Men", slug: "men" },
          { id: "c2", name: "Women", slug: "women" },
          { id: "c3", name: "Kids", slug: "kids" },
          { id: "c4", name: "Dresses", slug: "dresses" },
          { id: "c5", name: "Ethnic", slug: "ethnic" },
        ];
    return base.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      href: c.slug ? `/catalog?category=${encodeURIComponent(c.slug)}` : "/catalog",
    }));
  }, [categories]);

  const { data: featuredResponse, isLoading: featuredLoading } = useQuery({
    queryKey: ["homeFeaturedProducts", activeCategorySlug],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 40, featured: "true" });
      if (activeCategorySlug) params.append("category", activeCategorySlug);
      const res = await axiosClient.get(`/products?${params.toString()}`);
      return res.data;
    },
  });

  const { data: allResponse, isLoading: allLoading } = useQuery({
    queryKey: ["homeAllProducts", activeCategorySlug],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 60 });
      if (activeCategorySlug) params.append("category", activeCategorySlug);
      const res = await axiosClient.get(`/products?${params.toString()}`);
      return res.data;
    },
  });

  const { data: lightningResponse, isLoading: lightningLoading } = useQuery({
    queryKey: ["lightningDeals"],
    queryFn: async () => {
      const res = await axiosClient.get("/products/deals/lightning");
      return res.data;
    },
  });

  const featured = featuredResponse?.items || [];
  const allProducts = allResponse?.items || featured;
  const lightningDeals = lightningResponse?.items || [];

  const topDeals = useMemo(() => featured.slice(0, 20), [featured]);
  const trending = useMemo(() => allProducts.slice(0, 12), [allProducts]);
  const bestSellers = useMemo(() => allProducts.slice(6, 26), [allProducts]);
  const under999 = useMemo(
    () => allProducts.filter((p) => Number(p?.price || 0) <= 999).slice(0, 20),
    [allProducts]
  );
  const recommended = useMemo(() => allProducts.slice(12, 32), [allProducts]);

  const onChip = useCallback(
    (slug) => {
      navigate(slug ? getShopPathForCategorySlug(slug) : "/catalog");
    },
    [navigate]
  );

  const showLoading = featuredLoading || allLoading;

  return (
    <div className="w-full min-h-screen bg-neutral-100 text-neutral-900 overflow-x-hidden">
      <section className="hero-section full-width">
        <div className="hero">
          <BannerCarousel page="home" position="hero" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionWrap>
            <div
              className={[
                "overflow-x-auto scroll-smooth",
                "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 w-max min-w-full pb-1">
                {chips.map((chip) => (
                  <FilterChip
                    key={chip.slug || "all"}
                    label={chip.label}
                    active={activeCategorySlug === chip.slug}
                    onClick={() => onChip(chip.slug)}
                  />
                ))}
              </div>
            </div>
          </SectionWrap>
        </div>
      </section>

      <section className="section category-wrapper">
        <div className="container">
          <div className="category-grid">
            {categoryRowItems.slice(0, 8).map((category) => {
              const label = category.name || category.slug || "Category";
              return (
                <a
                  key={category.slug || category.id || label}
                  href={category.href || `/catalog?category=${encodeURIComponent(category.slug || label.toLowerCase())}`}
                  className="category-card bg-white rounded-xl border border-neutral-200 p-4 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-500 mb-3">
                    Category
                  </div>
                  <div className="text-lg font-semibold text-neutral-900 leading-snug">
                    {label}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DealBlock title="Deals for you" items={allProducts} to="/catalog" />
            <DealBlock title="New season picks" items={recommended} to="/catalog" />
            <DealBlock title="Best sellers" items={bestSellers} to="/catalog" />
            <DealBlock title="Under ₹999" items={under999.length ? under999 : allProducts} to="/catalog" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container space-y-6">
          <ProductGrid
            title="Recommended for you"
            products={recommended}
            loading={featuredLoading || allLoading}
            viewAllTo="/catalog"
          />
          <ProductGrid
            title="Top picks"
            products={topDeals}
            loading={featuredLoading || allLoading}
            viewAllTo="/catalog"
          />
        </div>
      </section>

      <ProductGrid
        title="Top deals"
        products={topDeals}
        loading={showLoading}
        viewAllTo="/catalog"
      />

      {lightningDeals?.length > 0 && (
        <section className="my-4 md:my-6">
          <SectionWrap>
            <DealBlock title="Lightning Deals" items={lightningDeals} />
          </SectionWrap>
        </section>
      )}

      <section className="my-4 md:my-6">
        <SectionWrap>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-neutral-900">Trending now</h2>
            <Link
              to="/catalog"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-all duration-200 ease-in-out"
            >
              View all
            </Link>
          </div>
          <div
            className={[
              "mt-3 -mx-3 md:-mx-4 px-3 md:px-4 overflow-x-auto scroll-smooth",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            ].join(" ")}
          >
            <div className="flex gap-3 w-max min-w-full pb-1">
              {(showLoading ? new Array(8).fill(null) : trending).map((item, idx) => (
                <div key={item?.id || idx} className="w-[170px] sm:w-[190px]">
                  {showLoading ? (
                    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
                      <div className="aspect-square bg-neutral-200/70 animate-pulse" />
                      <div className="p-2">
                        <div className="h-3 w-16 bg-neutral-200/70 rounded animate-pulse" />
                        <div className="mt-2 h-3 w-full bg-neutral-200/70 rounded animate-pulse" />
                        <div className="mt-2 h-3 w-3/5 bg-neutral-200/70 rounded animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <ProductCard product={item} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </SectionWrap>
      </section>

      <ProductGrid
        title="Best sellers"
        products={bestSellers}
        loading={showLoading}
        viewAllTo="/catalog"
      />

      <section className="my-4 md:my-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div
            className={[
              "relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm h-[150px] md:h-[190px]",
              "transition-all duration-200 ease-in-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            ].join(" ")}
          >
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=60"
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10" />
            <div className="absolute inset-0 p-4 md:p-6 flex items-center">
              <div className="text-white">
                <h3 className="text-xl md:text-2xl font-semibold">EXTRA 40% OFF</h3>
                <p className="mt-1 text-sm md:text-base text-white/90">
                  Limited-time offer on selected fashion styles.
                </p>
                <Link
                  to="/offers/extra-40-off"
                  className="mt-3 inline-flex h-9 items-center rounded-md bg-white text-neutral-900 px-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  Shop offer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductGrid
        title="Under ₹999"
        products={under999}
        loading={showLoading}
        viewAllTo="/catalog"
      />

      <ProductGrid
        title="Recommended for you"
        products={recommended}
        loading={showLoading}
        viewAllTo="/catalog"
      />
    </div>
  );
}
