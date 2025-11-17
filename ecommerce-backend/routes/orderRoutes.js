import express from "express";
import {
  createCheckoutIntent,
  placeOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, createCheckoutIntent);
router.post("/", protect, placeOrder);
router.get("/", protect, getOrders);
router.get("/all", protect, admin, getAllOrders);
router.patch("/:id/status", protect, admin, updateOrderStatus);

export default router;