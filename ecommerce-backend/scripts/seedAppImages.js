import AppImage from "../models/AppImage.js";

function stockPhoto(id, w = 1200, q = 75) {
  const base = id.includes("http") ? id : `https://images.unsplash.com/${id}`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}ixlib=rb-4.0.3&auto=format&fit=crop&w=${w}&q=${q}`;
}

const heroBackdrop = stockPhoto("photo-1620799140408-ed534d5b51d4", 1920);

const categoryStock = {
  men: stockPhoto("photo-1620799140408-ed534d5b51d4", 1000),
  women: stockPhoto("photo-1572804013309-6e6b7da0e1b5", 1000),
  kids: stockPhoto("photo-1519457438214-596aece209bb", 1000),
  athleisure: stockPhoto("photo-1517836357463-d25dfeac3438", 1000),
  dressFashion: stockPhoto("photo-1523381210434-271e8be1f52b", 1000),
  accessories: stockPhoto("photo-1558769132-cb1aea458c5e", 1000),
};

const segmentVisuals = {
  men: {
    banner: stockPhoto("photo-1620799140408-ed534d5b51d4", 1600, 80),
    tiles: [
      stockPhoto("photo-1618354691373-d851c5c3a990", 900, 78),
      stockPhoto("photo-1542272604-787c3835335d", 900, 78),
      stockPhoto("photo-1602810318383-e386cc2a3ccf", 900, 78),
    ],
  },
  women: {
    banner: stockPhoto("photo-1572804013309-6e6b7da0e1b5", 1600, 80),
    tiles: [
      stockPhoto("photo-1572804013309-6e6b7da0e1b5", 900, 78),
      stockPhoto("photo-1496747611176-843222e1f57a", 900, 78),
      stockPhoto("photo-1594633313593-af9fa9836b99", 900, 78),
    ],
  },
  kids: {
    banner: stockPhoto("photo-1519457438214-596aece209bb", 1600, 80),
    tiles: [
      stockPhoto("photo-1519457438214-596aece209bb", 900, 78),
      stockPhoto("photo-1503919545889-aef636e10ad4", 900, 78),
      stockPhoto("photo-1503454537195-1dcabb73ffb9", 900, 78),
    ],
  },
  genz: {
    banner: stockPhoto("photo-1523381210434-271e8be1f52b", 1600, 80),
    tiles: [
      stockPhoto("photo-1523381210434-271e8be1f52b", 900, 78),
      stockPhoto("photo-1445205170230-053b83016050", 900, 78),
      stockPhoto("photo-1558769132-cb1aea458c5e", 900, 78),
    ],
  },
  accessories: {
    banner: stockPhoto("photo-1558769132-cb1aea458c5e", 1600, 80),
    tiles: [
      stockPhoto("photo-1558769132-cb1aea458c5e", 900, 78),
      stockPhoto("photo-1523381210434-271e8be1f52b", 900, 78),
      stockPhoto("photo-1445205170230-053b83016050", 900, 78),
    ],
  },
};

function seedRows() {
  const rows = [
    {
      key: "GLOBAL_FALLBACK_IMAGE",
      label: "Global image fallback",
      description: "Used when any managed image fails to load.",
      image_url: stockPhoto("photo-1558769132-cb1aea458c5e", 1200),
    },
    {
      key: "HOME_HERO_BACKDROP",
      label: "Home hero fallback backdrop",
      description: "Banner carousel when no CMS banners and no brand hero URL.",
      image_url: heroBackdrop,
    },
    {
      key: "HOME_PROMO_HERO",
      label: "Home hero (brand slot)",
      description: "Primary hero image from brand theme / admin.",
      image_url: heroBackdrop,
    },
    {
      key: "HOME_PROMO_1",
      label: "Home promo strip 1",
      description: "Secondary slide in hero rotation.",
      image_url: stockPhoto("photo-1594633313593-af9fa9836b99", 1600),
    },
    {
      key: "HOME_PROMO_2",
      label: "Home promo strip 2",
      description: "Tertiary slide in hero rotation.",
      image_url: stockPhoto("photo-1519457438214-596aece209bb", 1600),
    },
    {
      key: "HOME_EDITORIAL_MEN_LAYERS",
      label: "Three to watch — Men's layers",
      description: "Editorial card 1 on homepage.",
      image_url: segmentVisuals.men.tiles[0],
    },
    {
      key: "HOME_EDITORIAL_WOMEN_SILHOUETTES",
      label: "Three to watch — Women's silhouettes",
      description: "Editorial card 2 on homepage.",
      image_url: segmentVisuals.women.tiles[1],
    },
    {
      key: "HOME_EDITORIAL_STUDIO_DROP",
      label: "Three to watch — Studio drop",
      description: "Editorial card 3 on homepage.",
      image_url: segmentVisuals.genz.tiles[0],
    },
    {
      key: "HOME_COLLECTION_LIGHT_LAYERS",
      label: "Collections — Light layers",
      description: "Seasonal collections large card 1.",
      image_url: stockPhoto("photo-1572804013309-6e6b7da0e1b5", 1400),
    },
    {
      key: "HOME_COLLECTION_CORE_TEES",
      label: "Collections — Core tees",
      description: "Seasonal collections large card 2.",
      image_url: stockPhoto("photo-1620799140408-ed534d5b51d4", 1400),
    },
    {
      key: "HOME_OFFER_LIMITED",
      label: "Worth a look — Limited",
      description: "Offers row card 1.",
      image_url: categoryStock.men,
    },
    {
      key: "HOME_OFFER_NEW_IN",
      label: "Worth a look — New in",
      description: "Offers row card 2.",
      image_url: categoryStock.women,
    },
    {
      key: "HOME_OFFER_TOP_MOVES",
      label: "Worth a look — Top moves",
      description: "Offers row card 3.",
      image_url: categoryStock.dressFashion,
    },
    {
      key: "HOME_LOOK_SOFT_TAILORING",
      label: "Looks grid — Soft tailoring",
      description: "Curated looks tile 1.",
      image_url: segmentVisuals.women.tiles[2],
    },
    {
      key: "HOME_LOOK_DENIM_SHIRTS",
      label: "Looks grid — Denim / shirts",
      description: "Curated looks tile 2.",
      image_url: segmentVisuals.men.tiles[1],
    },
    {
      key: "HOME_LOOK_KIDS",
      label: "Looks grid — Kids",
      description: "Curated looks tile 3.",
      image_url: segmentVisuals.kids.tiles[0],
    },
    {
      key: "HOME_LOOK_STUDIO",
      label: "Looks grid — Studio",
      description: "Curated looks tile 4.",
      image_url: segmentVisuals.genz.tiles[2],
    },
    {
      key: "HOME_HERO_TIRUPUR_BANNER",
      label: "Tirupur capsule banner",
      description: "Wide banner above footer (Still made in Tirupur).",
      image_url: heroBackdrop,
    },
  ];

  ["men", "women", "kids", "genz", "accessories"].forEach((seg) => {
    const v = segmentVisuals[seg];
    rows.push({
      key: `SEGMENT_${seg.toUpperCase()}_BANNER`,
      label: `Segment ${seg} — strip banner`,
      description: `Background for ${seg} segment rows.`,
      image_url: v.banner,
    });
    v.tiles.forEach((url, i) => {
      rows.push({
        key: `SEGMENT_${seg.toUpperCase()}_TILE_${i}`,
        label: `Segment ${seg} — collage tile ${i + 1}`,
        description: `Homepage ${seg} edit collage image ${i + 1}.`,
        image_url: url,
      });
    });
  });

  const catMap = [
    ["CAT_GRID_MENS_SHIRTS", "Men category card", "Shop by categories — Men", categoryStock.men],
    ["CAT_GRID_WOMEN_KURTAS", "Women category card", "Shop by categories — Women", categoryStock.women],
    ["CAT_GRID_KIDS_WEAR", "Kids category card", "Shop by categories — Kids", categoryStock.kids],
    ["CAT_GRID_ATHLEISURE", "Athleisure category card", "Shop by categories — Athleisure", categoryStock.athleisure],
    ["CAT_GRID_ACCESSORIES", "Accessories category card", "Shop by categories — Accessories", categoryStock.accessories],
    ["CAT_GRID_TN18_LEGACY", "TN18 Legacy category card", "Optional legacy line card", categoryStock.accessories],
  ];

  catMap.forEach(([key, label, description, image_url]) => {
    rows.push({ key, label, description, image_url });
  });

  rows.push(
    {
      key: "HERO_BANNER_MEN",
      label: "Hero strip — Men",
      description: "About / marketing hero grid (column 1).",
      image_url: segmentVisuals.men.tiles[0],
    },
    {
      key: "HERO_BANNER_WOMEN",
      label: "Hero strip — Women",
      description: "About / marketing hero grid (column 2).",
      image_url: segmentVisuals.women.tiles[0],
    },
    {
      key: "HERO_BANNER_KIDS",
      label: "Hero strip — Kids",
      description: "About / marketing hero grid (column 3).",
      image_url: segmentVisuals.kids.tiles[0],
    }
  );

  return rows;
}

export async function seedAppImages() {
  const rows = seedRows();
  const existing = await AppImage.findAll({ attributes: ["key"] });
  const have = new Set(existing.map((r) => r.key));
  const missing = rows.filter((r) => !have.has(r.key));
  if (missing.length === 0) return;
  await AppImage.bulkCreate(missing, { validate: true });
  console.log(`✅ Seeded ${missing.length} new app_images row(s) (${rows.length} total defined)`);
}
