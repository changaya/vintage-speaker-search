import { Router } from 'express';
import {
  getAllTurntables,
  getTurntableById,
  createTurntable,
  updateTurntable,
  deleteTurntable,
} from '../controllers/turntables.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllTurntables);
router.get('/:id', getTurntableById);

// Protected routes (admin only)
router.post('/', authenticateToken, requireAdmin, createTurntable);
router.put('/:id', authenticateToken, requireAdmin, updateTurntable);
router.delete('/:id', authenticateToken, requireAdmin, deleteTurntable);

export default router;
