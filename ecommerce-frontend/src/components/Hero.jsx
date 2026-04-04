import React, { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Hero = memo(function Hero({
  imageSrc,
  title = "Fast picks. Great prices.",
  subtitle = "Shop featured drops and essentials with a compact, no-noise browsing experience.",
  ctaLabel = "Shop deals",
  ctaTo = "/catalog",
}) {
  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (reduceMotion) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <section className="my-4 md:my-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div
          className={[
            "relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm",
            "h-[200px] sm:h-[240px] md:h-[300px] lg:h-[340px]",
            "transition-all duration-200 ease-in-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          ].join(" ")}
        >
          <img
            src={
              imageSrc ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=60"
            }
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />
          <div className="absolute inset-0 flex items-end">
            <div className="p-4 md:p-6 w-full">
              <div className="max-w-[620px] text-white">
                <h1 className="text-xl md:text-2xl font-semibold leading-tight drop-shadow-sm">
                  {title}
                </h1>
                <p className="mt-2 text-sm md:text-base text-white/90 drop-shadow-sm">
                  {subtitle}
                </p>
                {ctaLabel ? (
                  <div className="mt-4">
                    <Link
                      to={ctaTo}
                      className="inline-flex h-9 items-center rounded-md bg-white text-neutral-900 px-3 text-sm font-semibold shadow-sm hover:shadow hover:bg-neutral-50 active:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-all duration-200 ease-in-out hover:scale-[1.02]"
                    >
                      {ctaLabel}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Hero;
