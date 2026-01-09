import { Router } from 'express';
import { login, logout, getCurrentUser } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

export default router;
