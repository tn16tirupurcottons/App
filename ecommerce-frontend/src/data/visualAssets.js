/**
 * Curated royalty-free visuals (Unsplash) — generic fashion/textiles only.
 * Category-matched imagery; no brand-specific or mismatched stock.
 */

export function stockPhoto(id, w = 1200, q = 75) {
  const base = id.includes("http") ? id : `https://images.unsplash.com/${id}`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}ixlib=rb-4.0.3&auto=format&fit=crop&w=${w}&q=${q}`;
}

/** Default hero / calm textile backdrop */
export const heroBackdrop = stockPhoto("photo-1620799140408-ed534d5b51d4", 1920);

export const categoryStock = {
  men: stockPhoto("photo-1620799140408-ed534d5b51d4", 1000),
  women: stockPhoto("photo-1572804013309-6e6b7da0e1b5", 1000),
  kids: stockPhoto("photo-1519457438214-596aece209bb", 1000),
  athleisure: stockPhoto("photo-1517836357463-d25dfeac3438", 1000),
  dressFashion: stockPhoto("photo-1523381210434-271e8be1f52b", 1000),
  accessories: stockPhoto("photo-1558769132-cb1aea458c5e", 1000),
};

/**
 * Segment hero banners — Unsplash (royalty-free). Distinct moods per segment.
 * backgroundImage: used on catalog segment strips (full-bleed + light overlay in Catalog.jsx).
 */
export const segmentVisuals = {
  men: {
    /** Menswear / shirting — verified Unsplash IDs (avoid 404s on bad hashes) */
    banner: stockPhoto("photo-1620799140408-ed534d5b51d4", 1600, 80),
    backgroundImage: stockPhoto("photo-1620799140408-ed534d5b51d4", 1600, 80),
    tiles: [
      stockPhoto("photo-1618354691373-d851c5c3a990", 900, 78),
      stockPhoto("photo-1542272604-787c3835335d", 900, 78),
      stockPhoto("photo-1602810318383-e386cc2a3ccf", 900, 78),
    ],
  },
  women: {
    /** Women’s fashion / dresses & rails */
    banner: stockPhoto("photo-1572804013309-6e6b7da0e1b5", 1600, 80),
    backgroundImage: stockPhoto("photo-1572804013309-6e6b7da0e1b5", 1600, 80),
    tiles: [
      stockPhoto("photo-1572804013309-6e6b7da0e1b5", 900, 78),
      stockPhoto("photo-1496747611176-843222e1f57a", 900, 78),
      stockPhoto("photo-1594633313593-af9fa9836b99", 900, 78),
    ],
  },
  kids: {
    /** Kids / playful cotton */
    banner: stockPhoto("photo-1519457438214-596aece209bb", 1600, 80),
    backgroundImage: stockPhoto("photo-1519457438214-596aece209bb", 1600, 80),
    tiles: [
      stockPhoto("photo-1519457438214-596aece209bb", 900, 78),
      stockPhoto("photo-1503919545889-aef636e10ad4", 900, 78),
      stockPhoto("photo-1503454537195-1dcabb73ffb9", 900, 78),
    ],
  },
  genz: {
    banner: stockPhoto("photo-1523381210434-271e8be1f52b", 1600, 80),
    backgroundImage: stockPhoto("photo-1445205170230-053b83016050", 1600, 80),
    tiles: [
      stockPhoto("photo-1523381210434-271e8be1f52b", 900, 78),
      stockPhoto("photo-1445205170230-053b83016050", 900, 78),
      stockPhoto("photo-1558769132-cb1aea458c5e", 900, 78),
    ],
  },
};

/** Hero carousel slides when not using CMS banners */
export const defaultHeroSlides = [
  {
    id: "cotton-atelier",
    title: "TN16 Cotton Atelier",
    subtitle: "Breathable layers spun and sewn in Tirupur.",
    ctaPrimary: "Shop the edit",
    ctaSecondary: "View coupons",
    badge: "NEW DROP",
    segment: "men",
    image: stockPhoto("photo-1620799140408-ed534d5b51d4", 1600),
    gradient: "from-slate-100 via-white to-cyan-50/40",
  },
  {
    id: "women-edit",
    title: "Soft Silhouettes",
    subtitle: "Kurtas, dresses & coordinates in easy cotton.",
    ctaPrimary: "Shop women",
    ctaSecondary: "Studio",
    badge: "CURATED",
    segment: "women",
    image: stockPhoto("photo-1594633313593-af9fa9836b99", 1600),
    gradient: "from-rose-50/80 via-white to-slate-50",
  },
  {
    id: "kids",
    title: "Play-ready Sets",
    subtitle: "Durable cotton fits for every day of play.",
    ctaPrimary: "Shop kids",
    ctaSecondary: "TN16 Studio",
    badge: "FAMILY",
    segment: "kids",
    image: stockPhoto("photo-1519457438214-596aece209bb", 1600),
    gradient: "from-sky-50 via-white to-amber-50/50",
  },
];
