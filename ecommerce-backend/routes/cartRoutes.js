import express from "express";
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/:id", protect, updateCart);
router.delete("/:id", protect, removeFromCart);

// clear full cart
router.delete("/", protect, clearCart);

export default router;
