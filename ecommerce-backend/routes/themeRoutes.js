import express from "express";
import { getPublicBrandSettings } from "../controllers/admin/brandController.js";

const router = express.Router();

router.get("/active", getPublicBrandSettings);

export default router;

