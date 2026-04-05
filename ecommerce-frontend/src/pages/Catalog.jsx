import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductList from "../components/ProductList";
import { segmentThemes } from "../data/segments";
import { normalizeCategorySlug } from "../utils/validation";
import { useBrandTheme } from "../context/BrandThemeContext";
import { useAppImages } from "../context/AppImagesContext";
import { resolveCategoryBannerUrl } from "../utils/imageAssetsConfig";
import SafeImage from "../components/SafeImage";
import CategoryMarketing from "../components/CategoryMarketing";
import { BRAND_NAME } from "@/config/brand";

const segmentToCategorySlug = {
  men: "mens-shirts",
  women: "women-kurtas",
  kids: "kids-wear",
  genz: "genz",
  accessories: "accessories",
};

/**
 * @param {object} props
 * @param {string} [props.embeddedSegment] — from /men, /women, … (overrides URL)
 * @param {string} [props.embeddedCategorySlug] — rare override
 */
export default function Catalog({ embeddedSegment = null, embeddedCategorySlug = null }) {
  const { imageAssets } = useBrandTheme();
  const { getImage } = useAppImages();
  const [searchParams] = useSearchParams();
  const segment = embeddedSegment ?? searchParams.get("segment");
  const categorySlugFromSegment = segment ? segmentToCategorySlug[segment] : null;

  const categoryFromUrl = normalizeCategorySlug(
    embeddedCategorySlug ?? searchParams.get("category") ?? ""
  );

  const initialQuery = useMemo(
    () => ({
      search: searchParams.get("query") || "",
      categorySlug: normalizeCategorySlug(
        categoryFromUrl || categorySlugFromSegment || ""
      ),
    }),
    [searchParams, categorySlugFromSegment, categoryFromUrl]
  );

  const segmentTheme = useMemo(() => {
    if (segment && segmentThemes[segment]) return segmentThemes[segment];
    if (!segment && categoryFromUrl === "accessories") return segmentThemes.accessories;
    return null;
  }, [segment, categoryFromUrl]);

  const adminBannerOverride = segmentTheme
    ? resolveCategoryBannerUrl(imageAssets, segmentTheme.key || segment)
    : resolveCategoryBannerUrl(imageAssets, categoryFromUrl);

  const segKey = segmentTheme?.key ? String(segmentTheme.key).toUpperCase() : "";
  const segmentBannerFromRegistry = segKey ? getImage(`SEGMENT_${segKey}_BANNER`) : "";

  const primaryBannerSrc = adminBannerOverride
    ? adminBannerOverride
    : segmentTheme
      ? segmentBannerFromRegistry || segmentTheme.backgroundImage || segmentTheme.banner
      : "";
  const alternateBannerSrc =
    segmentTheme && !adminBannerOverride && segmentTheme.banner !== primaryBannerSrc
      ? segmentTheme.banner
      : "";
  const tileFallbackSrc = segKey ? getImage(`SEGMENT_${segKey}_TILE_0`) : segmentTheme?.tiles?.[0] || "";

  const [bannerSrc, setBannerSrc] = useState(primaryBannerSrc);

  useEffect(() => {
    if (adminBannerOverride) {
      setBannerSrc(adminBannerOverride);
      return;
    }
    if (segmentTheme) {
      setBannerSrc(segmentTheme.backgroundImage || segmentTheme.banner);
    }
  }, [segment, adminBannerOverride, segmentTheme?.backgroundImage, segmentTheme?.banner, segmentTheme]);

  const titleSegmentLabel = segmentTheme?.label;
  const headingText = searchParams.get("query")
    ? `Results · “${searchParams.get("query")}”`
    : titleSegmentLabel
      ? `Shop ${titleSegmentLabel}`
      : categoryFromUrl
        ? `Shop ${categoryFromUrl.replace(/-/g, " ")}`
        : "All products";

  const isExplicitCategoryPage = Boolean(categoryFromUrl);

  return (
    <div className="w-full text-neutral-900">
      {isExplicitCategoryPage ? (
        <CategoryMarketing categorySlug={categoryFromUrl} />
      ) : segmentTheme ? (
        <section
          className="relative isolate overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-sm min-h-[220px] sm:min-h-[280px] md:min-h-[320px]"
          aria-label={`${segmentTheme.label} collection banner`}
        >
          <SafeImage
            src={bannerSrc}
            alt=""
            seed={segmentTheme?.key || "catalog-banner"}
            className="absolute inset-0 z-0 h-full w-full object-cover object-center pointer-events-none select-none min-h-[220px]"
            onError={() => {
              if (alternateBannerSrc && bannerSrc !== alternateBannerSrc) {
                setBannerSrc(alternateBannerSrc);
              } else if (tileFallbackSrc && bannerSrc !== tileFallbackSrc) {
                setBannerSrc(tileFallbackSrc);
              }
            }}
          />
          <div
            className="absolute inset-0 z-[1] bg-gradient-to-r from-white/95 via-white/78 to-white/40 pointer-events-none"
            aria-hidden
          />
          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-[#555555] mb-3 sm:mb-4">
              {segmentTheme.label} collection
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-[0.04em] text-[#000000] leading-[1.02] drop-shadow-sm">
              {segmentTheme.description}
            </h1>
            <p className="text-[#555555] text-sm sm:text-base mt-4 sm:mt-6 max-w-xl leading-relaxed">
              Curated {segmentTheme.label.toLowerCase()} — premium cotton, clean silhouettes, {BRAND_NAME}.
            </p>
          </div>
        </section>
      ) : null}

      {!isExplicitCategoryPage && (
        <>
          <div className="container">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
                {titleSegmentLabel || (categoryFromUrl ? categoryFromUrl.replace(/-/g, " ") : "Catalog")}
              </p>
              <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-[0.04em] text-neutral-900 mt-2">
                {headingText}
              </h2>
              <p className="text-neutral-600 mt-4 text-sm max-w-2xl leading-relaxed">
                {searchParams.get("query")
                  ? "Find your piece in the grid below."
                  : "Filter, sort, and scroll — minimal chrome, maximum product."}
              </p>
            </div>
          </div>

          <div className="container">
            <ProductList initialQuery={initialQuery} />
          </div>
        </>
      )}
    </div>
  );
}
