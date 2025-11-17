import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  adminGetProducts,
} from "../../controllers/adminProductController.js";

import { adminOnly } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

// Admin Product CRUD
router.get("/", adminOnly, adminGetProducts);
router.post("/", adminOnly, createProduct);
router.put("/:id", adminOnly, updateProduct);
router.delete("/:id", adminOnly, deleteProduct);

export default router;
