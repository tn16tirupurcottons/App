import { Op } from "sequelize";
import { Category, Product } from "../models/index.js";
import {
  getRecommendedProducts,
  getAiStylistRecommendations,
  getLightningDeals,
} from "./productController.js";

const buildAIBannerText = (categoryName) => {
  const cleanName = String(categoryName || "fashion").trim();
  const title = `${cleanName.replace(/\b\w/g, (chr) => chr.toUpperCase())} Picks`;
  const subtitle = `Fresh arrivals, tailored looks, and trending outfits for ${cleanName.toLowerCase()}.`;
  return { title, subtitle };
};

const buildAIBannerImage = (categoryName) => {
  const search = encodeURIComponent(String(categoryName || "fashion").trim() || "fashion");
  return `https://source.unsplash.com/1600x900/?${search}`;
};

export const getCategoryOffers = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = await Category.findOne({ where: { slug: categorySlug } });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const offers = await Product.findAndCountAll({
      where: {
        status: "active",
        isOnOffer: true,
        categoryId: category.id,
      },
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["discount", "DESC"]],
      limit: Number(req.query.limit || 20),
    });

    return res.json({
      success: true,
      category: category.name,
      items: offers.rows.map((product) => product.get({ plain: true })),
      totalItems: offers.count,
    });
  } catch (error) {
    console.error("Category Offers Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getCategoryLightningDeals = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = await Category.findOne({ where: { slug: categorySlug } });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const now = new Date();
    const deals = await Product.findAndCountAll({
      where: {
        status: "active",
        isLightningDeal: true,
        categoryId: category.id,
        dealEndTime: { [Op.gte]: now },
        dealStock: { [Op.gt]: 0 },
      },
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["dealEndTime", "ASC"]],
      limit: Number(req.query.limit || 12),
    });

    return res.json({
      success: true,
      category: category.name,
      items: deals.rows.map((product) => product.get({ plain: true })),
      totalItems: deals.count,
    });
  } catch (error) {
    console.error("Category Lightning Deals Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const generateAIBanner = async (req, res) => {
  try {
    const { category } = req.body || {};
    if (!category || String(category).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required to generate AI banner",
      });
    }

    const categoryName = String(category).trim();
    const { title, subtitle } = buildAIBannerText(categoryName);
    const image = buildAIBannerImage(categoryName);

    return res.json({
      success: true,
      title,
      subtitle,
      images: [image],
      image,
      ctaLabel: `Shop ${categoryName}`,
      ctaLink: `/catalog?category=${encodeURIComponent(categoryName.toLowerCase().replace(/\s+/g, "-"))}`,
    });
  } catch (error) {
    console.error("AI Banner Error:", error);
    res.status(500).json({ success: false, message: "Banner generation failed" });
  }
};

export const aliasRecommended = getRecommendedProducts;
export const aliasAiStylist = getAiStylistRecommendations;
export const aliasLightningDeals = getLightningDeals;
