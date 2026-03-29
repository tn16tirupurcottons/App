import React from "react";
import { Link } from "react-router-dom";
import { useAppImages } from "../context/AppImagesContext";
import { BRAND_NAME } from "@/config/brand";

export default function HeroBanner() {
  const { getImage } = useAppImages();
  const heroImages = [
    getImage("HERO_BANNER_MEN"),
    getImage("HERO_BANNER_WOMEN"),
    getImage("HERO_BANNER_KIDS"),
  ];
  const brandHeadline = BRAND_NAME.split(" ")[0];

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 border border-black/[0.06] shadow-soft max-w-full">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center w-full min-w-0">
        <div className="space-y-4 sm:space-y-5 text-center lg:text-left min-w-0">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-black/[0.06] text-cyan-800 font-semibold text-[10px] sm:text-xs uppercase tracking-[0.28em] shadow-soft">
            Spun in Tirupur
          </p>
          <h1 className="text-[1.65rem] min-[400px]:text-3xl sm:text-4xl lg:text-5xl font-display text-slate-900 leading-[1.15] sm:leading-tight break-words">
            {brandHeadline}{" "}
            <span className="text-cyan-800">cotton atelier</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 px-0">
            Relaxed tailoring, airy kurtas, and elevated basics — breathable yarns with a quiet,
            premium finish.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start items-stretch sm:items-center">
            <Link
              to="/men"
              className="w-full sm:w-auto text-center bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3.5 sm:py-3 rounded-full font-semibold text-sm shadow-soft transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] min-h-12 inline-flex items-center justify-center"
            >
              Shop menswear
            </Link>
            <Link
              to="/women"
              className="w-full sm:w-auto text-center bg-white text-neutral-900 px-6 py-3.5 sm:py-3 rounded-full font-semibold text-sm border border-neutral-200 hover:border-neutral-400 transition-all duration-300 ease-out min-h-12 inline-flex items-center justify-center"
            >
              Explore womenswear
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 sm:gap-8 justify-center lg:justify-start text-xs sm:text-sm text-slate-600 pt-2">
            <div>
              <p className="text-2xl font-semibold text-slate-900">4.8</p>
              <p>Loved by shoppers</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">72 hr</p>
              <p>Dispatch from Tirupur</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">COD</p>
              <p>Across India</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto lg:max-w-none w-full min-w-0">
          {heroImages.map((src, idx) => (
            <div
              key={src}
              className={`rounded-xl sm:rounded-2xl overflow-hidden shadow-soft border border-white/80 transition-transform duration-300 ease-out hover:scale-[1.02] min-w-0 ${
                idx === 1 ? "translate-y-3 sm:translate-y-6" : ""
              }`}
            >
              <img
                src={src}
                alt=""
                className="w-full aspect-[3/4] object-cover max-h-[min(52vh,420px)] lg:max-h-none"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
