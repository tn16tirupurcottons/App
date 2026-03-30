import React, { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import CategoryGrid from "../components/CategoryGrid";
import ProductCard from "../components/ProductCard";
import BannerCarousel from "../components/BannerCarousel";
import axiosClient from "../api/axiosClient";
import { getShopPathForCategorySlug } from "../utils/catalogRoutes";
import { segmentThemes } from "../data/segments";
import { categoryStock } from "../data/visualAssets";
import { handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";
import { useSegmentTiles } from "../hooks/useSegmentTiles";
import {
  EditorsPicksSection,
  SeasonalCollectionsSection,
  SpecialOffersSection,
  CuratedLooksSection,
  HeroOfferBanner,
} from "../components/LuxurySections";
import { AuthContext } from "../context/AuthContext";

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
    thumbnail: categoryStock.men,
    Category: { name: "Men" },
  },
  {
    id: "fallback-2",
    name: "Two-piece Kurta Set",
    price: 2499,
    discount: 0,
    brand: "TN16",
    thumbnail: categoryStock.women,
    Category: { name: "Women" },
  },
  {
    id: "fallback-3",
    name: "Organic Playtime Co-ord",
    price: 1299,
    discount: 150,
    brand: "TN16",
    thumbnail: categoryStock.kids,
    Category: { name: "Kids" },
  },
  {
    id: "fallback-4",
    name: "FlexMove Athleisure Hoodie",
    price: 1699,
    discount: 100,
    brand: "TN16",
    thumbnail: categoryStock.athleisure,
    Category: { name: "Athleisure" },
  },
  {
    id: "fallback-5",
    name: "Premium Cotton Tee",
    price: 899,
    discount: 100,
    brand: "TN16",
    thumbnail: categoryStock.men,
    Category: { name: "Men" },
  },
  {
    id: "fallback-6",
    name: "Cotton Dress",
    price: 3499,
    discount: 300,
    brand: "TN16",
    thumbnail: categoryStock.women,
    Category: { name: "Women" },
  },
  {
    id: "fallback-7",
    name: "Kids Cotton Set",
    price: 999,
    discount: 100,
    brand: "TN16",
    thumbnail: categoryStock.kids,
    Category: { name: "Kids" },
  },
  {
    id: "fallback-8",
    name: "Activewear Pullover",
    price: 1599,
    discount: 200,
    brand: "TN16",
    thumbnail: categoryStock.athleisure,
    Category: { name: "Athleisure" },
  },
];

const FilterChip = ({ label, active, slug, navigate }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(slug ? getShopPathForCategorySlug(slug) : "/catalog");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 ease-in-out border cursor-pointer ${
        active
          ? "bg-neutral-900 text-white border-neutral-900 font-semibold shadow-sm"
          : "bg-white text-neutral-600 border-neutral-200 hover:text-neutral-900 hover:border-neutral-400"
      }`}
    >
      {label}
    </button>
  );
};

const fallbackCoupons = [
  { code: "TN16SAVE", text: "Get 25% off up to ₹200" },
  { code: "INSIDER", text: "Extra 10% for Insider members" },
  { code: "FLAT100", text: "Flat ₹100 off on ₹999+" },
];

const formatCouponText = (c) => {
  try {
    if (!c) return "";
    if (c.discount_type === "percentage") {
      const cap = c.max_discount ? ` up to ₹${Math.round(Number(c.max_discount))}` : "";
      return `Save ${Math.round(Number(c.discount_value))}%${cap}`;
    }
    if (c.discount_type === "flat") return `Save ₹${Math.round(Number(c.discount_value))}`;
    return "";
  } catch {
    return "";
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategorySlug = searchParams.get("category") || "";
  const { user } = useContext(AuthContext);

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
    return categories.map((cat) => ({
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

  const { data: eligibleCouponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ["eligibleCouponsHome"],
    enabled: !!user,
    queryFn: async () => {
      const res = await axiosClient.get("/coupons/eligible");
      return res.data?.items || [];
    },
  });
  const coupons = !user
    ? fallbackCoupons
    : couponsLoading
      ? fallbackCoupons
      : eligibleCouponsData?.length
        ? eligibleCouponsData.map((c) => ({
            code: c.code,
            text: formatCouponText(c),
          }))
        : [];

  const products = productResponse?.items || [];
  const displayProducts =
    !productsLoading && !products.length ? fallbackProducts : products;
  const segmentOrder = ["men", "women", "kids", "genz"];

  return (
    <div className="text-zinc-100 w-full min-h-screen overflow-x-hidden">
      <section className="relative w-screen max-w-[100vw] left-1/2 -translate-x-1/2 px-0 pt-2 sm:pt-3 md:pt-4">
        <BannerCarousel page="home" position="hero" />
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all duration-300 ease-in-out hover:border-neutral-300 hover:shadow-md shadow-sm"
          >
            <div>
              <p className="pill text-neutral-500">Promos</p>
              <p className="text-neutral-900 font-medium mt-2 text-sm sm:text-base">{coupon.text}</p>
            </div>
            <span className="text-neutral-700 tracking-[0.25em] text-xs font-bold shrink-0 font-mono">
              {coupon.code}
            </span>
          </div>
        ))}
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <FilterChip
            label="All Fits"
            active={!activeCategorySlug}
            slug={null}
            navigate={navigate}
          />
          {filterChips.map((chip) => (
            <FilterChip
              key={chip.slug}
              label={chip.label}
              active={activeCategorySlug === chip.slug}
              slug={chip.slug}
              navigate={navigate}
            />
          ))}
        </div>
      </section>

      <CategoryGrid categories={categories} loading={categoriesLoading} />

      {segmentOrder.map((key, index) => {
        const segment = segmentThemes[key];
        if (!segment) return null;
        return (
          <SegmentBand
            key={segment.key}
            segment={segment}
            flip={index % 2 === 1}
          />
        );
      })}

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="pill text-zinc-500">Featured</p>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display text-white uppercase tracking-[0.04em]">
              New drops
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs uppercase tracking-[0.25em] text-zinc-500 hover:text-sky-400 transition-colors duration-300 ease-in-out"
          >
            View all →
          </Link>
        </div>

        {isError && (
          <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm">
            Failed to load apparel picks. Please try again.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {productsLoading
            ? new Array(8).fill(null).map((_, idx) => (
                <div
                  key={idx}
                  className="h-72 sm:h-80 bg-zinc-800 rounded-2xl sm:rounded-3xl animate-pulse"
                ></div>
              ))
            : displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}

          {!productsLoading && !products.length && (
            <div className="col-span-full text-center text-neutral-500 text-sm">
              Showing curated picks while live inventory syncs.
            </div>
          )}
        </div>
      </section>

      <EditorsPicksSection />
      <SeasonalCollectionsSection />
      <SpecialOffersSection />
      <CuratedLooksSection />
      <HeroOfferBanner />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-8 sm:p-10 transition-all duration-300 ease-in-out hover:border-white/20">
          <h3 className="text-3xl sm:text-4xl font-display text-white uppercase tracking-[0.06em]">
            Tirupur craft
          </h3>
          <p className="text-zinc-400 mt-4 text-sm sm:text-base leading-relaxed">
            Every TN16 weave passes breathable cotton checks, azo-free dyes and
            festival-ready finishing.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-zinc-300 border-t border-white/10 pt-6">
            <li className="flex gap-2"><span className="text-sky-400">—</span> Hypoallergenic blends for humid climates</li>
            <li className="flex gap-2"><span className="text-sky-400">—</span> Atelier-grade curation</li>
            <li className="flex gap-2"><span className="text-sky-400">—</span> Fast dispatch · eco packaging</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-zinc-900 to-black p-8 sm:p-10 transition-all duration-300 ease-in-out hover:border-sky-400/40 hover:shadow-glow">
          <h3 className="text-3xl sm:text-4xl font-display text-white uppercase tracking-[0.06em]">
            Insider access
          </h3>
          <p className="text-zinc-400 mt-4 text-sm sm:text-base">
            New arrivals weekly. Join for drops and codes.
          </p>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="mt-8 w-full sm:w-auto bg-white text-black px-8 py-3 rounded-none tracking-[0.25em] uppercase text-xs font-bold hover:bg-sky-400 transition-all duration-300 ease-in-out active:scale-[0.98]"
          >
            Join
          </button>
        </div>
      </section>
    </div>
  );
}

function SegmentBand({ segment, flip }) {
  const navigate = useNavigate();
  const dynamicTiles = useSegmentTiles(segment.key);
  const tiles = dynamicTiles.filter(Boolean).length ? dynamicTiles : segment.tiles?.filter(Boolean) || [];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div
        className={`card flex flex-col lg:flex-row gap-0 lg:gap-6 overflow-hidden transition-all duration-300 ease-out hover:shadow-md ${
          flip ? "lg:flex-row-reverse" : ""
        }`}
      >
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center flex-1 min-w-0 bg-white">
          <p className="pill text-neutral-500">{segment.label} edit</p>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-display mt-4 text-neutral-900 uppercase tracking-[0.04em] leading-tight">
            {segment.description}
          </h3>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  segment.key === "men"
                    ? "/men"
                    : segment.key === "women"
                      ? "/women"
                      : segment.key === "kids"
                        ? "/kids"
                        : `/catalog?segment=${segment.key}`
                )
              }
              className="px-6 py-3 rounded-full bg-neutral-900 text-white text-xs sm:text-sm tracking-[0.2em] font-bold uppercase hover:bg-neutral-800 transition-all duration-300 ease-in-out active:scale-[0.98]"
            >
              Shop {segment.label}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(`/catalog?segment=${segment.key}&view=studio`)
              }
              className="px-6 py-3 rounded-full border border-neutral-300 text-xs sm:text-sm tracking-[0.15em] text-neutral-700 hover:text-neutral-900 hover:border-neutral-900 transition-all duration-300 ease-in-out bg-white"
            >
              Explore
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-[280px] sm:min-h-[320px] lg:min-h-0 p-3 sm:p-5 lg:max-w-[52%] flex flex-col min-h-0">
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full min-h-[260px] sm:min-h-[300px] flex-1 min-h-0 [grid-template-rows:1fr_1fr]">
            {tiles[0] && (
              <div className="row-span-2 col-start-1 rounded-xl overflow-hidden border border-white/10 shadow-medium group min-h-0">
                <img
                  src={tiles[0]}
                  alt={`${segment.label} spotlight`}
                  className="w-full h-full object-cover min-h-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width:1024px) 50vw, 400px"
                  onError={(e) => handleImageError(e, FALLBACK_IMAGES.default)}
                />
              </div>
            )}
            {tiles[1] && (
              <div className="col-start-2 row-start-1 rounded-2xl overflow-hidden border border-black/[0.08] shadow-soft group min-h-0">
                <img
                  src={tiles[1]}
                  alt={`${segment.label} detail`}
                  className="w-full h-full object-cover min-h-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width:1024px) 50vw, 240px"
                  onError={(e) => handleImageError(e, FALLBACK_IMAGES.default)}
                />
              </div>
            )}
            {tiles[2] && (
              <div className="col-start-2 row-start-2 rounded-xl overflow-hidden border border-neutral-200 shadow-sm group bg-neutral-50 min-h-0">
                <img
                  src={tiles[2]}
                  alt={`${segment.label} look`}
                  className="w-full h-full object-cover min-h-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width:1024px) 50vw, 240px"
                  onError={(e) => handleImageError(e, FALLBACK_IMAGES.default)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
