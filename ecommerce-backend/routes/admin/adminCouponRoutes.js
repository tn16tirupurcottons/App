import express from "express";
import { adminOnly } from "../../middlewares/adminMiddleware.js";
import {
  adminCreateCoupon,
  adminUpdateCoupon,
  adminListCoupons,
} from "../../controllers/couponController.js";

const router = express.Router();

router.get("/", adminOnly, adminListCoupons);
router.post("/", adminOnly, adminCreateCoupon);
router.put("/:id", adminOnly, adminUpdateCoupon);

export default router;

