/**
 * Matcher Routes
 * API endpoints for component matching calculations
 */

import { Router } from 'express';
import { calculateComponentMatching } from '../controllers/matcher.controller';

const router = Router();

// POST /api/matcher/calculate
router.post('/calculate', calculateComponentMatching);

export default router;
