import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { handleImageError } from "../utils/imageUtils";
import { useAppImages } from "../context/AppImagesContext";

export function LuxuryBanner({ image, title, subtitle, cta, link, className = "" }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const { getImage } = useAppImages();
  const fallback = getImage("HOME_HERO_BACKDROP");
  const bannerImage = image || fallback;

  return (
    <div
      className={`relative overflow-hidden border border-neutral-200 rounded-2xl group cursor-pointer transition-all duration-300 ease-in-out hover:border-neutral-300 hover:shadow-lg ${className}`}
      onClick={() => link && navigate(link)}
      role={link ? "button" : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
      <img
        src={imgError ? fallback : bannerImage}
        alt={title || "Banner"}
        className="w-full h-full min-h-[200px] object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          if (!imgError) {
            setImgError(true);
            handleImageError(e, fallback);
          }
        }}
      />
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 md:p-14 text-white">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-2 text-sky-400">{subtitle}</p>
        <h3 className="text-3xl sm:text-5xl font-display uppercase tracking-[0.04em] mb-6 leading-none max-w-lg">
          {title}
        </h3>
        {cta && (
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-sky-400 transition-all duration-300 ease-in-out w-fit">
            {cta}
            <FaArrowRight className="text-xs" />
          </span>
        )}
      </div>
    </div>
  );
}

export function EditorsPicksSection() {
  const { getImage } = useAppImages();
  const fb = getImage("GLOBAL_FALLBACK_IMAGE");
  const picks = [
    { id: 1, key: "HOME_EDITORIAL_MEN_LAYERS", title: "Men's layers", category: "Pick" },
    { id: 2, key: "HOME_EDITORIAL_WOMEN_SILHOUETTES", title: "Women's silhouettes", category: "Pick" },
    { id: 3, key: "HOME_EDITORIAL_STUDIO_DROP", title: "Studio drop", category: "Pick" },
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-neutral-200">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-2">Editorial</p>
          <h2 className="text-4xl sm:text-6xl font-display text-neutral-900 uppercase tracking-[0.04em]">Three to watch</h2>
          <p className="text-neutral-600 mt-3 text-sm max-w-md">Editorial framing. Quiet product focus.</p>
        </div>
        <Link
          to="/catalog"
          className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-neutral-600 hover:text-neutral-900 transition ease-in-out"
        >
          Shop all
          <FaArrowRight />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {picks.map((pick) => (
          <Link
            key={pick.id}
            to="/catalog"
            className="group relative overflow-hidden aspect-[4/5] border border-neutral-200 rounded-xl transition-all duration-300 ease-in-out hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
            <img
              src={getImage(pick.key)}
              alt={pick.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => handleImageError(e, fb)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/90 mb-1">{pick.category}</p>
              <h3 className="text-xl font-display uppercase tracking-[0.06em] text-white">{pick.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SeasonalCollectionsSection() {
  const { getImage } = useAppImages();
  const collections = [
    {
      id: 1,
      key: "HOME_COLLECTION_LIGHT_LAYERS",
      title: "Light layers",
      subtitle: "Seasonal",
      link: "/catalog",
    },
    {
      id: 2,
      key: "HOME_COLLECTION_CORE_TEES",
      title: "Core tees",
      subtitle: "Essentials",
      link: "/catalog",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center mb-14 max-w-xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-2">Capsules</p>
        <h2 className="text-4xl sm:text-6xl font-display text-neutral-900 uppercase tracking-[0.04em] mb-3">Collections</h2>
        <p className="text-neutral-600 text-sm">Seasonal edits and core staples.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((collection) => (
          <LuxuryBanner
            key={collection.id}
            image={getImage(collection.key)}
            title={collection.title}
            subtitle={collection.subtitle}
            cta="Enter"
            link={collection.link}
            className="min-h-[280px] md:aspect-[16/9]"
          />
        ))}
      </div>
    </section>
  );
}

export function SpecialOffersSection() {
  const { getImage } = useAppImages();
  const fb = getImage("GLOBAL_FALLBACK_IMAGE");
  const offers = [
    { id: 1, key: "HOME_OFFER_LIMITED", title: "Limited", discount: "Up to 40%", link: "/catalog?featured=true" },
    { id: 2, key: "HOME_OFFER_NEW_IN", title: "New in", discount: "Fresh grid", link: "/catalog?sort=newest" },
    { id: 3, key: "HOME_OFFER_TOP_MOVES", title: "Top moves", discount: "Restocked", link: "/catalog?featured=true" },
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-neutral-200">
      <div className="text-center mb-14">
        <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-2">Offers</p>
        <h2 className="text-4xl sm:text-6xl font-display text-neutral-900 uppercase tracking-[0.04em]">Worth a look</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {offers.map((offer) => (
          <Link
            key={offer.id}
            to={offer.link}
            className="group relative overflow-hidden aspect-[4/5] border border-neutral-200 rounded-xl transition-all duration-300 ease-in-out hover:border-neutral-300 hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent z-10" />
            <img
              src={getImage(offer.key)}
              alt={offer.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => handleImageError(e, fb)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/90 mb-2">{offer.discount}</p>
              <h3 className="text-2xl font-display uppercase tracking-[0.05em] mb-3">{offer.title}</h3>
              <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-white transition-colors">
                Shop
                <FaArrowRight />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CuratedLooksSection() {
  const { getImage } = useAppImages();
  const fb = getImage("GLOBAL_FALLBACK_IMAGE");
  const looks = [
    { id: 1, key: "HOME_LOOK_SOFT_TAILORING", title: "Soft tailoring", description: "Dresses & sets." },
    { id: 2, key: "HOME_LOOK_DENIM_SHIRTS", title: "Denim / shirts", description: "Daily uniform." },
    { id: 3, key: "HOME_LOOK_KIDS", title: "Kids", description: "Play-grade cotton." },
    { id: 4, key: "HOME_LOOK_STUDIO", title: "Studio", description: "Contemporary line." },
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-12 sm:px-8 sm:py-16">
        <div className="text-center mb-12 max-w-lg mx-auto">
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-2">Grid</p>
          <h2 className="text-4xl sm:text-6xl font-display text-white uppercase tracking-[0.04em] mb-3">Looks</h2>
          <p className="text-zinc-500 text-sm">Four moods. One brand.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {looks.map((look) => (
            <Link
              key={look.id}
              to="/catalog"
              className="group relative overflow-hidden aspect-square border border-white/10 transition-all duration-300 ease-in-out hover:border-white/30"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
              <img
                src={getImage(look.key)}
                alt={look.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                loading="lazy"
                decoding="async"
                onError={(e) => handleImageError(e, fb)}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h3 className="text-sm font-bold uppercase tracking-wide text-white">{look.title}</h3>
                <p className="text-[11px] text-white/75 mt-1">{look.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HeroOfferBanner() {
  const { getImage } = useAppImages();
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <LuxuryBanner
        image={getImage("HOME_HERO_TIRUPUR_BANNER")}
        title="Still made in Tirupur"
        subtitle="Latest capsule"
        cta="Shop now"
        link="/catalog"
        className="min-h-[220px] sm:min-h-[300px] md:aspect-[21/9]"
      />
    </section>
  );
}
