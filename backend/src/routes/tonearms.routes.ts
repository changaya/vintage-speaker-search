import { Router } from 'express';
import {
  getAllTonearms,
  getTonearmById,
  createTonearm,
  updateTonearm,
  deleteTonearm,
} from '../controllers/tonearms.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllTonearms);
router.get('/:id', getTonearmById);

// Protected routes (admin only)
router.post('/', authenticateToken, requireAdmin, createTonearm);
router.put('/:id', authenticateToken, requireAdmin, updateTonearm);
router.delete('/:id', authenticateToken, requireAdmin, deleteTonearm);

export default router;
