import express from "express";
import { adminLogin, getAdminProfile } from "../../controllers/admin/adminAuthController.js";
import { verifyAdmin } from "../../middlewares/adminAuth.js"; // <- fixed import

const router = express.Router();

// PUBLIC
router.post("/login", adminLogin);

// PROTECTED (admin only)
router.get("/profile", verifyAdmin, getAdminProfile);

export default router;
