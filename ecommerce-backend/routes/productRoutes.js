import express from "express";
import { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from "../controllers/productController.js";

import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ⭐ Public Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// ⭐ Admin Protected Routes
router.post("/", protect, admin, addProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
