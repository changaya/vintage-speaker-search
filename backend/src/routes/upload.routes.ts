import { Router } from 'express';
import { uploadImage, uploadImages, downloadImageFromUrl } from '../controllers/upload.controller';
import { upload, processImage, processImages } from '../middleware/upload.middleware';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (admin only)
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
