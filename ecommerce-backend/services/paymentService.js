import Razorpay from "razorpay";
import Stripe from "stripe";

/**
 * Payment Service
 * Handles multiple payment gateways: Razorpay (Indian), Stripe (International)
 */

// Razorpay Configuration
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

// Stripe Configuration
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

/**
 * Create Razorpay Order
 * Supports: GPay, PhonePe, UPI, Cards, Netbanking, Wallets
 */
export const createRazorpayOrder = async (amount, currency = "INR", metadata = {}) => {
  if (!razorpay) {
    throw new Error("Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
  }

  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: currency.toUpperCase(),
    receipt: `receipt_${Date.now()}`,
    notes: metadata,
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  } catch (error) {
    console.error("[Razorpay] Order creation failed:", error);
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

/**
 * Verify Razorpay Payment
 */
export const verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  if (!razorpay) {
    throw new Error("Razorpay not configured");
  }

  const crypto = await import("crypto");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (generatedSignature !== signature) {
    throw new Error("Invalid payment signature");
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      id: payment.id,
      order_id: payment.order_id,
      status: payment.status,
      amount: payment.amount / 100, // Convert from paise to rupees
      method: payment.method,
      captured: payment.captured,
    };
  } catch (error) {
    console.error("[Razorpay] Payment verification failed:", error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

/**
 * Create Stripe Payment Intent
 */
export const createStripePaymentIntent = async (amount, currency = "usd", metadata = {}) => {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error("[Stripe] Payment intent creation failed:", error);
    throw new Error(`Stripe payment intent creation failed: ${error.message}`);
  }
};

/**
 * Verify Stripe Payment
 */
export const verifyStripePayment = async (paymentIntentId) => {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error("[Stripe] Payment verification failed:", error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

/**
 * Check if payment method is available
 */
export const isPaymentMethodAvailable = (method) => {
  switch (method?.toLowerCase()) {
    case "cod":
      return true; // Always available
    case "razorpay":
    case "online":
      return !!razorpay;
    case "stripe":
      return !!stripe;
    default:
      return false;
  }
};

/**
 * Get available payment methods
 */
export const getAvailablePaymentMethods = () => {
  const methods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: "💰",
      available: true,
    },
  ];

  if (razorpay) {
    methods.push({
      id: "razorpay",
      name: "Online Payment",
      description: "GPay, PhonePe, UPI, Cards, Netbanking",
      icon: "💳",
      available: true,
    });
  }

  if (stripe) {
    methods.push({
      id: "stripe",
      name: "International Cards",
      description: "Visa, Mastercard, Amex",
      icon: "🌍",
      available: true,
    });
  }

  return methods;
};

export { razorpay, stripe };

