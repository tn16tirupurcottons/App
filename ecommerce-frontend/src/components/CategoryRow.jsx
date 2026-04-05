import React, { memo, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function CategoryIcon({ name }) {
  const key = String(name || "").toLowerCase();
  const common = "h-5 w-5";
  if (key.includes("men")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path
          d="M7 21V8a5 5 0 0 1 10 0v13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M7 12h10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (key.includes("women")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path
          d="M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 15v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 18h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (key.includes("kids")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path
          d="M8 11a4 4 0 1 1 8 0v3a4 4 0 1 1-8 0v-3Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M9 7 7 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 7 17 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (key.includes("shoe") || key.includes("foot")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path
          d="M4 16c6 2 9 2 16 1v4H4v-5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M4 16c0-2 2-3 4-3 2 0 4-2 5-6 2 3 4 6 7 6h0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
      <path
        d="M6 8h12v13H6V8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6a3 3 0 1 1 6 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const CategoryRow = memo(function CategoryRow({
  title = "Shop by category",
  categories = [],
}) {
  const location = useLocation();
  const currentCategory = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("category") || "";
  }, [location.search]);
  const items = (categories || []).slice(0, 20);
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
            "bg-white rounded-xl border border-neutral-200 shadow-sm p-3 md:p-4",
            "transition-all duration-200 ease-in-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          ].join(" ")}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            <Link
              to="/catalog"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-all duration-200 ease-in-out"
            >
              View all
            </Link>
          </div>

          <div
            className={[
              "mt-3 px-0 overflow-x-auto scroll-smooth",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            ].join(" ")}
          >
            <div className="flex gap-3 w-max min-w-full pb-1 pl-3 md:pl-4">
              {items.map((c) => {
                const categorySlug = c.slug || (c.name ? c.name.toLowerCase().replace(/\s+/g, "-") : "");
                const isActive = categorySlug === currentCategory;
                return (
                  <Link
                    key={c.slug || c.id || c.name}
                    to={
                      c.href ||
                      (categorySlug
                        ? `/catalog?category=${encodeURIComponent(categorySlug)}`
                        : "/catalog")
                    }
                    className="shrink-0 group"
                  >
                    <div className={[
                      "flex min-w-[160px] items-center gap-3 rounded-full border px-4 py-3 transition-all duration-200 ease-in-out",
                      isActive
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-lg"
                        : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm",
                    ].join(" ")}>
                      <span className={[
                        "inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ease-in-out",
                        isActive ? "bg-white text-neutral-900" : "bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200",
                      ].join(" ")}>
                        <CategoryIcon name={c.name} />
                      </span>
                      <div className="text-sm font-semibold leading-tight">
                        {c.name}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default CategoryRow;
