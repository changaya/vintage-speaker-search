import { Router } from 'express';
import {
  getComponentImages,
  addComponentImage,
  updateComponentImage,
  reorderComponentImages,
  deleteComponentImage,
  bulkUpsertComponentImages,
} from '../controllers/component-images.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public route - get images for a component
router.get('/:componentType/:componentId', getComponentImages);

// Protected routes (admin only)
// IMPORTANT: Specific routes must come before generic routes
// /:componentType/:componentId/reorder is more specific than /:componentType/:componentId
router.put('/:componentType/:componentId/reorder', authenticateToken, requireAdmin, reorderComponentImages);

// Bulk upsert images for a component (must be after /reorder route)
router.put('/:componentType/:componentId', authenticateToken, requireAdmin, bulkUpsertComponentImages);

router.post('/:componentType/:componentId', authenticateToken, requireAdmin, addComponentImage);
router.put('/:id', authenticateToken, requireAdmin, updateComponentImage);
router.delete('/:id', authenticateToken, requireAdmin, deleteComponentImage);

export default router;
