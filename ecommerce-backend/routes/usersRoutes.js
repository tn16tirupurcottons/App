import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

export default router;

