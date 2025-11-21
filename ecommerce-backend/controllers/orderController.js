import { Order, Cart, Product, OrderItem, User } from "../models/index.js";
import { notifyOrderPlaced, sendSMS } from "../services/notificationService.js";
import {
  createRazorpayOrder,
  createStripePaymentIntent,
  verifyRazorpayPayment,
  verifyStripePayment,
  getAvailablePaymentMethods,
  isPaymentMethodAvailable,
} from "../services/paymentService.js";
import { validatePaymentMethod, validateAmount } from "../middlewares/securityMiddleware.js";

const calculateTotals = (cartItems) => {
  const subtotal = cartItems.reduce(
    (sum, item) => {
      const fallbackPrice =
        (item.Product?.price || 0) - (item.Product?.discount || 0);
      const unitPrice = item.unitPrice ?? fallbackPrice;
      return sum + item.quantity * unitPrice;
    },
    0
  );
  const taxTotal = Number((subtotal * 0.05).toFixed(2));
  const shippingFee = subtotal > 1999 ? 0 : 59;
  const discountTotal = 0;
  const total = subtotal + taxTotal + shippingFee - discountTotal;
  return { subtotal, taxTotal, shippingFee, discountTotal, total };
};

export const createCheckoutIntent = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart empty" });
    }

    const totals = calculateTotals(cartItems);

    // Validate amount
    if (!validateAmount(totals.total)) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    // Convert Sequelize models to plain objects
    const items = cartItems.map((item) => {
      if (item && typeof item.get === "function") {
        return item.get({ plain: true });
      }
      return item;
    });

    // Get available payment methods
    const availableMethods = getAvailablePaymentMethods();

    // If no payment method specified, default to COD or first available method
    let selectedMethod = paymentMethod;
    if (!selectedMethod || !validatePaymentMethod(selectedMethod)) {
      // Default to COD if available, otherwise first available method
      selectedMethod = "cod";
    }

    // For COD, no payment intent needed
    if (selectedMethod === "cod") {
      return res.json({
        success: true,
        paymentMethod: "cod",
        paymentIntentId: `cod_${Date.now()}`,
        totals,
        items,
        availableMethods,
        demoMode: false,
      });
    }

    // For Razorpay (online payment in India)
    if (selectedMethod === "razorpay" || selectedMethod === "online") {
      try {
        const razorpayOrder = await createRazorpayOrder(
          totals.total,
          "INR",
          { userId: req.user.id }
        );
        return res.json({
          success: true,
          paymentMethod: "razorpay",
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          totals,
          items,
          availableMethods,
          demoMode: false,
        });
      } catch (error) {
        console.error("[Razorpay] Error:", error);
        // Fallback to COD if Razorpay fails
        return res.json({
          success: true,
          paymentMethod: "cod",
          paymentIntentId: `cod_${Date.now()}`,
          totals,
          items,
          availableMethods,
          demoMode: false,
          warning: "Online payment unavailable. Using Cash on Delivery.",
        });
      }
    }

    // For Stripe (international)
    if (selectedMethod === "stripe") {
      try {
        const stripeIntent = await createStripePaymentIntent(
          totals.total,
          "usd",
          { userId: req.user.id }
        );
        return res.json({
          success: true,
          paymentMethod: "stripe",
          clientSecret: stripeIntent.client_secret,
          paymentIntentId: stripeIntent.id,
          totals,
          items,
          availableMethods,
          demoMode: false,
        });
      } catch (error) {
        console.error("[Stripe] Error:", error);
        // Fallback to COD if Stripe fails
        return res.json({
          success: true,
          paymentMethod: "cod",
          paymentIntentId: `cod_${Date.now()}`,
          totals,
          items,
          availableMethods,
          demoMode: false,
          warning: "Payment gateway unavailable. Using Cash on Delivery.",
        });
      }
    }

    // If all else fails, return COD
    return res.json({
      success: true,
      paymentMethod: "cod",
      paymentIntentId: `cod_${Date.now()}`,
      totals,
      items,
      availableMethods,
      demoMode: false,
    });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    res.status(500).json({ message: error.message || "Checkout failed" });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      paymentMethod = "online",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      shipping 
    } = req.body;

    if (!shipping) {
      return res.status(400).json({ message: "Shipping details are required" });
    }

    // Validate payment method
    if (!validatePaymentMethod(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const shippingFields = ["name", "phone", "address", "city", "state", "zip"];
    const missingFields = shippingFields.filter((field) => !shipping[field]);
    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing shipping fields: ${missingFields.join(", ")}`,
      });
    }

    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
    });
    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart empty" });
    }

    const totals = calculateTotals(cartItems);

    // Validate amount
    if (!validateAmount(totals.total)) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    let paymentStatus = "requires_payment";
    let verifiedPaymentId = paymentIntentId;

    // Handle COD
    if (paymentMethod === "cod") {
      paymentStatus = "requires_payment"; // Will be paid on delivery
      verifiedPaymentId = `cod_${Date.now()}`;
    }
    // Handle Razorpay
    else if (paymentMethod === "razorpay" || paymentMethod === "online") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ 
          message: "Razorpay payment details are required" 
        });
      }

      try {
        const verifiedPayment = await verifyRazorpayPayment(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );
        
        if (verifiedPayment.status !== "authorized" && verifiedPayment.status !== "captured") {
          return res.status(400).json({ 
            message: `Payment not completed. Status: ${verifiedPayment.status}` 
          });
        }

        paymentStatus = verifiedPayment.captured ? "paid" : "processing";
        verifiedPaymentId = razorpayPaymentId;
      } catch (error) {
        return res.status(400).json({ 
          message: `Payment verification failed: ${error.message}` 
        });
      }
    }
    // Handle Stripe
    else if (paymentMethod === "stripe") {
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }

      try {
        const verifiedPayment = await verifyStripePayment(paymentIntentId);
        
        if (!["succeeded", "processing", "requires_capture"].includes(verifiedPayment.status)) {
          return res.status(400).json({ 
            message: `Payment not completed. Status: ${verifiedPayment.status}` 
          });
        }

        paymentStatus = verifiedPayment.status === "succeeded" ? "paid" : "processing";
      } catch (error) {
        return res.status(400).json({ 
          message: `Payment verification failed: ${error.message}` 
        });
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      shippingFee: totals.shippingFee,
      discountTotal: totals.discountTotal,
      total: totals.total,
      paymentIntentId: verifiedPaymentId,
      paymentMethod: paymentMethod === "online" ? "razorpay" : paymentMethod,
      paymentStatus,
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      shippingName: shipping.name,
      shippingPhone: shipping.phone,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingZip: shipping.zip,
      shippingCountry: shipping.country || "India",
      status: paymentMethod === "cod" ? "pending" : "confirmed",
    });

    await Promise.all(
      cartItems.map((item) =>
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })
      )
    );
    await Cart.destroy({ where: { userId: req.user.id } });
    const customer = await User.findByPk(req.user.id);
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Product }],
    });
    notifyOrderPlaced({
      order,
      items: orderItems,
      user: customer,
      shipping,
    }).catch((err) =>
      console.error("[notifications] order placement failed", err)
    );
    // Convert Sequelize model to plain object
    res.status(201).json({ success: true, order: order.get({ plain: true }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [{ model: Product }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    // Convert Sequelize models to plain objects
    const items = orders.map((order) => order.get({ plain: true }));
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          include: [{ model: Product }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    // Convert Sequelize models to plain objects
    const items = orders.map((order) => order.get({ plain: true }));
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User }, { model: OrderItem, include: [{ model: Product }] }],
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = order.status;
    const oldPaymentStatus = order.paymentStatus;

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    // Send notifications if status changed
    if ((status && status !== oldStatus) || (paymentStatus && paymentStatus !== oldPaymentStatus)) {
      const { notifyOrderStatusUpdate } = await import("../services/notificationService.js");
      notifyOrderStatusUpdate({
        order,
        user: order.User,
        oldStatus,
        newStatus: status || order.status,
        oldPaymentStatus,
        newPaymentStatus: paymentStatus || order.paymentStatus,
      }).catch((err) => console.error("[notifications] order status update failed", err));
    }

    // Convert Sequelize model to plain object
    res.json({ success: true, order: order.get({ plain: true }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
