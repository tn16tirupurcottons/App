import express from "express";
import {
  uploadSingle,
  uploadMultiple,
  uploadSingleMiddleware,
  uploadMultipleMiddleware
} from '../controllers/uploadController.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Single image upload
router.post("/single", adminOnly, uploadSingleMiddleware, uploadSingle);
// Compatibility alias for uploads that post to /api/upload
router.post("/", adminOnly, uploadSingleMiddleware, uploadSingle);

// Multiple images upload
router.post("/multiple", adminOnly, uploadMultipleMiddleware, uploadMultiple);

export default router;
