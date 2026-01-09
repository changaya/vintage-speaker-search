import { Router } from 'express';
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brands.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllBrands);
router.get('/:id', getBrandById);

// Protected routes (admin only)
router.post('/', authenticateToken, requireAdmin, createBrand);
router.put('/:id', authenticateToken, requireAdmin, updateBrand);
router.delete('/:id', authenticateToken, requireAdmin, deleteBrand);

export default router;
