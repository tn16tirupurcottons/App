// controllers/cartController.js
import { Cart, Product } from "../models/index.js";

export const buildSummary = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const fallback =
      (item.Product?.price || 0) - (item.Product?.discount || 0);
    const unitPrice = item.unitPrice ?? fallback;
    return sum + item.quantity * unitPrice;
  }, 0);

  const taxTotal = Number((subtotal * 0.05).toFixed(2));
  const shippingFee = subtotal === 0 || subtotal >= 1999 ? 0 : 59;
  const payable = subtotal + taxTotal + shippingFee;

  return {
    itemCount: items.length,
    subtotal,
    taxTotal,
    shippingFee,
    payable,
  };
};

/* ------------------------------
   GET USER CART
------------------------------- */
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
      order: [["createdAt", "DESC"]],
    });

    // Convert Sequelize models to plain objects
    const items = cart.map((item) => item.get({ plain: true }));

    res.json({
      success: true,
      items,
      summary: buildSummary(cart),
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------
   ADD ITEM TO CART
------------------------------- */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, selectedSize, selectedColor } = req.body;

    if (!productId)
      return res.status(400).json({ message: "productId is required" });
    if (quantity <= 0)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const inventory = product.inventory ?? Number.MAX_SAFE_INTEGER;
    const maxQuantity = Math.min(quantity, inventory);
    const unitPrice = product.price - (product.discount || 0);

    const matchClause = { userId: req.user.id, productId };
    if (selectedSize) matchClause.selectedSize = selectedSize;
    if (selectedColor) matchClause.selectedColor = selectedColor;

    const existing = await Cart.findOne({
      where: matchClause,
    });

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + maxQuantity,
        inventory
      );
      await existing.save();
      return res.json({ success: true, item: existing });
    }

    const cartItem = await Cart.create({
      userId: req.user.id,
      productId,
      quantity: maxQuantity,
      selectedSize,
      selectedColor,
      unitPrice,
    });

    res.status(201).json({ success: true, item: cartItem });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------
   UPDATE CART ITEM
------------------------------- */
export const updateCart = async (req, res, next) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    const { quantity } = req.body;
    if (!quantity || quantity <= 0)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const inventory = cartItem.Product?.inventory ?? Number.MAX_SAFE_INTEGER;
    if (quantity > inventory) {
      return res
        .status(400)
        .json({ message: "Quantity exceeds available stock" });
    }

    cartItem.quantity = quantity;
    cartItem.unitPrice =
      cartItem.Product.price - (cartItem.Product.discount || 0);
    await cartItem.save();

    res.json({ success: true, item: cartItem });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------
   REMOVE ITEM FROM CART
------------------------------- */
export const removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);

    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    await cartItem.destroy();
    res.json({ success: true, message: "Removed from cart" });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------
   CLEAR ENTIRE CART
------------------------------- */
export const clearCart = async (req, res, next) => {
  try {
    await Cart.destroy({
      where: { userId: req.user.id },
    });

    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};
