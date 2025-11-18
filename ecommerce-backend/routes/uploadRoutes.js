// ecommerce-backend/routes/uploadRoutes.js
import express from "express";
import upload from "../middlewares/multerMiddleware.js";
import cloudinary from "../utils/cloudinary.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Single file upload
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, and WebP are allowed." });
    }

    // Validate file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File size exceeds 5MB limit." });
    }

    // Stream buffer to cloudinary
    const streamifier = (await import("streamifier")).default;
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: "tn16_products",
        transformation: [
          { width: 1200, height: 1200, crop: "limit", quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Upload error", error: error.message });
        }
        res.json({ url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Multiple files upload
router.post("/multiple", protect, admin, upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const results = [];
    const errors = [];

    for (const file of req.files) {
      if (!allowedTypes.includes(file.mimetype)) {
        errors.push({ filename: file.originalname, error: "Invalid file type" });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push({ filename: file.originalname, error: "File size exceeds 5MB" });
        continue;
      }

      try {
        const streamifier = (await import("streamifier")).default;
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "tn16_products",
              transformation: [
                { width: 1200, height: 1200, crop: "limit", quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        results.push({ url: result.secure_url, public_id: result.public_id });
      } catch (err) {
        errors.push({ filename: file.originalname, error: err.message });
      }
    }

    res.json({
      success: true,
      uploaded: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Multiple upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default router;
