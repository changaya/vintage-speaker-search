import multer from 'multer';
import AdmZip from 'adm-zip';
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

// Valid image extensions
const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_IMAGES_FROM_ZIP = 10;

// Configure multer for ZIP file uploads
const zipStorage = multer.memoryStorage();

const zipFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept ZIP files only
  const isZip = file.mimetype === 'application/zip' ||
                file.mimetype === 'application/x-zip-compressed' ||
                file.originalname.toLowerCase().endsWith('.zip');

  if (!isZip) {
    return cb(new Error('Only ZIP files are allowed'));
  }
  cb(null, true);
};

export const uploadZip = multer({
  storage: zipStorage,
  fileFilter: zipFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max ZIP file size
  },
});

/**
 * Check if a ZIP entry is a valid image file
 * Filters out hidden files, system files, and non-image files
 */
const isValidImageEntry = (entryName: string): boolean => {
  // Get the filename from the path
  const filename = path.basename(entryName);

  // Skip directories
  if (entryName.endsWith('/')) {
    return false;
  }

  // Skip hidden files (starting with .)
  if (filename.startsWith('.')) {
    return false;
  }

  // Skip macOS metadata folder
  if (entryName.includes('__MACOSX')) {
    return false;
  }

  // Skip Windows system files
  if (filename === 'Thumbs.db' || filename === 'desktop.ini') {
    return false;
  }

  // Check for path traversal attempts
  if (entryName.includes('..')) {
    return false;
  }

  // Check file extension
  const ext = path.extname(filename).toLowerCase();
  return VALID_IMAGE_EXTENSIONS.includes(ext);
};

/**
 * Process ZIP file and extract images
 */
export const processZipImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No ZIP file provided',
    });
  }

  try {
    // Parse ZIP file
    let zip: AdmZip;
    try {
      zip = new AdmZip(req.file.buffer);
    } catch (error) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid or corrupted ZIP file',
      });
    }

    const zipEntries = zip.getEntries();

    // Filter valid image entries
    const imageEntries = zipEntries.filter(entry => isValidImageEntry(entry.entryName));

    if (imageEntries.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No valid image files found in ZIP. Supported formats: JPG, PNG, GIF, WebP',
      });
    }

    const totalFound = imageEntries.length;
    const entriesToProcess = imageEntries.slice(0, MAX_IMAGES_FROM_ZIP);
    const processedImages = [];

    // Process each image
    for (const entry of entriesToProcess) {
      try {
        const imageBuffer = entry.getData();
        const originalName = path.basename(entry.entryName);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
        const filepath = path.join(imagesDir, filename);

        // Process image with Sharp
        await sharp(imageBuffer)
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
          url: `/uploads/images/${filename}`,
          originalName,
        });
      } catch (error) {
        // Skip invalid images silently (corrupted or unsupported format)
        console.warn(`Skipping invalid image in ZIP: ${entry.entryName}`);
      }
    }

    if (processedImages.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to process any images from the ZIP file. Files may be corrupted or in unsupported format.',
      });
    }

    // Add processed images info to request
    (req as any).processedZipImages = processedImages;
    (req as any).zipImageStats = {
      totalFound,
      processed: processedImages.length,
      warning: totalFound > MAX_IMAGES_FROM_ZIP
        ? `ZIP contained ${totalFound} images. Only the first ${MAX_IMAGES_FROM_ZIP} were processed.`
        : undefined,
    };

    next();
  } catch (error) {
    console.error('ZIP processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process ZIP file',
    });
  }
};
