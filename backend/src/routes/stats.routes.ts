import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';

const router = Router();

// Public route
router.get('/', getStats);

export default router;
