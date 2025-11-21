import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";

export default function BannerCarousel({ page = "home", position = "hero", category = null }) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data } = useQuery({
    queryKey: ["banners", page, position, category],
    queryFn: async () => {
      try {
        const res = await axiosClient.get(
          `/admin/banners?page=${page}&position=${position}`
        );
        const all = res.data.items || [];
        return all.filter(
          (b) =>
            b.isActive &&
            (b.page === page || b.page === "all") &&
            b.position === position &&
            (category ? (b.segment === category || b.segment === "default") : true)
        );
      } catch {
        return [];
      }
    },
  });

  // Group banners by segment/category for auto-sliding
  const bannersByCategory = useMemo(() => {
    return (data || []).reduce((acc, banner) => {
      const segment = banner.segment || "default";
      if (!acc[segment]) acc[segment] = [];
      acc[segment].push(banner);
      return acc;
    }, {});
  }, [data]);

  // Get banners for Men, Women, Kids, Accessories in order
  const activeBanners = useMemo(() => {
    if (!data || data.length === 0) return [];
    const categoryOrder = ["men", "women", "kids", "accessories"];
    const categoryBanners = categoryOrder
      .map(cat => (bannersByCategory[cat] || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
      .flat();
    const defaultBanners = (bannersByCategory["default"] || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return [...categoryBanners, ...defaultBanners].slice(0, 20); // Allow more banners for category rotation
  }, [bannersByCategory, data]);

  // Ensure indices stay in range whenever data changes
  useEffect(() => {
    if (!activeBanners.length) {
      setCurrentBannerIndex(0);
      setCurrentImageIndex(0);
      return;
    }
    if (currentBannerIndex >= activeBanners.length) {
      setCurrentBannerIndex(0);
      setCurrentImageIndex(0);
    }
  }, [activeBanners.length, currentBannerIndex]);

  // Rotate between banners and images with a single interval
  useEffect(() => {
    if (!activeBanners.length) return;

    const tick = () => {
      const banner = activeBanners[currentBannerIndex];
      const imgs =
        (banner?.images && banner.images.length > 0
          ? banner.images
          : banner?.image
          ? [banner.image]
          : []) || [];

      if (imgs.length > 1) {
        setCurrentImageIndex((prev) => {
          const next = prev + 1;
          if (next < imgs.length) return next;
          setCurrentBannerIndex((bPrev) => (bPrev + 1) % activeBanners.length);
          return 0;
        });
      } else {
        setCurrentBannerIndex((bPrev) => (bPrev + 1) % activeBanners.length);
        setCurrentImageIndex(0);
      }
    };

    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, [activeBanners, currentBannerIndex]);

  // ✅ Safe currentBanner check
  const currentBanner =
    activeBanners && activeBanners[currentBannerIndex]
      ? activeBanners[currentBannerIndex]
      : null;

  // Fallback banner if no banners exist
  const fallbackBanner = {
    title: "Welcome to TN16 Tirupur Cotton",
    subtitle: "Premium Cotton Apparel Made in India",
    image: FALLBACK_IMAGES.banner,
    images: [FALLBACK_IMAGES.banner],
    ctaLabel: "Shop Now",
    ctaLink: "/catalog",
  };

  const displayBanner = currentBanner || fallbackBanner;

  const images =
    (displayBanner?.images && displayBanner.images.length > 0
      ? displayBanner.images.filter(img => img) // Filter out empty/null images
      : displayBanner?.image
      ? [displayBanner.image]
      : []) || [];

  const currentImage =
    images[currentImageIndex] || images[0] || FALLBACK_IMAGES.banner;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl">
      <div className="relative w-full" style={{ 
        aspectRatio: "21/9",
        height: "clamp(350px, 45vh, 650px)",
        minHeight: "350px",
        maxHeight: "650px"
      }}>
        <img
          src={currentImage}
          alt={displayBanner.title || "Banner"}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out"
          style={{ 
            objectFit: "cover", 
            objectPosition: "center",
            width: "100%",
            height: "100%"
          }}
          onError={(e) => handleImageError(e, FALLBACK_IMAGES.banner)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Text Overlay - Fully Responsive */}
        <div className="absolute inset-0 flex items-center justify-center md:justify-start px-4 sm:px-6 md:px-8 lg:px-12 z-10">
          <div className="text-center md:text-left w-full max-w-[90%] sm:max-w-md md:max-w-2xl lg:max-w-3xl">
            <div className="bg-black/60 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
              {displayBanner.title && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-2 sm:mb-3 md:mb-4 text-white leading-tight">
                  {displayBanner.title}
                </h2>
              )}
              {displayBanner.subtitle && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-5 md:mb-6 text-white/95 leading-relaxed">
                  {displayBanner.subtitle}
                </p>
              )}
              {displayBanner.ctaLabel && displayBanner.ctaLink && (
                <Link
                  to={displayBanner.ctaLink}
                  className="inline-block bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs hover:bg-gray-100 transition shadow-2xl"
                >
                  {displayBanner.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Banner Indicators - Responsive */}
        {activeBanners.length > 1 && currentBanner && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentBannerIndex(idx);
                  setCurrentImageIndex(0);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  idx === currentBannerIndex ? "w-6 sm:w-8 bg-white" : "w-1.5 sm:w-2 bg-white/50"
                }`}
                aria-label={`Go to banner ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image indicators - Responsive */}
        {images.length > 1 && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-1 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-0.5 sm:h-1 rounded-full transition-all ${
                  idx === currentImageIndex ? "w-3 sm:w-4 bg-white" : "w-0.5 sm:w-1 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
