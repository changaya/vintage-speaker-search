import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure multer for memory storage (we'll process with Sharp)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

/**
 * Process uploaded image with Sharp
 * Resize, optimize, and save to disk
 */
export const processImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname)}`;
    const filepath = path.join(imagesDir, filename);

    // Process image with Sharp
    await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toFile(filepath);

    // Add processed image info to request
    (req as any).processedImage = {
      filename,
      path: filepath,
      url: `/uploads/images/${filename}`,
    };

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process image',
    });
  }
};

/**
 * Process multiple uploaded images
 */
export const processImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return next();
  }

  try {
    const processedImages = [];

    for (const file of req.files) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      const filepath = path.join(imagesDir, filename);

      await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toFile(filepath);

      processedImages.push({
        filename,
        path: filepath,
        url: `/uploads/images/${filename}`,
      });
    }

    // Add processed images info to request
    (req as any).processedImages = processedImages;

    next();
  } catch (error) {
    console.error('Images processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process images',
    });
  }
};

/**
 * Delete image file
 */
export const deleteImage = (imageUrl: string): void => {
  if (!imageUrl) return;

  try {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    if (!filename) return;

    const filepath = path.join(imagesDir, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Delete image error:', error);
  }
};
