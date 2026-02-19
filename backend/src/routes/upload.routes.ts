import { Router } from 'express';
import { uploadImage, uploadImages, uploadZipImages, downloadImageFromUrl } from '../controllers/upload.controller';
import { upload, processImage, processImages } from '../middleware/upload.middleware';
import { uploadZip, processZipImages } from '../middleware/zip.middleware';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (admin only)

// ZIP upload - must be before other routes to avoid conflicts
router.post(
  '/zip',
  authenticateToken,
  requireAdmin,
  uploadZip.single('zip'),
  processZipImages,
  uploadZipImages
);

router.post(
  '/image',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  processImage,
  uploadImage
);

router.post(
  '/images',
  authenticateToken,
  requireAdmin,
  upload.array('images', 10), // Max 10 images at once
  processImages,
  uploadImages
);

router.post(
  '/from-url',
  authenticateToken,
  requireAdmin,
  downloadImageFromUrl
);

export default router;
