import { Router } from 'express';
import {
  getAllPhonoPreamps,
  getPhonoPreampById,
  createPhonoPreamp,
  updatePhonoPreamp,
  deletePhonoPreamp,
} from '../controllers/phonopreamps.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllPhonoPreamps);
router.get('/:id', getPhonoPreampById);

// Protected routes (admin only)
router.post('/', authenticateToken, requireAdmin, createPhonoPreamp);
router.put('/:id', authenticateToken, requireAdmin, updatePhonoPreamp);
router.delete('/:id', authenticateToken, requireAdmin, deletePhonoPreamp);

export default router;
