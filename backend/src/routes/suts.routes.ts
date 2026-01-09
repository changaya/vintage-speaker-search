import { Router } from 'express';
import {
  getAllSuts,
  getSutById,
  createSut,
  updateSut,
  deleteSut,
} from '../controllers/suts.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllSuts);
router.get('/:id', getSutById);

// Protected routes (admin only)
router.post('/', authenticateToken, requireAdmin, createSut);
router.put('/:id', authenticateToken, requireAdmin, updateSut);
router.delete('/:id', authenticateToken, requireAdmin, deleteSut);

export default router;
