import { defaultHeroSlides, segmentVisuals } from "./visualAssets";

export const heroSlides = defaultHeroSlides;

const visuals = segmentVisuals;

export const segmentThemes = {
  men: {
    key: "men",
    label: "Men",
    primary: "#0f172a",
    accent: "#0e7490",
    banner: visuals.men.banner,
    backgroundImage: visuals.men.backgroundImage,
    description: "Denim, polos, breathable shirts & court sneakers.",
    tiles: visuals.men.tiles,
    menuColumns: [
      {
        title: "Topwear",
        links: ["Casual Shirts", "Polos", "Oversized Tees", "Layering"],
      },
      {
        title: "Bottomwear",
        links: ["Cargos", "Draped Pants", "Joggers", "Cotton Denim"],
      },
      {
        title: "Footwear",
        links: ["Loafers", "Sliders", "Sneakers", "Ethnic"],
      },
      {
        title: "Accessories",
        links: ["Belts", "Socks", "Caps", "Bags"],
      },
    ],
  },
  women: {
    key: "women",
    label: "Women",
    primary: "#881337",
    accent: "#fb7185",
    banner: visuals.women.banner,
    backgroundImage: visuals.women.backgroundImage,
    description: "Handloom kurtas, co-ord sets, cotton dresses & fusion fits.",
    tiles: visuals.women.tiles,
    menuColumns: [
      {
        title: "Indian Wear",
        links: ["Kurtas & Sets", "Sarees", "Lehengas", "Dupattas"],
      },
      {
        title: "Western Wear",
        links: ["Dresses", "Co-ords", "Denim", "Jumpsuits"],
      },
      {
        title: "Footwear",
        links: ["Wedges", "Kolhapuri", "Sneakers", "Slides"],
      },
      {
        title: "Accessories",
        links: ["Jewellery", "Handbags", "Scarves", "Hair Accessories"],
      },
    ],
  },
  kids: {
    key: "kids",
    label: "Kids",
    primary: "#0c4a6e",
    accent: "#f59e0b",
    banner: visuals.kids.banner,
    backgroundImage: visuals.kids.backgroundImage,
    description: "Playproof cotton sets, coordinate capsules & festive fits.",
    tiles: visuals.kids.tiles,
    menuColumns: [
      {
        title: "Boys",
        links: ["Tees", "Shorts", "Ethnic Sets", "Nightwear"],
      },
      {
        title: "Girls",
        links: ["Frocks", "Jumpsuits", "Leggings", "Partywear"],
      },
      {
        title: "Accessories",
        links: ["Caps", "Backpacks", "Socks", "Hairbands"],
      },
      {
        title: "Footwear",
        links: ["Sneakers", "Flats", "Sandals", "School Shoes"],
      },
    ],
  },
  genz: {
    key: "genz",
    label: "Dress & Fashion",
    primary: "#4c1d95",
    accent: "#db2777",
    banner: visuals.genz.banner,
    backgroundImage: visuals.genz.backgroundImage,
    description: "Trendy fashion pieces, stylish dresses & contemporary designs.",
    tiles: visuals.genz.tiles,
    menuColumns: [
      {
        title: "Dresses",
        links: ["Casual Dresses", "Formal Dresses", "Maxi Dresses", "Party Wear"],
      },
      {
        title: "Fashion",
        links: ["Trending Styles", "Designer Collection", "Limited Edition", "New Arrivals"],
      },
      {
        title: "Footwear",
        links: ["Heels", "Flats", "Boots", "Sneakers"],
      },
      {
        title: "Accessories",
        links: ["Handbags", "Jewellery", "Belts", "Scarves"],
      },
    ],
  },
};
