import express from "express";
import {
  getBrandSettings,
  saveBrandSettings,
} from "../../controllers/admin/brandController.js";
import { adminOnly } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/brand", adminOnly, getBrandSettings);
router.post("/brand", adminOnly, saveBrandSettings);

export default router;

