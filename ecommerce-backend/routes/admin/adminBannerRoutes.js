import express from "express";
import {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../../controllers/admin/bannerController.js";
import { adminOnly } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

// Public endpoint for fetching active banners
router.get("/", listBanners);
router.post("/", adminOnly, createBanner);
router.put("/:id", adminOnly, updateBanner);
router.delete("/:id", adminOnly, deleteBanner);

export default router;

