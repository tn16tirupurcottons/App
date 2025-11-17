import express from "express";
import { getAdminOverview } from "../../controllers/admin/dashboardController.js";
import { adminOnly } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/overview", adminOnly, getAdminOverview);

export default router;

