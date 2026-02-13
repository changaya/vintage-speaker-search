import { Router } from 'express';
import {
  searchDocuments,
  getDocumentById,
  getDocumentImage,
  indexDocuments,
} from '../controllers/docs.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// ============================================================================
// Document Routes
// ============================================================================

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// to avoid Express matching "search" or "index" as :id

// POST /api/docs/index - Trigger document indexing (Admin only)
router.post('/index', authenticateToken, requireAdmin, indexDocuments);

// GET /api/docs/search - Search documents
router.get('/search', searchDocuments);

// GET /api/docs/:id - Get document by ID
router.get('/:id', getDocumentById);

// GET /api/docs/:id/image - Serve document image
router.get('/:id/image', getDocumentImage);

export default router;
