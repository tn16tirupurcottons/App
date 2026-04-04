import express from "express";
import { listStorefrontBanners } from "../controllers/admin/bannerController.js";

const router = express.Router();

// 🔥 Get all banners (homepage or general)
router.get("/", listStorefrontBanners);

// 🔥 Get category-specific banners
router.get("/category/:categorySlug", listStorefrontBanners);

export default router;