import Stripe from "stripe";
import { Order, Cart, Product, OrderItem, User } from "../models/index.js";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

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
    if (!stripe) {
      return res
        .status(500)
        .json({ message: "Stripe key missing on server configuration" });
    }

    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart empty" });
    }

    const totals = calculateTotals(cartItems);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totals.total * 100),
      currency: "inr",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totals,
      items: cartItems.map((item) => item.toJSON()),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const placeOrder = async (req, res) => {
  try {
    if (!stripe) {
      return res
        .status(500)
        .json({ message: "Stripe key missing on server configuration" });
    }

    const { paymentIntentId, shipping } = req.body;
    if (!paymentIntentId || !shipping) {
      return res
        .status(400)
        .json({ message: "paymentIntentId and shipping are required" });
    }

    const shippingFields = [
      "name",
      "phone",
      "address",
      "city",
      "state",
      "zip",
    ];
    const missingFields = shippingFields.filter((field) => !shipping[field]);
    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing shipping fields: ${missingFields.join(", ")}`,
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    if (
      !["succeeded", "processing", "requires_capture"].includes(
        paymentIntent.status
      )
    ) {
      return res
        .status(400)
        .json({ message: "Payment not completed yet. Please retry." });
    }

    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
    });
    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart empty" });
    }

    const totals = calculateTotals(cartItems);

    const order = await Order.create({
      userId: req.user.id,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      shippingFee: totals.shippingFee,
      discountTotal: totals.discountTotal,
      total: totals.total,
      paymentIntentId,
      paymentStatus: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method_types?.[0] || "card",
      shippingName: shipping.name,
      shippingPhone: shipping.phone,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingZip: shipping.zip,
      shippingCountry: shipping.country || "India",
      status: "pending",
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

    res.status(201).json({ success: true, order });
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
    res.json({ success: true, items: orders });
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
    res.json({ success: true, items: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
