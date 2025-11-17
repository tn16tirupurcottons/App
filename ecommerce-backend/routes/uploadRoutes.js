// ecommerce-backend/routes/uploadRoutes.js
import express from "express";
import upload from "../middlewares/multerMiddleware.js";
import cloudinary from "../utils/cloudinary.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/authMiddleware.js"; // or your adminOnly

const router = express.Router();

// single file upload field name: "image"
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // stream buffer to cloudinary
    const streamifier = (await import("streamifier")).default;
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tn16_products" },
      (error, result) => {
        if (error) return res.status(500).json({ message: "Upload error", error });
        res.json({ url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default router;
