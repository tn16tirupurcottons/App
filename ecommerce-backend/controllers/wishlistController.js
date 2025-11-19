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

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (err) {
    next(err);
  }
};

export const addWishlistItem = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
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

    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? "Added to wishlist" : "Already saved to wishlist",
      created,
      item,
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


