import express from "express";
import {
  createCheckoutIntent,
  placeOrder,
  getOrders,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import { paymentLimiter, orderLimiter } from "../middlewares/securityMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, paymentLimiter, createCheckoutIntent);
router.post("/", protect, orderLimiter, placeOrder);
router.get("/all", protect, admin, getAllOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrders); // Single order - must come before list route
router.get("/", protect, getOrders); // All orders
router.patch("/:id/status", protect, admin, updateOrderStatus);

export default router;