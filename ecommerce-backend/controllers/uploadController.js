import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoryImages = {
  men: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80',
  women: 'https://images.unsplash.com/photo-1520974735194-1aa2c6faf9ad?auto=format&fit=crop&w=900&q=80',
  kids: 'https://images.unsplash.com/photo-1521336525930-8e8abf541a33?auto=format&fit=crop&w=900&q=80',
  footwear: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
  dresses: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
  ethnic: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
};

const normalizeCategory = (value) => (value || '').toString().toLowerCase().trim();

const inferCategoryFromFilename = (filename = '') => {
  const value = filename.toLowerCase();
  if (/\b(dress|gown|skirt|blouse|sari|lehenga|kurti|ethnic)\b/.test(value)) return 'women';
  if (/\b(man|men|male|mens|boy|boys)\b/.test(value)) return 'men';
  if (/\b(kid|kids|boy|girl|children|toddler)\b/.test(value)) return 'kids';
  if (/\b(shoe|footwear|sneaker|boot|sandals|heels)\b/.test(value)) return 'footwear';
  if (/\b(ethnic|sari|lehenga|kurti|salwar|anarkali)\b/.test(value)) return 'ethnic';
  if (/\b(women|female|ladies)\b/.test(value)) return 'women';
  return 'unknown';
};

const isCategoryMatch = (selected, inferred) => {
  if (!selected || selected === 'all') return true;
  if (!inferred || inferred === 'unknown') return true;
  if (selected === inferred) return true;
  if (selected === 'dresses' && inferred === 'women') return true;
  if (selected === 'women' && inferred === 'dresses') return true;
  if (selected === 'footwear' && inferred === 'men') return false;
  return false;
};

// Multer configuration for upload file handling
const storage = multer.memoryStorage();
const allowedTypes = /jpeg|jpg|png|webp|gif/;
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();
  if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only jpg, jpeg, png, webp, gif are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

const downloadImageBuffer = (url) =>
  new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download fallback image (status: ${res.statusCode})`));
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });

const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}.webp`;
};

const processImage = async (buffer) =>
  sharp(buffer)
    .resize(800, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

const storeImageBuffer = async (buffer, originalName) => {
  const uploadsDir = ensureUploadsDir();
  const filename = generateUniqueFilename(originalName);
  const filepath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filepath, buffer);
  return `/uploads/${filename}`;
};

const handleCategoryGuess = (originalName, selectedCategory) => {
  const inferred = inferCategoryFromFilename(originalName);
  const selected = normalizeCategory(selectedCategory);
  const match = isCategoryMatch(selected, inferred);

  return {
    inferredCategory: inferred,
    selectedCategory: selected || 'unknown',
    categoryMatch: match,
    fallbackUrl: categoryImages[selected] || categoryImages[inferred] || Object.values(categoryImages)[0],
  };
};

export const uploadSingle = async (req, res) => {
  try {
    // VALIDATION: File exists
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // VALIDATION: File size (50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      return res.status(413).json({ 
        success: false, 
        message: `Image too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB` 
      });
    }

    const selectedCategory = normalizeCategory(req.body?.category);
    const categoryInfo = handleCategoryGuess(req.file.originalname, selectedCategory);

    let buffer = req.file.buffer;
    let replacedWithFallback = false;

    if (!categoryInfo.categoryMatch && categoryInfo.fallbackUrl) {
      try {
        const fallbackBuffer = await downloadImageBuffer(categoryInfo.fallbackUrl);
        buffer = fallbackBuffer;
        replacedWithFallback = true;
      } catch (fallbackErr) {
        console.warn('Fallback download failed, using original image:', fallbackErr.message);
      }
    }

    const processedBuffer = await processImage(buffer);
    const imageUrl = await storeImageBuffer(processedBuffer, req.file.originalname);

    res.json({
      success: true,
      message: replacedWithFallback
        ? 'Image uploaded (category fallback applied due to mismatch)'
        : 'Image uploaded successfully',
      data: {
        url: imageUrl,
        filename: path.basename(imageUrl),
        originalName: req.file.originalname,
        selectedCategory: categoryInfo.selectedCategory,
        inferredCategory: categoryInfo.inferredCategory,
        categoryMatch: categoryInfo.categoryMatch,
        replacedWithFallback,
      },
    });
  } catch (error) {
    console.error('Upload single error:', error);
    const status = error.message?.includes('File too large') ? 413 : 500;
    res.status(status).json({ 
      success: false, 
      message: error.message || 'Failed to upload image',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

export const uploadMultiple = async (req, res) => {
  try {
    // VALIDATION: Files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided' });
    }

    // VALIDATION: File count limit
    const MAX_FILES = 20;
    if (req.files.length > MAX_FILES) {
      return res.status(400).json({ 
        success: false, 
        message: `Maximum ${MAX_FILES} files allowed per upload` 
      });
    }

    // VALIDATION: File sizes
    const MAX_SIZE = 50 * 1024 * 1024;
    for (const file of req.files) {
      if (file.size > MAX_SIZE) {
        return res.status(413).json({ 
          success: false, 
          message: `File '${file.originalname}' exceeds ${MAX_SIZE / 1024 / 1024}MB limit` 
        });
      }
    }

    const selectedCategory = normalizeCategory(req.body?.category);
    const results = [];

    for (const file of req.files) {
      const fileInfo = {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      };
      try {
        const categoryInfo = handleCategoryGuess(file.originalname, selectedCategory);
        let buffer = file.buffer;
        let replacedWithFallback = false;

        if (!categoryInfo.categoryMatch) {
          try {
            buffer = await downloadImageBuffer(categoryInfo.fallbackUrl);
            replacedWithFallback = true;
          } catch (fallbackErr) {
            console.warn('Fallback download failed for', file.originalname, fallbackErr.message);
          }
        }

        const processedBuffer = await processImage(buffer);
        const imageUrl = await storeImageBuffer(processedBuffer, file.originalname);

        results.push({
          ...fileInfo,
          url: imageUrl,
          selectedCategory: categoryInfo.selectedCategory,
          inferredCategory: categoryInfo.inferredCategory,
          categoryMatch: categoryInfo.categoryMatch,
          replacedWithFallback,
        });
      } catch (fileError) {
        console.error('Error processing', file.originalname, fileError);
        results.push({ originalName: file.originalname, error: fileError?.message || 'Unknown error' });
      }
    }

    res.json({
      success: true,
      message: `${results.filter((r) => !r.error).length} images uploaded successfully`,
      data: results,
    });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload images', error: error.message });
  }
};

export const uploadSingleMiddleware = upload.single('image');
export const uploadMultipleMiddleware = upload.array('images', 20);
