import { Router } from 'express';
import {
  getAllCartridges,
  getCartridgeById,
  createCartridge,
  updateCartridge,
  deleteCartridge,
} from '../controllers/cartridges.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllCartridges);
router.get('/:id', getCartridgeById);

// Protected routes (admin only)
router.post('/', authenticateToken, requireAdmin, createCartridge);
router.put('/:id', authenticateToken, requireAdmin, updateCartridge);
router.delete('/:id', authenticateToken, requireAdmin, deleteCartridge);

export default router;
