import express from "express";
import {
  listAdminImages,
  upsertImageByKey,
  createImage,
} from "../controllers/appImageController.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", adminOnly, listAdminImages);
router.post("/", adminOnly, createImage);
router.put("/:key", adminOnly, upsertImageByKey);

export default router;
