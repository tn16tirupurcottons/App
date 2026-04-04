import { Product, Category, User, OrderItem, Order } from "../models/index.js";
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
   VALIDATED + ERROR SAFE
--------------------------------------------------- */
export const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category,
      subCategory,
      categoryId,
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
      offer,
      offerTag,
      isOnOffer,
    } = req.query;

    const categorySlug = String(req.query.categorySlug || category || "").trim();
    const subCategorySlug = String(req.query.subCategorySlug || subCategory || "").trim();

    // VALIDATION: Pagination
    let pageNum = Math.max(1, Math.floor(Number(page) || 1));
    let limitNum = Math.min(100, Math.max(1, Math.floor(Number(limit) || 20)));

    const where = {};
    const include = [
      {
        model: Category,
        attributes: ["id", "name", "slug", "accentColor", "heroImage"],
      },
    ];

    // VALIDATION: Search
    if (search && typeof search === "string" && search.trim()) {
      const safeSearch = search.trim().slice(0, 100);
      where[Op.or] = [
        { name: { [Op.iLike]: `%${safeSearch}%` } },
        { description: { [Op.iLike]: `%${safeSearch}%` } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brand && typeof brand === "string") {
      const brands = parseArrayField(brand);
      if (brands.length === 1) {
        where.brand = brands[0];
      } else if (brands.length > 1) {
        where.brand = { [Op.in]: brands };
      }
    }
    if (featured) where.isFeatured = featured === "true";
    if (status) where.status = status;
    if (offer || isOnOffer) {
      where.isOnOffer = true;
    }
    if (offerTag) {
      where.offerTag = offerTag;
    }

    // Category and subcategory query support
    if (subCategorySlug) {
      const subCat = await Category.findOne({ where: { slug: subCategorySlug.toLowerCase() } });
      if (subCat) {
        where.categoryId = subCat.id;
      } else {
        where.categoryId = null;
      }
    } else if (categorySlug) {
      const mainCat = await Category.findOne({ where: { slug: categorySlug.toLowerCase() } });
      if (mainCat) {
        const subCats = await Category.findAll({ where: { parentId: mainCat.id } });
        const catIds = [mainCat.id, ...subCats.map((c) => c.id)];
        where.categoryId = { [Op.in]: catIds };
      }
    }

    // Size and color array support
    if (size) {
      const sizeValues = parseArrayField(size);
      if (sizeValues.length) {
        where.sizes = { [Op.overlap]: sizeValues };
      }
    }
    if (color) {
      const colorValues = parseArrayField(color);
      if (colorValues.length) {
        where.colors = { [Op.overlap]: colorValues };
      }
    }

    // VALIDATION: Price range
    if (min || max) {
      where.price = {};
      if (min) {
        const minPrice = Number(min);
        if (!isNaN(minPrice) && minPrice >= 0) {
          where.price[Op.gte] = minPrice;
        }
      }
      if (max) {
        const maxPrice = Number(max);
        if (!isNaN(maxPrice) && maxPrice > 0) {
          where.price[Op.lte] = maxPrice;
        }
      }
    }

    let order = [["createdAt", "DESC"]];
    if (sort === "price_asc") order = [["price", "ASC"]];
    if (sort === "price_desc") order = [["price", "DESC"]];

    const offset = (pageNum - 1) * limitNum;

    const products = await Product.findAndCountAll({
      where,
      include,
      distinct: true,
      order,
      limit: limitNum,
      offset,
    });

    // Convert Sequelize models to plain objects to prevent circular references
    const items = products.rows.map((product) => {
      const item = product.get({ plain: true });
      item.basePrice = Number(item.basePrice || item.price || 0);
      item.dynamicPrice = Number(item.dynamicPrice || item.basePrice || item.price || 0);
      item.price = item.dynamicPrice;
      item.demandScore = Number(item.demandScore || 0);
      item.viewsCount = Number(item.viewsCount || 0);
      item.purchasesCount = Number(item.purchasesCount || 0);
      item.lastUpdated = item.lastUpdated || item.updatedAt;
      return item;
    });

    return res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalItems: products.count,
      totalPages: Math.ceil(products.count / limit),
      items,
    });
  } catch (err) {
    console.error("Product Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* --------------------------------------------------
   GET OFFER PRODUCTS
--------------------------------------------------- */
export const getOfferProducts = async (req, res) => {
  try {
    const where = {
      isOnOffer: true,
      discount: { [Op.gt]: 0 },
      status: "active",
    };

    if (req.query.offerTag) {
      where.offerTag = req.query.offerTag;
    }

    const products = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["discount", "DESC"]],
      limit: Number(req.query.limit || 20),
      offset: (Number(req.query.page || 1) - 1) * Number(req.query.limit || 20),
      distinct: true,
    });

    const items = products.rows.map((product) => product.get({ plain: true }));

    res.json({
      success: true,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),
      totalItems: products.count,
      totalPages: Math.ceil(products.count / Number(req.query.limit || 20)),
      items,
    });
  } catch (err) {
    console.error("Offers Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* --------------------------------------------------
   GET LIGHTNING DEALS
--------------------------------------------------- */
export const getLightningDeals = async (req, res) => {
  try {
    const now = new Date();
    const findResult = await Product.findAndCountAll({
      where: {
        isLightningDeal: true,
        status: "active",
        dealStartTime: { [Op.lte]: now },
        dealEndTime: { [Op.gte]: now },
        dealStock: { [Op.gt]: 0 },
      },
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["dealEndTime", "ASC"]],
      limit: Number(req.query.limit || 12),
    });

    const items = findResult.rows.map((product) => product.get({ plain: true }));
    const totalItems = findResult.count;

    res.json({ success: true, items, totalItems });
  } catch (err) {
    console.error("Lightning Deals Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* --------------------------------------------------
   GET RECOMMENDED
--------------------------------------------------- */
export const getRecommendedProducts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { categoryId, limit = 12 } = req.query;

    let where = { status: "active" };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["updatedAt", "DESC"]],
      limit: Number(limit),
    });

    const items = products.rows.map((product) => product.get({ plain: true }));

    res.json({
      success: true,
      userId,
      items,
      totalItems: products.count,
    });
  } catch (err) {
    console.error("Recommendations Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* --------------------------------------------------
   AI STYLIST RECOMMENDATIONS
--------------------------------------------------- */
export const getAiStylistRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userOrderItems = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: {
            userId,
            status: { [Op.not]: "cancelled" },
          },
          attributes: ["id"],
          required: true,
        },
        {
          model: Product,
          include: [{ model: Category, attributes: ["id", "name", "slug"] }],
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 120,
    });

    const categoryScore = {};
    const purchaseIds = new Set();

    userOrderItems.forEach((item) => {
      if (!item.Product) return;
      const catId = item.Product.categoryId;
      if (catId) {
        categoryScore[catId] = (categoryScore[catId] || 0) + item.quantity;
      }
      purchaseIds.add(item.productId);
    });

    const preferredCategoryIds = Object.entries(categoryScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const categoryMatch =
      preferredCategoryIds.length > 0
        ? {
            categoryId: {
              [Op.in]: preferredCategoryIds,
            },
          }
        : {};

    const baseRecommendations = await Product.findAll({
      where: {
        status: "active",
        ...categoryMatch,
        id: { [Op.notIn]: [...purchaseIds] },
      },
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["createdAt", "DESC"]],
      limit: 12,
    });

    const trending = await Product.findAll({
      where: {
        status: "active",
        isFeatured: true,
      },
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      order: [["updatedAt", "DESC"]],
      limit: 8,
    });

    const outfitCombos = [];
    if (baseRecommendations.length >= 3) {
      const [first, second, third] = baseRecommendations;
      outfitCombos.push({
        title: "Weekend City Style",
        items: [first, second, third].map((p) => p.get({ plain: true })),
        description: "A curated set for a confident urban look",
      });
    }

    const skinToneHint = user?.preferredSkinTone || "medium";
    const occasion = req.query.occasion || "everyday";

    return res.json({
      success: true,
      userId,
      userPreferences: {
        skinTone: skinToneHint,
        occasion,
      },
      recommended: baseRecommendations.map((p) => p.get({ plain: true })),
      trending: trending.map((p) => p.get({ plain: true })),
      outfitCombos,
    });
  } catch (err) {
    console.error("AI Stylist Error:", err);
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

    // Increment view count and track demand
    await product.increment("viewsCount", { by: 1 });

    const updatedItem = product.get({ plain: true });
    updatedItem.viewsCount = Number(updatedItem.viewsCount || 0) + 1;

    // Use dynamic pricing if present
    updatedItem.basePrice = Number(updatedItem.basePrice || updatedItem.price || 0);
    updatedItem.dynamicPrice = Number(updatedItem.dynamicPrice || updatedItem.basePrice || updatedItem.price || 0);
    updatedItem.price = updatedItem.dynamicPrice;

    res.json(updatedItem);
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
    payload.spinImages = parseArrayField(payload.spinImages);
    payload.tryOnImages = parseArrayField(payload.tryOnImages);
    payload.tags = parseArrayField(payload.tags);

    if (payload.videoUrl && typeof payload.videoUrl === "string") {
      payload.videoUrl = payload.videoUrl.trim();
    }
    if (payload.model3dUrl && typeof payload.model3dUrl === "string") {
      payload.model3dUrl = payload.model3dUrl.trim();
    }
    if (payload.arModelUrl && typeof payload.arModelUrl === "string") {
      payload.arModelUrl = payload.arModelUrl.trim();
    }

    payload.isOnOffer = payload.isOnOffer === true || payload.isOnOffer === "true";
    payload.isLightningDeal = payload.isLightningDeal === true || payload.isLightningDeal === "true";

    payload.basePrice = Number(payload.basePrice || payload.price || 0);
    payload.dynamicPrice = payload.dynamicPrice ? Number(payload.dynamicPrice) : Number(payload.basePrice || payload.price || 0);
    payload.viewsCount = Number(payload.viewsCount || 0);
    payload.purchasesCount = Number(payload.purchasesCount || 0);
    payload.demandScore = Number(payload.demandScore || 0);
    payload.lastUpdated = payload.lastUpdated ? new Date(payload.lastUpdated) : new Date();

    payload.originalPrice = Number(payload.originalPrice || payload.price || payload.basePrice || 0);
    payload.discountPercentage = Number(payload.discountPercentage || payload.discount || 0);
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
    if (payload.spinImages) payload.spinImages = parseArrayField(payload.spinImages);
    if (payload.tryOnImages) payload.tryOnImages = parseArrayField(payload.tryOnImages);
    if (payload.tags) payload.tags = parseArrayField(payload.tags);

    if (payload.videoUrl && typeof payload.videoUrl === "string") {
      payload.videoUrl = payload.videoUrl.trim();
    }
    if (payload.model3dUrl && typeof payload.model3dUrl === "string") {
      payload.model3dUrl = payload.model3dUrl.trim();
    }
    if (payload.arModelUrl && typeof payload.arModelUrl === "string") {
      payload.arModelUrl = payload.arModelUrl.trim();
    }

    if (payload.isOnOffer !== undefined) {
      payload.isOnOffer = payload.isOnOffer === true || payload.isOnOffer === "true";
    }
    if (payload.isLightningDeal !== undefined) {
      payload.isLightningDeal = payload.isLightningDeal === true || payload.isLightningDeal === "true";
    }

    if (payload.basePrice !== undefined) {
      payload.basePrice = Number(payload.basePrice);
    }
    if (payload.dynamicPrice !== undefined) {
      payload.dynamicPrice = Number(payload.dynamicPrice);
    }
    if (payload.viewsCount !== undefined) {
      payload.viewsCount = Number(payload.viewsCount);
    }
    if (payload.purchasesCount !== undefined) {
      payload.purchasesCount = Number(payload.purchasesCount);
    }
    if (payload.demandScore !== undefined) {
      payload.demandScore = Number(payload.demandScore);
    }
    if (payload.lastUpdated !== undefined) {
      payload.lastUpdated = payload.lastUpdated ? new Date(payload.lastUpdated) : new Date();
    }

    if (payload.originalPrice !== undefined) {
      payload.originalPrice = Number(payload.originalPrice);
    }
    if (payload.discountPercentage !== undefined) {
      payload.discountPercentage = Number(payload.discountPercentage);
    }

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
   ADD TRY-ON IMAGE (ADMIN)
--------------------------------------------------- */
export const addTryOnImage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: "imageUrl is required" });
    }

    const updatedTryOn = Array.isArray(product.tryOnImages) ? [...product.tryOnImages] : [];
    if (!updatedTryOn.includes(imageUrl)) {
      updatedTryOn.push(imageUrl);
    }

    await product.update({ tryOnImages: updatedTryOn });

    res.json({ success: true, product });
  } catch (err) {
    console.error("Add Try-On Image Error:", err);
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
