import { Category, Product } from "../models/index.js";
import { Op } from "sequelize";
import slugify from "../utils/slugify.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });
    // Convert Sequelize models to plain objects
    const items = categories.map((cat) => cat.get({ plain: true }));
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: Product,
          separate: true,
          limit: 8,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Convert Sequelize model to plain object
    res.json({ success: true, category: category.get({ plain: true }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, heroImage, accentColor } = req.body;
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
      heroImage,
      accentColor,
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

    const productCount = await Product.count({
      where: { categoryId: category.id },
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category with linked products",
      });
    }

    await category.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

