import React from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
];

export default function HeroBanner() {
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#fde1e6] via-white to-[#ebf4ff] shadow-xl">
      <div className="absolute inset-0">
        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-pink-200 opacity-40 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-blue-200 opacity-40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16 grid lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white text-pink-600 font-semibold text-xs uppercase tracking-[0.3em]">
            Spun in Tirupur
          </p>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            {brand.split(" ")[0]} Cotton Atelier ·{" "}
            <span className="text-pink-600">Signature Shirts & Kurtas</span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Inspired by Myntra & Zara storefronts, the TN16 edit brings relaxed
            tailoring, airy kurtas and elevated basics made from Tirupur’s soft
            cotton yarns.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-pink-200 transition">
              Shop Menswear
            </button>
            <button className="bg-white/80 text-gray-900 px-6 py-3 rounded-full font-semibold border border-gray-200 hover:border-gray-400 transition">
              Explore Womenswear
            </button>
          </div>
          <div className="flex gap-8 text-sm text-gray-600 pt-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
              <p>Loved by 20k+ shoppers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">72 hr</p>
              <p>Dispatch from Tirupur</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">COD</p>
              <p>Across India</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {heroImages.map((src, idx) => (
            <div
              key={src}
              className={`rounded-2xl overflow-hidden shadow-lg border border-white/80 ${
                idx === 1 ? "mt-6" : "mt-0"
              }`}
            >
              <img
                src={src}
                alt="Hero decor collage"
                className="w-full h-56 object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
