// controllers/cartController.js
import { Cart, Product, Category } from "../models/index.js";
import { Op } from "sequelize";

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
      include: [
        { 
          model: Product,
          attributes: ["id", "name", "price", "discount", "thumbnail", "gallery", "brand"],
          include: [
            {
              model: Category,
              attributes: ["id", "name", "slug"],
            }
          ]
        }
      ],
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
    const rawProductId = req.body.productId;
    const productId = rawProductId == null ? "" : String(rawProductId).trim();
    const { quantity = 1, selectedSize, selectedColor } = req.body;

    // VALIDATION: productId must be present and non-empty
    if (!productId) {
      return res.status(400).json({ success: false, message: "Valid product ID is required" });
    }

    // VALIDATION: quantity
    const qtyNum = Number(quantity);
    if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const inventory = product.inventory ?? Number.MAX_SAFE_INTEGER;
    const maxQuantity = Math.min(quantity, inventory);
    const unitPrice = product.price - (product.discount || 0);

    // Build where clause - handle null values properly using Sequelize Op
    const whereConditions = {
      userId: req.user.id,
      productId,
    };

    // Handle size - if provided, match exact; if null/empty, match null
    if (selectedSize && selectedSize.trim() !== "") {
      whereConditions.selectedSize = selectedSize;
    } else {
      whereConditions.selectedSize = { [Op.is]: null };
    }

    // Handle color - if provided, match exact; if null/empty, match null
    if (selectedColor && selectedColor.trim() !== "") {
      whereConditions.selectedColor = selectedColor;
    } else {
      whereConditions.selectedColor = { [Op.is]: null };
    }

    const existing = await Cart.findOne({
      where: whereConditions,
    });

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + maxQuantity,
        inventory
      );
      await existing.save();
      
      // Reload with Product association and convert to plain object
      await existing.reload({
        include: [
          { 
            model: Product, 
            attributes: ["id", "name", "price", "discount", "thumbnail", "gallery", "brand"],
            include: [
              {
                model: Category,
                attributes: ["id", "name", "slug"],
              }
            ]
          }
        ],
      });
      
      return res.json({ success: true, item: existing.get({ plain: true }) });
    }

    const cartItem = await Cart.create({
      userId: req.user.id,
      productId,
      quantity: maxQuantity,
      selectedSize: selectedSize && selectedSize.trim() !== "" ? selectedSize : null,
      selectedColor: selectedColor && selectedColor.trim() !== "" ? selectedColor : null,
      unitPrice,
    });

    // Load with Product association and convert to plain object
    await cartItem.reload({
      include: [
        { 
          model: Product, 
          attributes: ["id", "name", "price", "discount", "thumbnail", "gallery", "brand"],
          include: [
            {
              model: Category,
              attributes: ["id", "name", "slug"],
            }
          ]
        }
      ],
    });

    res.status(201).json({ success: true, item: cartItem.get({ plain: true }) });
  } catch (err) {
    console.error("Add to cart error:", err);
    next(err);
  }
};

/* ------------------------------
   UPDATE CART ITEM
------------------------------- */
export const updateCart = async (req, res, next) => {
  try {
    const cartItemId = req.params.id;
    
    // VALIDATION: cartItemId
    if (!cartItemId || isNaN(Number(cartItemId))) {
      return res.status(400).json({ success: false, message: "Valid cart item ID is required" });
    }

    const { quantity } = req.body;
    
    // VALIDATION: quantity
    const qtyNum = Number(quantity);
    if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const cartItem = await Cart.findByPk(cartItemId, {
      include: [
        { 
          model: Product,
          attributes: ["id", "name", "price", "discount", "thumbnail", "gallery", "brand", "inventory"],
          include: [
            {
              model: Category,
              attributes: ["id", "name", "slug"],
            }
          ]
        }
      ],
    });

    if (!cartItem)
      return res.status(404).json({ success: false, message: "Cart item not found" });

    // VALIDATION: user owns this cart item
    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const inventory = cartItem.Product?.inventory ?? Number.MAX_SAFE_INTEGER;
    if (qtyNum > inventory) {
      return res
        .status(400)
        .json({ success: false, message: `Only ${inventory} item(s) available in stock` });
    }

    cartItem.quantity = qtyNum;
    cartItem.unitPrice =
      cartItem.Product.price - (cartItem.Product.discount || 0);
    await cartItem.save();

    // Convert to plain object
    res.json({ success: true, item: cartItem.get({ plain: true }) });
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
