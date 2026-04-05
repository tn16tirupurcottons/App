import crypto from "crypto";
import Order from "../models/Order.js";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

export const razorpayWebhookHandler = async (req, res) => {
  try {
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error("Razorpay webhook secret is not configured");
      return res.status(500).json({ message: "Webhook secret not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ message: "Missing Razorpay signature" });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Razorpay webhook signature mismatch");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body) : JSON.parse(rawBody.toString("utf8"));
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    if (!payment) {
      return res.status(200).json({ message: "No payment payload processed" });
    }

    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;
    const status = payment.status;
    const order = await Order.findOne({ where: { razorpayOrderId } });

    if (!order) {
      console.warn(`[Webhook] Razorpay order not found for order_id=${razorpayOrderId}`);
      return res.status(200).json({ message: "No matching order" });
    }

    if (event === "payment.captured") {
      order.paymentStatus = "paid";
      order.razorpayPaymentId = razorpayPaymentId;
      if (order.status === "pending") {
        order.status = "confirmed";
      }
      await order.save();
      return res.status(200).json({ message: "Order payment captured" });
    }

    if (event === "payment.failed") {
      order.paymentStatus = "failed";
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();
      return res.status(200).json({ message: "Order payment failed" });
    }

    return res.status(200).json({ message: "Webhook event ignored" });
  } catch (error) {
    console.error("Razorpay webhook handler error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
