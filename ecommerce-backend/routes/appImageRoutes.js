import express from "express";
import { listPublicImages, getImageByKey } from "../controllers/appImageController.js";

const router = express.Router();

router.get("/", listPublicImages);
router.get("/:key", getImageByKey);

export default router;
