import express from "express";
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/", addWishlistItem);
router.delete("/:id", removeWishlistItem);
router.delete("/", clearWishlist);

export default router;
