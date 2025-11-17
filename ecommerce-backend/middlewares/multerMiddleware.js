// ecommerce-backend/middlewares/multerMiddleware.js
import multer from "multer";

// memory storage so we can stream to cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // max 5MB

export default upload;
