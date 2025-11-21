import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";

/**
 * Luxury Home Page Sections
 * Premium e-commerce sections similar to high-end brands like Aji/Mythra
 */

// Luxury banner component with error handling
export function LuxuryBanner({ image, title, subtitle, cta, link, className = "" }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  
  const bannerImage = image || FALLBACK_IMAGES.banner;
  
  return (
    <div
      className={`relative overflow-hidden rounded-3xl group cursor-pointer ${className}`}
      onClick={() => link && navigate(link)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent z-10" />
      <img
        src={bannerImage}
        alt={title || "Banner"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        onError={(e) => {
          if (!imgError) {
            setImgError(true);
            handleImageError(e, FALLBACK_IMAGES.banner);
          }
        }}
      />
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
        <p className="text-xs sm:text-sm uppercase tracking-[0.3em] mb-2 opacity-90">
          {subtitle}
        </p>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-display mb-4 leading-tight">
          {title}
        </h3>
        {cta && (
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-sm font-semibold tracking-[0.2em] uppercase hover:bg-white/90 transition-all w-fit group-hover:translate-x-1">
            {cta}
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

// Editor's Picks Section
export function EditorsPicksSection() {
  const picks = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      title: "Luxury Cotton Collection",
      category: "Editor's Choice",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      title: "Artisan Crafted",
      category: "Handpicked",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
      title: "Premium Essentials",
      category: "Must Have",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="pill text-muted mb-2">Curated</p>
          <h2 className="text-3xl sm:text-4xl font-display text-dark">
            Editor's Picks
          </h2>
          <p className="text-muted mt-2 text-sm sm:text-base">
            Hand-selected pieces from our atelier
          </p>
        </div>
        <Link
          to="/catalog"
          className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted hover:text-primary transition"
        >
          View All
          <FaArrowRight />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {picks.map((pick) => (
          <Link
            key={pick.id}
            to="/catalog"
            className="group relative overflow-hidden rounded-3xl aspect-[4/5]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
            <img
              src={pick.image || FALLBACK_IMAGES.men}
              alt={pick.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => handleImageError(e, FALLBACK_IMAGES.men)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
              <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-90">
                {pick.category}
              </p>
              <h3 className="text-xl font-display">{pick.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Seasonal Collections Section
export function SeasonalCollectionsSection() {
  const collections = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
      title: "Spring Collection",
      subtitle: "Fresh Arrivals",
      link: "/catalog?category=spring",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      title: "Summer Essentials",
      subtitle: "Light & Breathable",
      link: "/catalog?category=summer",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <p className="pill text-muted mb-2">Collections</p>
        <h2 className="text-3xl sm:text-4xl font-display text-dark mb-3">
          Seasonal Collections
        </h2>
        <p className="text-muted text-sm sm:text-base max-w-2xl mx-auto">
          Discover our carefully curated seasonal collections, each piece crafted with precision and luxury in mind
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((collection) => (
          <LuxuryBanner
            key={collection.id}
            image={collection.image}
            title={collection.title}
            subtitle={collection.subtitle}
            cta="Explore Collection"
            link={collection.link}
            className="aspect-[16/9]"
          />
        ))}
      </div>
    </section>
  );
}

// Special Offers Section
export function SpecialOffersSection() {
  const offers = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      title: "Limited Edition",
      discount: "Up to 40% OFF",
      link: "/catalog?featured=true",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
      title: "New Arrivals",
      discount: "Early Access",
      link: "/catalog?sort=newest",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      title: "Best Sellers",
      discount: "Shop Now",
      link: "/catalog?featured=true",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <p className="pill text-muted mb-2">Exclusive</p>
        <h2 className="text-3xl sm:text-4xl font-display text-dark mb-3">
          Special Offers
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <Link
            key={offer.id}
            to={offer.link}
            className="group relative overflow-hidden rounded-3xl aspect-[4/5]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
            <img
              src={offer.image || FALLBACK_IMAGES.men}
              alt={offer.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => handleImageError(e, FALLBACK_IMAGES.men)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
              <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-90">
                {offer.discount}
              </p>
              <h3 className="text-2xl font-display mb-3">{offer.title}</h3>
              <div className="flex items-center gap-2 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                Shop Now
                <FaArrowRight />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Curated Looks Section
export function CuratedLooksSection() {
  const looks = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      title: "Casual Elegance",
      description: "Effortless style for everyday",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1539533018447-63fc4c2f0f4e?auto=format&fit=crop&w=800&q=80",
      title: "Formal Sophistication",
      description: "Refined pieces for special occasions",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      title: "Weekend Comfort",
      description: "Relaxed luxury for your downtime",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1539533018447-63fc4c2f0f4e?auto=format&fit=crop&w=800&q=80",
      title: "Festive Glamour",
      description: "Celebrate in style",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl my-8">
      <div className="text-center mb-12">
        <p className="pill text-muted mb-2">Styling</p>
        <h2 className="text-3xl sm:text-4xl font-display text-dark mb-3">
          Curated Looks
        </h2>
        <p className="text-muted text-sm sm:text-base max-w-2xl mx-auto">
          Get inspired by our stylist-curated looks and discover your perfect ensemble
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {looks.map((look) => (
          <Link
            key={look.id}
            to="/catalog"
            className="group relative overflow-hidden rounded-2xl aspect-square"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            <img
              src={look.image || FALLBACK_IMAGES.women}
              alt={look.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => handleImageError(e, FALLBACK_IMAGES.women)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
              <h3 className="text-sm sm:text-base font-semibold mb-1">{look.title}</h3>
              <p className="text-xs opacity-90">{look.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Main Hero Offer Banner
export function HeroOfferBanner() {
  const navigate = useNavigate();
  
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <LuxuryBanner
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
        title="Luxury Redefined"
        subtitle="Premium Cotton Collection"
        cta="Discover Now"
        link="/catalog"
        className="aspect-[21/9]"
      />
    </section>
  );
}

