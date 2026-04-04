import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getBannerImage, FALLBACK_IMAGES, isValidImageUrl } from "../utils/imageUtils";
import SafeImage from "./SafeImage";

const formatCategoryLabel = (slug) => {
  if (!slug) return "Category";
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function CategoryHeroBanner({ categorySlug }) {
  const categoryLabel = formatCategoryLabel(categorySlug);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const adminBannerQuery = useQuery({
    queryKey: ["categoryBanner", categorySlug],
    queryFn: async () => {
      const res = await axiosClient.get(`/banners/category/${categorySlug}?page=category&position=hero`);
      return res.data.items || [];
    },
    enabled: Boolean(categorySlug),
    staleTime: 1000 * 60 * 5,
  });

  const shouldFetchAI = adminBannerQuery.isSuccess && adminBannerQuery.data?.length === 0;

  const aiBannerQuery = useQuery({
    queryKey: ["aiBanner", categorySlug],
    queryFn: async () => {
      const res = await axiosClient.post("/ai/banner", { category: categoryLabel });
      return res.data;
    },
    enabled: shouldFetchAI,
    staleTime: 1000 * 60 * 60,
  });

  const banner = useMemo(() => {
    if (adminBannerQuery.data?.length > 0) {
      return adminBannerQuery.data[0];
    }

    if (aiBannerQuery.data?.success) {
      return aiBannerQuery.data;
    }

    return {
      title: `${categoryLabel}`,
      subtitle: `Explore the best of ${categoryLabel.toLowerCase()} in every style and size.`,
      images: [getBannerImage({ name: categoryLabel })],
      ctaLabel: "Shop collection",
      ctaLink: `/catalog?category=${encodeURIComponent(categorySlug)}`,
    };
  }, [adminBannerQuery.data, aiBannerQuery.data, categoryLabel, categorySlug]);

  const images = useMemo(() => {
    if (Array.isArray(banner.images) && banner.images.length > 0) {
      return banner.images.filter((src) => isValidImageUrl(src));
    }
    if (banner.image && isValidImageUrl(banner.image)) {
      return [banner.image];
    }
    return [getBannerImage({ name: categoryLabel })];
  }, [banner, categoryLabel]);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((index) => (index + 1) % images.length);
      }, 4500);
      return () => clearInterval(timer);
    }
    setCurrentImageIndex(0);
  }, [images.length]);

  const activeImage = images[currentImageIndex] || images[0];

  return (
    <section className="relative isolate overflow-hidden rounded-[28px] border border-neutral-200 bg-neutral-950 text-white shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20 pointer-events-none" />
      <SafeImage
        src={activeImage}
        alt={banner.title || categoryLabel}
        className="absolute inset-0 h-full w-full object-cover object-center"
        fallback={FALLBACK_IMAGES.banner}
      />
      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
        <p className="text-sm uppercase tracking-[0.35em] text-white/70 mb-3">Category spotlight</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight leading-tight max-w-2xl">
          {banner.title || `${categoryLabel} collection`}
        </h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
          {banner.subtitle || `Discover premium pieces, category-only deals, and best sellers in ${categoryLabel}.`}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={banner.ctaLink || `/catalog?category=${encodeURIComponent(categorySlug)}`}
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-950 shadow-lg shadow-black/20 hover:bg-neutral-100 transition"
          >
            {banner.ctaLabel || "Shop now"}
          </Link>
          <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white/80">
            {images.length} image{images.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Show banner ${idx + 1}`}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-2.5 w-2.5 rounded-full transition ${idx === currentImageIndex ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
