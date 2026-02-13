import request from 'supertest';

// Mock Prisma before importing app
jest.mock('../utils/prisma', () => ({
  prisma: {
    document: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    productTag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    documentProduct: {
      findMany: jest.fn(),
    },
  },
}));

import app from '../app';
import { prisma } from '../utils/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ============================================================================
// Test Data
// ============================================================================

const mockDocument = {
  id: 1,
  brand: 'altec',
  category: 'catalogs',
  subCategory: 'home-speakers',
  year: '1974',
  filePath: '/app/altec-library/altec-catalogs/images/1974-home/page01.jpg',
  textPath: '/app/altec-library/extracted_text/altec-catalogs/images/1974-home/page01.txt',
  textContent: 'Altec Lansing 604E Duplex Speaker',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  products: [
    {
      product: { id: 1, productName: '604E', productType: 'driver' },
      confidence: 1.0,
      mentions: 3,
    },
  ],
};

const mockProductTag = {
  id: 1,
  brand: 'altec',
  productName: '604E',
  productType: 'driver',
  description: 'Duplex coaxial speaker',
  createdAt: new Date('2026-01-01'),
  _count: { documents: 5 },
};

// ============================================================================
// GET /api/docs/search
// ============================================================================

describe('GET /api/docs/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with paginated results', async () => {
    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([mockDocument]);
    (mockPrisma.document.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/docs/search').expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it('should filter by brand (case-insensitive)', async () => {
    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.document.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/docs/search?brand=Altec').expect(200);

    const findManyCall = (mockPrisma.document.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyCall.where.brand).toBe('altec');
  });

  it('should filter by category (case-insensitive)', async () => {
    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.document.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/docs/search?category=Catalogs').expect(200);

    const findManyCall = (mockPrisma.document.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyCall.where.category).toBe('catalogs');
  });

  it('should search by query term in textContent and product names', async () => {
    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.document.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/docs/search?q=604').expect(200);

    const findManyCall = (mockPrisma.document.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyCall.where.OR).toEqual([
      { textContent: { contains: '604' } },
      {
        products: {
          some: { product: { productName: { contains: '604' } } },
        },
      },
    ]);
  });

  it('should enforce page limits (max 100)', async () => {
    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.document.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/docs/search?limit=999').expect(200);

    const findManyCall = (mockPrisma.document.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyCall.take).toBe(100);
  });

  it('should return empty results when no documents match', async () => {
    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.document.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/docs/search?q=nonexistent').expect(200);

    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });
});

// ============================================================================
// GET /api/docs/:id
// ============================================================================

describe('GET /api/docs/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with document details', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue(mockDocument);

    const res = await request(app).get('/api/docs/1').expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.brand).toBe('altec');
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].productName).toBe('604E');
  });

  it('should return 404 for non-existent document', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/docs/9999').expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid document ID', async () => {
    const res = await request(app).get('/api/docs/abc').expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ============================================================================
// GET /api/docs/:id/image
// ============================================================================

describe('GET /api/docs/:id/image', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 for non-existent document', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue(null);

    await request(app).get('/api/docs/9999/image').expect(404);
  });

  it('should return 400 for invalid document ID', async () => {
    const res = await request(app).get('/api/docs/abc/image').expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when image file does not exist', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({
      filePath: '/nonexistent/path/image.jpg',
      brand: 'altec',
    });

    const res = await request(app).get('/api/docs/1/image').expect(404);

    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ============================================================================
// GET /api/products/tags
// ============================================================================

describe('GET /api/products/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with product tags list', async () => {
    (mockPrisma.productTag.findMany as jest.Mock).mockResolvedValue([mockProductTag]);

    const res = await request(app).get('/api/products/tags').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].productName).toBe('604E');
    expect(res.body[0].documentCount).toBe(5);
  });

  it('should filter by brand (case-insensitive)', async () => {
    (mockPrisma.productTag.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/products/tags?brand=JBL').expect(200);

    const findManyCall = (mockPrisma.productTag.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyCall.where.brand).toBe('jbl');
  });

  it('should filter by search term', async () => {
    (mockPrisma.productTag.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/products/tags?search=604').expect(200);

    const findManyCall = (mockPrisma.productTag.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyCall.where.productName).toEqual({ contains: '604' });
  });

  it('should enforce limit (max 100)', async () => {
    (mockPrisma.productTag.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/products/tags?limit=999').expect(200);

    const findManyCall = (mockPrisma.productTag.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyCall.take).toBe(100);
  });
});

// ============================================================================
// GET /api/products/tags/:id
// ============================================================================

describe('GET /api/products/tags/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with product tag and related documents', async () => {
    const mockProductWithDocs = {
      ...mockProductTag,
      documents: [
        {
          document: {
            id: 1,
            brand: 'altec',
            category: 'catalogs',
            subCategory: null,
            year: '1974',
            filePath: '/path/to/image.jpg',
          },
          confidence: 1.0,
          mentions: 3,
        },
      ],
    };
    (mockPrisma.productTag.findUnique as jest.Mock).mockResolvedValue(mockProductWithDocs);

    const res = await request(app).get('/api/products/tags/1').expect(200);

    expect(res.body.productName).toBe('604E');
    expect(res.body.documents).toHaveLength(1);
  });

  it('should return 404 for non-existent product tag', async () => {
    (mockPrisma.productTag.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/products/tags/9999').expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid product tag ID', async () => {
    const res = await request(app).get('/api/products/tags/abc').expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ============================================================================
// Route Order Verification
// ============================================================================

describe('Route order verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/docs/search should NOT be caught by /:id route', async () => {
    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.document.count as jest.Mock).mockResolvedValue(0);

    // If route order is wrong, "search" would be treated as :id
    // and parseInt("search") would be NaN → 400 error
    const res = await request(app).get('/api/docs/search').expect(200);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/docs/:id/image should be reachable (not caught by /:id)', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue(null);

    // If route order is wrong, "1" would match /:id and "/image" would be ignored
    const res = await request(app).get('/api/docs/1/image').expect(404);
    // Should get NOT_FOUND from image handler, not document handler
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
