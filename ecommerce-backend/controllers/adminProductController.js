import { Product, Category } from "../models/index.js";
import { Op } from "sequelize";
import slugify from "../utils/slugify.js";

const parseArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const resolveCategoryId = async ({ categoryId, categorySlug }) => {
  if (categoryId) return categoryId;
  if (!categorySlug) return null;
  const record = await Category.findOne({ where: { slug: categorySlug } });
  return record?.id || null;
};

/* ================================
     CREATE PRODUCT (PRODUCTION SAFE)
================================ */
export const createProduct = async (req, res) => {
  try {
    const { name, price, categoryId } = req.body;

    // VALIDATION: Required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Valid product name is required" });
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "Valid price greater than 0 is required" });
    }

    if (!categoryId) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    // VALIDATION: Category exists
    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const payload = { ...req.body };
    payload.name = payload.name.trim();
    payload.slug = slugify(payload.slug || payload.name);

    // Check slug uniqueness
    const slugExists = await Product.findOne({ where: { slug: payload.slug } });
    if (slugExists) {
      payload.slug = `${payload.slug}-${Date.now()}`;
    }

    payload.sizes = parseArrayField(payload.sizes);
    payload.colors = parseArrayField(payload.colors);
    payload.gallery = parseArrayField(payload.gallery);
    payload.tags = parseArrayField(payload.tags);
    payload.price = Number(payload.price);

    if (!payload.thumbnail && payload.gallery.length) {
      payload.thumbnail = payload.gallery[0];
    }

    const newProduct = await Product.create(payload);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      item: newProduct,
    });
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

/* ================================
     UPDATE PRODUCT (PRODUCTION SAFE)
================================ */
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const check = await Product.findByPk(id);
    if (!check) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const payload = { ...req.body };

    // VALIDATION: Fields if provided
    if (payload.name && typeof payload.name === "string") {
      payload.name = payload.name.trim();
      if (!payload.name) {
        return res.status(400).json({ success: false, message: "Product name cannot be empty" });
      }
      if (!payload.slug) {
        payload.slug = slugify(payload.name);
      }
    }

    if (payload.price && (isNaN(Number(payload.price)) || Number(payload.price) <= 0)) {
      return res.status(400).json({ success: false, message: "Valid price is required" });
    }

    if (payload.categoryId) {
      const catExists = await Category.findByPk(payload.categoryId);
      if (!catExists) {
        return res.status(400).json({ success: false, message: "Invalid category" });
      }
    }

    // Slug uniqueness check
    if (payload.slug) {
      const exists = await Product.findOne({
        where: { slug: payload.slug, id: { [Op.ne]: id } },
      });
      if (exists) {
        return res.status(400).json({ success: false, message: "Slug already exists" });
      }
    }

    if (payload.sizes) payload.sizes = parseArrayField(payload.sizes);
    if (payload.colors) payload.colors = parseArrayField(payload.colors);
    if (payload.gallery) payload.gallery = parseArrayField(payload.gallery);
    if (payload.tags) payload.tags = parseArrayField(payload.tags);
    if (payload.price) payload.price = Number(payload.price);

    await check.update(payload);

    return res.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

/* ================================
     DELETE PRODUCT (PRODUCTION SAFE)
================================ */
export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const check = await Product.findByPk(id);
    if (!check) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await Product.destroy({ where: { id } });

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

/* ================================
     GET ALL PRODUCTS (ADMIN)
     Pagination + Search + Filter + Sort
================================ */
export const adminGetProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      categorySlug = "",
      categoryId,
      sort = "",
    } = req.query;

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    const where = {};
    const include = [
      {
        model: Category,
        attributes: ["id", "name", "slug"],
      },
    ];

    // Search
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categorySlug) {
      include[0].where = { slug: categorySlug };
      include[0].required = true;
    }

    // Sorting
    let order = [["id", "DESC"]];

    if (sort === "price_low") order = [["price", "ASC"]];
    if (sort === "price_high") order = [["price", "DESC"]];
    if (sort === "newest") order = [["createdAt", "DESC"]];
    if (sort === "oldest") order = [["createdAt", "ASC"]];

    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      distinct: true,
      order,
      limit,
      offset,
    });

    // Convert Sequelize models to plain objects to ensure categoryId is accessible
    const items = rows.map((product) => product.get({ plain: true }));

    return res.json({
      success: true,
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      items,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Fetch failed",
      error: err.message,
    });
  }
};
