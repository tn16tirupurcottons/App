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
     CREATE PRODUCT
================================ */
export const createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name & Price are required" });
    }

    const payload = { ...req.body };
    payload.slug = slugify(payload.slug || payload.name);

    const slugExists = await Product.findOne({ where: { slug: payload.slug } });
    if (slugExists) {
      payload.slug = `${payload.slug}-${Date.now()}`;
    }

    payload.sizes = parseArrayField(payload.sizes);
    payload.colors = parseArrayField(payload.colors);
    payload.gallery = parseArrayField(payload.gallery);
    payload.tags = parseArrayField(payload.tags);

    const resolvedCategoryId = await resolveCategoryId({
      categoryId: payload.categoryId,
      categorySlug: payload.categorySlug,
    });
    if (!resolvedCategoryId) {
      return res.status(400).json({ message: "Valid category required" });
    }
    payload.categoryId = resolvedCategoryId;
    if (!payload.thumbnail && payload.gallery.length) {
      payload.thumbnail = payload.gallery[0];
    }

    const newProduct = await Product.create(payload);

    return res
      .status(201)
      .json({ message: "Product created successfully", item: newProduct });
  } catch (err) {
    return res.status(500).json({
      message: "Create failed",
      error: err.message,
    });
  }
};

/* ================================
     UPDATE PRODUCT
================================ */
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const check = await Product.findByPk(id);
    if (!check) return res.status(404).json({ message: "Product not found" });

    const payload = { ...req.body };

    if (payload.name && !payload.slug) {
      payload.slug = slugify(payload.name);
    }

    if (payload.slug) {
      const exists = await Product.findOne({
        where: { slug: payload.slug, id: { [Op.ne]: id } },
      });
      if (exists) {
        return res.status(400).json({ message: "Slug already exists" });
      }
    }

    if (payload.sizes) payload.sizes = parseArrayField(payload.sizes);
    if (payload.colors) payload.colors = parseArrayField(payload.colors);
    if (payload.gallery) payload.gallery = parseArrayField(payload.gallery);
    if (payload.tags) payload.tags = parseArrayField(payload.tags);

    if (payload.categoryId || payload.categorySlug) {
      const resolvedCategoryId = await resolveCategoryId({
        categoryId: payload.categoryId,
        categorySlug: payload.categorySlug,
      });
      if (!resolvedCategoryId) {
        return res.status(400).json({ message: "Valid category required" });
      }
      payload.categoryId = resolvedCategoryId;
    }

    await check.update(payload);

    return res.json({ message: "Product updated successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
};

/* ================================
     DELETE PRODUCT
================================ */
export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const check = await Product.findByPk(id);
    if (!check) return res.status(404).json({ message: "Product not found" });

    await Product.destroy({ where: { id } });

    return res.json({ message: "Product deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Delete failed",
      error: err.message,
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

    return res.json({
      success: true,
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      items: rows,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Fetch failed",
      error: err.message,
    });
  }
};
