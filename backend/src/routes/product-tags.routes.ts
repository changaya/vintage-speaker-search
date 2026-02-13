import { Router } from 'express';
import {
  getProductTags,
  getProductTagById,
} from '../controllers/docs.controller';

const router = Router();

// ============================================================================
// Product Tag Routes (for document search/autocomplete)
// ============================================================================

// GET /api/products/tags - Get product tags list (for autocomplete)
router.get('/', getProductTags);

// GET /api/products/tags/:id - Get product tag by ID with related documents
router.get('/:id', getProductTagById);

export default router;
