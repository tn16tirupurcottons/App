import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

export default function BannerCarousel({ page = "home", position = "hero" }) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ["banners", page, position],
    queryFn: async () => {
      try {
        const res = await axiosClient.get(`/admin/banners?page=${page}&position=${position}`);
        const all = res.data.items || [];
        // Filter by page and position, or "all" page
        return all.filter((b) => 
          b.isActive && 
          (b.page === page || b.page === "all") && 
          b.position === position
        );
      } catch {
        return [];
      }
    },
  });

  const activeBanners = banners
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 5);

  // Rotate between banners
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
      setCurrentImageIndex(0); // Reset image index when banner changes
    }, 3000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (!activeBanners.length) return null;

  const currentBanner = activeBanners[currentBannerIndex];
  const images = currentBanner.images || (currentBanner.image ? [currentBanner.image] : []);

  // Rotate between images within current banner
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, currentBannerIndex]);

  const currentImage = images[currentImageIndex] || images[0] || "";

  if (!currentImage) return null;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl">
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
        <img
          src={currentImage}
          alt={currentBanner.title || "Banner"}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/1200x600?text=Banner+Image";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        
        {/* Text Overlay - Always visible with proper contrast */}
        <div className="absolute inset-0 flex items-center justify-center md:justify-start px-6 md:px-12 z-10">
          <div className="text-center md:text-left max-w-2xl">
            {/* Text Container with Background for Readability */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
              {currentBanner.title && (
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-white leading-tight">
                  {currentBanner.title}
                </h2>
              )}
              {currentBanner.subtitle && (
                <p className="text-lg md:text-xl mb-6 text-white/95 leading-relaxed">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.ctaLabel && currentBanner.ctaLink && (
                <Link
                  to={currentBanner.ctaLink}
                  className="inline-block bg-white text-gray-900 px-8 py-4 rounded-full font-bold tracking-[0.3em] uppercase text-xs hover:bg-gray-100 transition shadow-2xl"
                >
                  {currentBanner.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Banner Indicators */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentBannerIndex(idx);
                  setCurrentImageIndex(0);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentBannerIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Go to banner ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image indicators (if multiple images in current banner) */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 flex gap-1">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentImageIndex ? "w-4 bg-white" : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

