import { Wishlist, Product, Category } from "../models/index.js";

const wishlistInclude = [
  {
    model: Product,
    include: [
      {
        model: Category,
        attributes: ["id", "name", "slug", "accentColor", "heroImage"],
      },
    ],
  },
];

export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: wishlistInclude,
      order: [["createdAt", "DESC"]],
    });

    // Convert Sequelize models to plain objects
    const plainItems = items.map((item) => item.get({ plain: true }));

    res.json({
      success: true,
      count: items.length,
      items: plainItems,
    });
  } catch (err) {
    next(err);
  }
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const addWishlistItem = async (req, res, next) => {
  try {
    const productId = req.body?.productId != null ? String(req.body.productId).trim() : "";
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    if (!UUID_RE.test(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [record, created] = await Wishlist.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { userId: req.user.id, productId },
    });

    const item = await Wishlist.findByPk(record.id, { include: wishlistInclude });

    // Convert Sequelize model to plain object
    const plainItem = item.get({ plain: true });

    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? "Added to wishlist" : "Already saved to wishlist",
      created,
      item: plainItem,
    });
  } catch (err) {
    next(err);
  }
};

export const removeWishlistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fallbackProductId = req.body?.productId || req.query?.productId;

    if (!id && !fallbackProductId) {
      return res
        .status(400)
        .json({ message: "Provide wishlist id or productId to remove" });
    }

    const whereClause = {
      userId: req.user.id,
      ...(id ? { id } : { productId: fallbackProductId }),
    };

    const item = await Wishlist.findOne({ where: whereClause });
    if (!item) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    await item.destroy();

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    next(err);
  }
};

export const clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.destroy({ where: { userId: req.user.id } });
    res.json({ success: true, message: "Wishlist cleared" });
  } catch (err) {
    next(err);
  }
};


