import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { applyCoupon, getEligibleCoupons } from "../controllers/couponController.js";

const router = express.Router();

// Coupon engine (user + cart dependent)
router.post("/apply", protect, applyCoupon);
router.get("/eligible", protect, getEligibleCoupons);

export default router;

