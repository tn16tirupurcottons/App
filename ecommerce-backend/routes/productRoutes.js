import express from "express";
import { 
  getProducts, 
  getOfferProducts,
  getLightningDeals,
  getRecommendedProducts,
  getAiStylistRecommendations,
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  addTryOnImage,
} from "../controllers/productController.js";

import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ⭐ Public Routes
router.get("/offers", getOfferProducts);
router.get("/offers/:slug", getOfferProducts);
router.get("/deals/lightning", getLightningDeals);
router.get("/recommended/:userId", getRecommendedProducts);
router.get("/ai/stylist/:userId", getAiStylistRecommendations);
router.get("/", getProducts);
router.get("/:id", getProductById);

// ⭐ Admin Protected Routes
router.post("/", protect, admin, addProduct);
router.put("/:id", protect, admin, updateProduct);
router.post("/:id/tryon", protect, admin, addTryOnImage);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
