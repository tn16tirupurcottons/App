import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMe,
  updateProfile,
  changePassword,
  checkEmailAvailability,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/check-email", checkEmailAvailability);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

export default router;

