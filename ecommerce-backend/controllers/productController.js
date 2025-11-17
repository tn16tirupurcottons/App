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
  const category = await Category.findOne({ where: { slug: categorySlug } });
  return category?.id || null;
};

/* --------------------------------------------------
   GET ALL PRODUCTS (Search + Filters + Pagination)
--------------------------------------------------- */
export const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category,
      categoryId,
      categorySlug,
      brand,
      size,
      color,
      min,
      max,
      sort = "newest",
      page = 1,
      limit = 20,
      featured,
      status,
    } = req.query;

    const where = {};
    const include = [
      {
        model: Category,
        attributes: ["id", "name", "slug", "accentColor", "heroImage"],
      },
    ];

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brand) where.brand = brand;
    if (featured) where.isFeatured = featured === "true";
    if (status) where.status = status;

    const slugFilter = categorySlug || category;

    if (slugFilter) {
      include[0].where = { slug: slugFilter };
      include[0].required = true;
    }

    if (size) {
      where.sizes = { [Op.contains]: [size] };
    }

    if (color) {
      where.colors = { [Op.contains]: [color] };
    }

    if (min || max) {
      where.price = {};
      if (min) where.price[Op.gte] = Number(min);
      if (max) where.price[Op.lte] = Number(max);
    }

    let order = [["createdAt", "DESC"]];
    if (sort === "price_asc") order = [["price", "ASC"]];
    if (sort === "price_desc") order = [["price", "DESC"]];

    const offset = (Number(page) - 1) * Number(limit);

    const products = await Product.findAndCountAll({
      where,
      include,
      distinct: true,
      order,
      limit: Number(limit),
      offset,
    });

    return res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalItems: products.count,
      totalPages: Math.ceil(products.count / limit),
      items: products.rows,
    });
  } catch (err) {
    console.error("Product Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* --------------------------------------------------
   GET SINGLE PRODUCT
--------------------------------------------------- */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug", "accentColor", "heroImage"],
        },
      ],
    });

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --------------------------------------------------
   ADD NEW PRODUCT  (ADMIN)
--------------------------------------------------- */
export const addProduct = async (req, res) => {
  try {
    const requiredFields = ["name", "price"];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
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

    const product = await Product.create(payload);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* --------------------------------------------------
   UPDATE PRODUCT  (ADMIN)
--------------------------------------------------- */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const payload = { ...req.body };

    if (payload.name && !payload.slug) {
      payload.slug = slugify(payload.name);
    }

    if (payload.slug) {
      const exists = await Product.findOne({
        where: { slug: payload.slug, id: { [Op.ne]: product.id } },
      });
      if (exists) {
        return res.status(400).json({ message: "Slug already in use" });
      }
    }

    if (payload.sizes) payload.sizes = parseArrayField(payload.sizes);
    if (payload.colors) payload.colors = parseArrayField(payload.colors);
    if (payload.gallery) payload.gallery = parseArrayField(payload.gallery);
    if (payload.tags) payload.tags = parseArrayField(payload.tags);

    if (payload.categorySlug || payload.categoryId) {
      const resolvedCategoryId = await resolveCategoryId({
        categoryId: payload.categoryId,
        categorySlug: payload.categorySlug,
      });

      if (!resolvedCategoryId) {
        return res.status(400).json({ message: "Valid category required" });
      }

      payload.categoryId = resolvedCategoryId;
    }

    await product.update(payload);

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* --------------------------------------------------
   DELETE PRODUCT  (ADMIN)
--------------------------------------------------- */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    await product.destroy();

    res.json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ message: err.message });
  }
};
