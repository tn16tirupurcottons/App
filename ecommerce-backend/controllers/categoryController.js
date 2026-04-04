import { Category, Product } from "../models/index.js";
import { Op } from "sequelize";
import slugify from "../utils/slugify.js";

export const getCategories = async (req, res) => {
  try {
    const includeInactive =
      String(req.query.includeInactive || "").toLowerCase() === "true";
    const where = includeInactive ? {} : { isActive: true };

    const categories = await Category.findAll({
      where,
      order: [["name", "ASC"]],
      attributes: ["id", "name", "slug", "heroImage", "isActive", "description"],
    });
    
    if (!categories || categories.length === 0) {
      return res.json({ success: true, items: [] });
    }

    // Convert Sequelize models to plain objects
    const items = categories.map((cat) => {
      const plain = cat.get({ plain: true });
      // Backward-compatible: storefront expects heroImage; admin can also use image alias.
      return { ...plain, image: plain.heroImage };
    });
    
    res.json({ success: true, items });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // VALIDATION: slug
    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return res.status(400).json({ success: false, message: "Valid category slug is required" });
    }

    const category = await Category.findOne({
      where: { slug: slug.trim(), isActive: true },
      include: [
        {
          model: Product,
          separate: true,
          limit: 8,
          order: [["createdAt", "DESC"]],
          attributes: ["id", "name", "slug", "price", "discount", "thumbnail"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Convert Sequelize model to plain object
    const plain = category.get({ plain: true });
    res.json({ success: true, category: { ...plain, image: plain.heroImage } });
  } catch (error) {
    console.error("Get category by slug error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch category" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      heroImage,
      image,
      accentColor,
      isActive,
    } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const categorySlug = slugify(slug || name);
    const exists = await Category.findOne({ where: { slug: categorySlug } });
    if (exists) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    const category = await Category.create({
      name,
      slug: categorySlug,
      description,
      heroImage: image || heroImage,
      accentColor,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const payload = { ...req.body };
    if (payload.image && !payload.heroImage) {
      payload.heroImage = payload.image;
      delete payload.image;
    }
    if (payload.isActive !== undefined) {
      payload.isActive = Boolean(payload.isActive);
    }
    if (payload.slug || payload.name) {
      const candidate = slugify(payload.slug || payload.name);
      const exists = await Category.findOne({
        where: { slug: candidate, id: { [Op.ne]: category.id } },
      });
      if (exists) {
        return res.status(400).json({ message: "Slug already exists" });
      }
      payload.slug = candidate;
    }

    await category.update(payload);
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Soft delete (deactivate) to keep relations intact.
    category.isActive = false;
    await category.save();
    res.json({ success: true, message: "Category deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

