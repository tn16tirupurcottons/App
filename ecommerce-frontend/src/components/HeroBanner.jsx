import React from "react";
import { Link } from "react-router-dom";
import { segmentVisuals } from "../data/visualAssets";

const heroImages = [
  segmentVisuals.men.tiles[0],
  segmentVisuals.women.tiles[0],
  segmentVisuals.kids.tiles[0],
];

export default function HeroBanner() {
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 border border-black/[0.06] shadow-soft">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-5 text-center lg:text-left">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-black/[0.06] text-cyan-800 font-semibold text-[10px] sm:text-xs uppercase tracking-[0.28em] shadow-soft">
            Spun in Tirupur
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-slate-900 leading-tight">
            {brand.split(" ")[0]}{" "}
            <span className="text-cyan-800">cotton atelier</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
            Relaxed tailoring, airy kurtas, and elevated basics — breathable yarns with a quiet,
            premium finish.
          </p>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link
              to="/catalog?segment=men"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-soft transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              Shop menswear
            </Link>
            <Link
              to="/catalog?segment=women"
              className="bg-white text-neutral-900 px-6 py-3 rounded-full font-semibold text-sm border border-neutral-200 hover:border-neutral-400 transition-all duration-300 ease-out"
            >
              Explore womenswear
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 justify-center lg:justify-start text-sm text-slate-600 pt-2">
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

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:max-w-none">
          {heroImages.map((src, idx) => (
            <div
              key={src}
              className={`rounded-2xl overflow-hidden shadow-soft border border-white/80 transition-transform duration-300 ease-out hover:scale-[1.02] ${
                idx === 1 ? "translate-y-4 sm:translate-y-6" : ""
              }`}
            >
              <img
                src={src}
                alt=""
                className="w-full aspect-[3/4] object-cover"
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
