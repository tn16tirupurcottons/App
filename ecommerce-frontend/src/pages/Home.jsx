import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import CategoryGrid from "../components/CategoryGrid";
import ProductCard from "../components/ProductCard";
import axiosClient from "../api/axiosClient";
import { heroSlides, segmentThemes } from "../data/segments";

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
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm tracking-[0.3em] uppercase transition border cursor-pointer ${
      active
        ? "bg-primary text-white border-primary shadow-soft"
        : "bg-transparent text-muted border-border hover:text-primary hover:border-primary hover:shadow-soft"
    }`}
  >
    {label}
  </button>
);

const coupons = [
  { code: "TN16SAVE", text: "Get 25% off up to ₹200" },
  { code: "FREESHIP", text: "Free shipping on ₹1499+" },
  { code: "INSIDER", text: "Extra 10% for Insider members" },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeCategorySlug, setActiveCategorySlug] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

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
  const segmentOrder = ["men", "women", "kids", "genz"];

  useEffect(() => {
    const timer = setInterval(
      () => setActiveSlide((prev) => (prev + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <div className="bg-white text-dark">
      {/* Hero carousel */}
      <section
        className={`relative overflow-hidden rounded-[40px] border border-border mx-4 lg:mx-auto max-w-7xl mt-8 bg-gradient-to-br ${currentSlide.gradient} shadow-medium`}
      >
        <div className="grid lg:grid-cols-2 gap-10 items-center px-6 lg:px-12 py-12">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-border bg-light text-muted text-[10px] uppercase tracking-[0.35em]">
              {currentSlide.badge}
            </p>
            <h1 className="text-3xl sm:text-4xl font-display leading-tight text-dark">
              {currentSlide.title}
            </h1>
            <p className="text-dark/70 text-base sm:text-lg leading-relaxed">
              {currentSlide.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => {
                  const segment = currentSlide.segment || "women";
                  navigate(`/catalog?segment=${segment}`);
                }}
                className="px-6 py-3 rounded-full bg-primary text-white font-semibold tracking-[0.3em] hover:bg-primary/90"
              >
                {currentSlide.ctaPrimary}
              </button>
              <button
                onClick={() => {
                  const segment = currentSlide.segment || "genz";
                  navigate(`/catalog?segment=${segment}&view=studio`);
                }}
                className="px-6 py-3 rounded-full border border-border text-dark/80 hover:text-primary hover:border-primary"
              >
                {currentSlide.ctaSecondary}
              </button>
            </div>
          </div>
          <div className="rounded-[32px] overflow-hidden border border-border shadow-medium">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full aspect-[16/9] object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-center pb-6">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 w-8 rounded-full ${
                idx === activeSlide ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Offer slab */}
      <section className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="card p-5 flex items-center justify-between"
          >
            <div>
              <p className="pill text-muted">Privilege</p>
              <p className="text-dark font-semibold mt-2">{coupon.text}</p>
            </div>
            <span className="text-primary tracking-[0.4em] font-semibold">{coupon.code}</span>
          </div>
        ))}
      </section>

      {/* Category filter pills */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
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

      <section className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="pill text-muted">Featured</p>
            <h2 className="text-2xl sm:text-3xl font-display text-dark">
              Featured cotton drops
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs uppercase tracking-[0.3em] text-muted hover:text-primary"
          >
            View catalog →
          </Link>
        </div>

        {isError && (
          <div className="p-4 bg-red-500/10 text-red-300 rounded-2xl border border-red-500/30">
            Failed to load apparel picks. Please try again.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
          {productsLoading
            ? new Array(8).fill(null).map((_, idx) => (
                <div
                  key={idx}
                  className="h-80 bg-light rounded-[32px] animate-pulse"
                ></div>
              ))
            : displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}

          {!productsLoading && !products.length && (
            <div className="col-span-full text-center text-muted">
              Showing curated TN16 looks while live inventory syncs.
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-xl font-display text-dark">Craft from Tirupur</h3>
          <p className="text-muted mt-3 text-sm sm:text-base leading-relaxed">
            Every TN16 weave passes breathable cotton checks, azo-free dyes and
            festival-ready finishing.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-dark/70">
            <li>• Hypoallergenic cotton blends for humid climates</li>
            <li>• Visual storytelling with atelier curation</li>
            <li>• Rapid dispatch with eco packaging</li>
          </ul>
        </div>
        <div className="rounded-[32px] border border-border bg-gradient-to-br from-primary/10 to-secondary/10 p-6 shadow-medium">
          <h3 className="text-xl font-display text-dark">TN16 Tirupur Cotton</h3>
          <p className="text-dark/80 mt-3 text-sm sm:text-base">
            New arrivals drop every Thursday. Get early access as an insider.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="mt-6 bg-primary text-white px-5 py-3 rounded-full tracking-[0.3em] uppercase text-xs hover:bg-primary/90"
          >
            Join Insider Club
          </button>
        </div>
      </section>
    </div>
  );
}

function SegmentBand({ segment, flip }) {
  const navigate = useNavigate();
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div
        className={`card flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden ${
          flip ? "md:flex-row-reverse" : ""
        }`}
      >
        <div className="p-6 md:p-10 flex flex-col justify-center flex-1">
          <p className="pill text-muted">{segment.label} Edit</p>
          <h3 className="text-2xl font-display mt-3 text-dark">{segment.description}</h3>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/catalog?segment=${segment.key}`)}
              className="px-5 py-2 rounded-full bg-primary text-white text-sm tracking-[0.3em] hover:bg-primary/90"
            >
              Shop {segment.label}
            </button>
            <button
              onClick={() =>
                navigate(`/catalog?segment=${segment.key}&view=studio`)
              }
              className="px-5 py-2 rounded-full border border-border text-sm tracking-[0.2em] text-dark/70 hover:text-primary hover:border-primary"
            >
              Explore looks
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 md:p-5 flex-1">
          {segment.tiles?.map((tile) => (
            <div
              key={tile}
              className="rounded-2xl overflow-hidden border border-border"
            >
              <img
                src={tile}
                alt={segment.label}
                className="w-full h-40 sm:h-48 object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
