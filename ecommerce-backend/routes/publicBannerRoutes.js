import express from "express";
import { listStorefrontBanners } from "../controllers/admin/bannerController.js";

const router = express.Router();

router.get("/", listStorefrontBanners);

export default router;
