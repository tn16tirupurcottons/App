import React from "react";
import { Link } from "react-router-dom";
import { getShopPathForCategorySlug } from "../utils/catalogRoutes";
import { categoryStock } from "../data/visualAssets";
import { getCategoryImage } from "../utils/imageUtils";
import { useBrandTheme } from "../context/BrandThemeContext";
import { useAppImages } from "../context/AppImagesContext";
import { resolveCategoryBannerUrl } from "../utils/imageAssetsConfig";
import { slugToCategoryImageKey } from "../utils/categoryAppImageKeys";
import SafeImage from "./SafeImage";

export default function CategoryGrid({ categories = [], loading = false }) {
  const { imageAssets } = useBrandTheme();
  const { getImage } = useAppImages();
  const fallback = [
    { id: "mens-shirts", name: "Men", heroImage: categoryStock.men, slug: "mens-shirts" },
    { id: "women-kurtas", name: "Women", heroImage: categoryStock.women, slug: "women-kurtas" },
    { id: "kids-wear", name: "Kids", heroImage: categoryStock.kids, slug: "kids-wear" },
    { id: "athleisure", name: "Athleisure", heroImage: categoryStock.athleisure, slug: "athleisure" },
  ];

  const list = categories.length ? categories : fallback;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">Shop by</p>
          <h2 className="text-4xl sm:text-6xl font-display text-neutral-900 uppercase tracking-[0.04em] mt-2">
            Categories
          </h2>
        </div>
        <Link
          to="/catalog"
          className="text-[10px] uppercase tracking-[0.28em] text-neutral-600 hover:text-neutral-900 transition duration-200 ease-in-out shrink-0"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {(loading ? new Array(4).fill(null) : list).map((cat, idx) => {
          const slugKey = slugToCategoryImageKey(cat?.slug);
          return (
          <Link
            to={getShopPathForCategorySlug(cat?.slug || cat?.id)}
            key={cat?.id || idx}
            className="group relative overflow-hidden border border-white/10 aspect-[4/5] flex flex-col bg-zinc-950 transition-all duration-300 ease-in-out hover:border-sky-400/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6)] hover:-translate-y-1"
          >
            {loading ? (
              <div className="w-full flex-1 min-h-[220px] bg-zinc-900 animate-pulse" />
            ) : (
              <>
                <SafeImage
                  src={
                    resolveCategoryBannerUrl(imageAssets, cat?.slug) ||
                    (slugKey ? getImage(slugKey) : "") ||
                    getCategoryImage(cat)
                  }
                  alt={cat?.name || "Category"}
                  seed={cat?.slug || cat?.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="relative mt-auto p-6 text-white z-10 flex flex-col gap-4">
                  <p className="text-xl sm:text-2xl font-display uppercase tracking-[0.06em]">{cat?.name}</p>
                  {cat?.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{cat.description}</p>
                  )}
                  <span className="inline-flex w-fit items-center text-[10px] uppercase tracking-[0.25em] font-bold px-5 py-2.5 bg-white text-neutral-900 border border-neutral-200 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-colors duration-300 ease-in-out rounded-full">
                    Shop
                  </span>
                </div>
              </>
            )}
          </Link>
        );
        })}
      </div>
    </section>
  );
}
