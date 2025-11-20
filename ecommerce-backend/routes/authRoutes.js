import express from "express";
import {
  register,
  login,
  me,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  sendOtp,
  verifyOtpAndRegister,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/send-otp", sendOtp);
router.post("/verify-otp-register", verifyOtpAndRegister);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", protect, me);

export default router;
