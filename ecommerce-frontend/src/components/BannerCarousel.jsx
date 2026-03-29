import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";
import { useBrandTheme } from "../context/BrandThemeContext";
import { useAppImages } from "../context/AppImagesContext";

export default function BannerCarousel({ page = "home", position = "hero", category = null }) {
  const { theme, imageAssets } = useBrandTheme();
  const { getImage } = useAppImages();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroBoxBg =
    theme.heroBoxBackground ||
    "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.9) 55%, rgba(241,245,249,0.82) 100%)";
  const heroBoxBorder = theme.heroBoxBorder || "rgba(15,23,42,0.08)";
  const heroTextColor = theme.heroTextColor || "#0f172a";
  const heroTitleShadow = theme.heroTitleShadow || "none";
  const heroSubtitleShadow = theme.heroSubtitleShadow || "none";

  const { data } = useQuery({
    queryKey: ["banners", page, position, category],
    queryFn: async () => {
      try {
        const res = await axiosClient.get(`/banners?page=${page}&position=${position}`);
        const all = res.data.items || [];
        return all.filter(
          (b) =>
            b.isActive &&
            (b.page === page || b.page === "all") &&
            b.position === position &&
            (category ? b.segment === category || b.segment === "default" : true)
        );
      } catch {
        return [];
      }
    },
  });

  const bannersByCategory = useMemo(() => {
    return (data || []).reduce((acc, banner) => {
      const segment = banner.segment || "default";
      if (!acc[segment]) acc[segment] = [];
      acc[segment].push(banner);
      return acc;
    }, {});
  }, [data]);

  const activeBanners = useMemo(() => {
    if (!data || data.length === 0) return [];
    const categoryOrder = ["men", "women", "kids", "accessories"];
    const categoryBanners = categoryOrder
      .map((cat) =>
        (bannersByCategory[cat] || []).sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        )
      )
      .flat();
    const defaultBanners = (bannersByCategory["default"] || []).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    return [...categoryBanners, ...defaultBanners].slice(0, 20);
  }, [bannersByCategory, data]);

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

    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [activeBanners, currentBannerIndex]);

  const currentBanner =
    activeBanners && activeBanners[currentBannerIndex] ? activeBanners[currentBannerIndex] : null;

  const adminHero = imageAssets?.home?.hero?.trim();
  const promoExtras = [imageAssets?.home?.promo1, imageAssets?.home?.promo2].filter((u) => u && String(u).trim());
  const promoHero = getImage("HOME_PROMO_HERO");
  const heroBackdropUrl = getImage("HOME_HERO_BACKDROP");
  const promo1 = getImage("HOME_PROMO_1");
  const promo2 = getImage("HOME_PROMO_2");

  const fallbackBanner = {
    title: "BUILT IN TIRUPUR. WORN EVERYWHERE.",
    subtitle: "Premium cotton essentials — bold fits, factory‑direct. No noise, just product.",
    image: adminHero || promoHero || heroBackdropUrl,
    images: adminHero
      ? [adminHero, ...promoExtras].filter(Boolean)
      : promoExtras.length
        ? [...promoExtras, heroBackdropUrl]
        : [promoHero, promo1, promo2, heroBackdropUrl].filter(Boolean),
    ctaLabel: "Shop now",
    ctaLink: "/catalog",
  };

  const displayBanner = currentBanner || fallbackBanner;

  const images =
    (displayBanner?.images && displayBanner.images.length > 0
      ? displayBanner.images.filter((img) => img)
      : displayBanner?.image
        ? [displayBanner.image]
        : []) || [];

  const currentImage =
    images[currentImageIndex] || images[0] || adminHero || promoHero || heroBackdropUrl;
  const showBannerDots = activeBanners.length > 1 && currentBanner;
  const showImageDots = images.length > 1;
  const totalDots = showBannerDots ? activeBanners.length : showImageDots ? images.length : 0;
  const activeDot = showBannerDots ? currentBannerIndex : currentImageIndex;

  return (
    <div className="relative w-full overflow-hidden border-y border-neutral-200 sm:rounded-2xl lg:rounded-3xl shadow-lg">
      <div className="relative w-full min-h-[min(78vh,620px)] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[520px] lg:aspect-[2.2/1] lg:max-h-[720px]">
        <img
          src={currentImage}
          alt={displayBanner.title || "Hero"}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 z-[1] w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out scale-105"
          onError={(e) => handleImageError(e, FALLBACK_IMAGES.banner)}
        />
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-r from-black/45 via-transparent to-transparent pointer-events-none sm:block"
          aria-hidden
        />

        <div className="absolute inset-0 z-[3] flex items-end sm:items-center justify-start px-5 py-12 sm:px-10 md:px-14 lg:px-20">
          <div className="w-full max-w-3xl">
            <div
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-neutral-200/90 sm:max-w-xl transition-all duration-300 ease-in-out shadow-sm"
              style={{
                background: heroBoxBg,
                borderColor: heroBoxBorder,
              }}
            >
              {displayBanner.title && (
                <h2
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display leading-[0.95] mb-4 sm:mb-6 uppercase tracking-[0.04em]"
                  style={{
                    color: heroTextColor,
                    textShadow: heroTitleShadow,
                  }}
                >
                  {displayBanner.title}
                </h2>
              )}
              {displayBanner.subtitle && (
                <p
                  className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed max-w-md font-medium text-balance"
                  style={{
                    color: `${heroTextColor}cc`,
                    textShadow: heroSubtitleShadow,
                  }}
                >
                  {displayBanner.subtitle}
                </p>
              )}
              {displayBanner.ctaLabel && displayBanner.ctaLink && (
                <Link
                  to={displayBanner.ctaLink}
                  className="inline-flex items-center justify-center min-w-[200px] bg-neutral-900 text-white px-8 py-3.5 rounded-full font-bold tracking-[0.25em] uppercase text-xs sm:text-sm hover:bg-neutral-800 transition-all duration-300 ease-in-out shadow-md active:scale-[0.98]"
                >
                  {displayBanner.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        </div>

        {totalDots > 0 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[4] flex items-center gap-2 px-3 py-2 rounded-full bg-white/85 backdrop-blur-sm border border-neutral-200 shadow-sm"
            role="tablist"
            aria-label="Hero slides"
          >
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (showBannerDots) {
                    setCurrentBannerIndex(idx);
                    setCurrentImageIndex(0);
                  } else {
                    setCurrentImageIndex(idx);
                  }
                }}
                className={`rounded-full transition-all duration-300 ease-out ${
                  idx === activeDot ? "w-8 h-2 bg-neutral-900" : "w-2 h-2 bg-neutral-300 hover:bg-neutral-500"
                }`}
                aria-label={`Slide ${idx + 1}`}
                aria-current={idx === activeDot}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
