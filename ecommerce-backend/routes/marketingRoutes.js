import express from "express";
import {
  getCategoryOffers,
  getCategoryLightningDeals,
  generateAIBanner,
  aliasRecommended,
  aliasAiStylist,
  aliasLightningDeals,
} from "../controllers/marketingController.js";

const router = express.Router();

router.get("/offers/category/:categorySlug", getCategoryOffers);
router.get("/deals/category/:categorySlug", getCategoryLightningDeals);
router.post("/ai/banner", generateAIBanner);

// Legacy compatibility aliases for frontend paths that previously used /api/recommended and /api/ai/stylist.
router.get("/recommended/:userId", aliasRecommended);
router.get("/ai/stylist/:userId", aliasAiStylist);
router.get("/deals/lightning", aliasLightningDeals);

export default router;
