import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import {
  handlePrismaError,
  sendNotFound,
  sendSuccess,
  sendError,
} from '../utils/error-response.util';
import path from 'path';
import fs from 'fs';

/**
 * Search documents
 * GET /api/docs/search
 *
 * Query params:
 * - q: search term (searches textContent and ProductTag.productName)
 * - brand: "altec" | "jbl"
 * - category: document category filter
 * - page: page number (default: 1)
 * - limit: items per page (default: 20)
 */
export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const {
      q,
      brand,
      category,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.DocumentWhereInput = {};

    if (brand && typeof brand === 'string') {
      where.brand = brand.toLowerCase();
    }

    if (category && typeof category === 'string') {
      where.category = category.toLowerCase();
    }

    // Text search - search in textContent or product names
    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { textContent: { contains: searchTerm } },
        {
          products: {
            some: {
              product: {
                productName: { contains: searchTerm },
              },
            },
          },
        },
      ];
    }

    // Execute query with count
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { brand: 'asc' },
          { category: 'asc' },
          { year: 'asc' },
        ],
        select: {
          id: true,
          brand: true,
          category: true,
          subCategory: true,
          year: true,
          filePath: true,
          createdAt: true,
          products: {
            select: {
              product: {
                select: {
                  id: true,
                  productName: true,
                  productType: true,
                },
              },
              confidence: true,
              mentions: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    // Transform products array
    const transformedDocuments = documents.map((doc) => ({
      ...doc,
      products: doc.products.map((p) => ({
        id: p.product.id,
        productName: p.product.productName,
        productType: p.product.productType,
        confidence: p.confidence,
        mentions: p.mentions,
      })),
    }));

    sendSuccess(res, {
      data: transformedDocuments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    handlePrismaError(res, error, 'Document');
  }
};

/**
 * Get document by ID with full details
 * GET /api/docs/:id
 */
export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const documentId = parseInt(id, 10);

    if (isNaN(documentId)) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid document ID');
      return;
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!document) {
      sendNotFound(res, 'Document');
      return;
    }

    // Transform response
    const response = {
      ...document,
      products: document.products.map((p) => ({
        id: p.product.id,
        productName: p.product.productName,
        productType: p.product.productType,
        description: p.product.description,
        confidence: p.confidence,
        mentions: p.mentions,
      })),
    };

    sendSuccess(res, response);
  } catch (error: any) {
    handlePrismaError(res, error, 'Document');
  }
};

/**
 * Serve document image
 * GET /api/docs/:id/image
 *
 * Returns the original image file for the document
 */
export const getDocumentImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const documentId = parseInt(id, 10);

    if (isNaN(documentId)) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid document ID');
      return;
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { filePath: true, brand: true },
    });

    if (!document) {
      sendNotFound(res, 'Document');
      return;
    }

    // filePath is already the full path inside Docker container
    // e.g., "/app/altec-library/altec-catalogs/images/1945-duplex/page11.jpg"
    // We need to convert from extracted_text path to actual image path
    let imagePath = document.filePath;

    // If filePath contains 'extracted_text', convert to actual image path
    if (imagePath.includes('/extracted_text/')) {
      imagePath = imagePath.replace('/extracted_text/', '/');
    }

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      sendError(res, 404, 'NOT_FOUND', 'Image file not found');
      return;
    }

    // Determine content type based on extension
    const ext = path.extname(imagePath).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }

    // Set headers and send file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.sendFile(imagePath);
  } catch (error: any) {
    handlePrismaError(res, error, 'Document');
  }
};

/**
 * Get product tags list (for autocomplete)
 * GET /api/products/tags
 *
 * Query params:
 * - brand: "altec" | "jbl"
 * - search: partial match for autocomplete
 * - limit: max results (default: 50)
 */
export const getProductTags = async (req: Request, res: Response) => {
  try {
    const { brand, search, limit = '50' } = req.query;

    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));

    // Build where clause
    const where: Prisma.ProductTagWhereInput = {};

    if (brand && typeof brand === 'string') {
      where.brand = brand.toLowerCase();
    }

    if (search && typeof search === 'string' && search.trim()) {
      where.productName = { contains: search.trim() };
    }

    const products = await prisma.productTag.findMany({
      where,
      take: limitNum,
      orderBy: { productName: 'asc' },
      select: {
        id: true,
        brand: true,
        productName: true,
        productType: true,
        description: true,
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    // Transform response
    const response = products.map((p) => ({
      id: p.id,
      brand: p.brand,
      productName: p.productName,
      productType: p.productType,
      description: p.description,
      documentCount: p._count.documents,
    }));

    sendSuccess(res, response);
  } catch (error: any) {
    handlePrismaError(res, error, 'ProductTag');
  }
};

/**
 * Get product tag by ID with related documents
 * GET /api/products/tags/:id
 */
export const getProductTagById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid product ID');
      return;
    }

    const product = await prisma.productTag.findUnique({
      where: { id: productId },
      include: {
        documents: {
          include: {
            document: {
              select: {
                id: true,
                brand: true,
                category: true,
                subCategory: true,
                year: true,
                filePath: true,
              },
            },
          },
          orderBy: { mentions: 'desc' },
        },
      },
    });

    if (!product) {
      sendNotFound(res, 'ProductTag');
      return;
    }

    // Transform response
    const response = {
      id: product.id,
      brand: product.brand,
      productName: product.productName,
      productType: product.productType,
      description: product.description,
      createdAt: product.createdAt,
      documents: product.documents.map((d) => ({
        ...d.document,
        confidence: d.confidence,
        mentions: d.mentions,
      })),
    };

    sendSuccess(res, response);
  } catch (error: any) {
    handlePrismaError(res, error, 'ProductTag');
  }
};

/**
 * Trigger document indexing (Admin only)
 * POST /api/docs/index
 *
 * This endpoint triggers re-indexing of documents from the filesystem
 * Note: Actual indexing logic should be implemented separately
 */
export const indexDocuments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { indexAllDocuments } = await import('../services/indexing.service');
    const stats = await indexAllDocuments();

    sendSuccess(res, {
      message: 'Document indexing completed',
      status: 'completed',
      stats,
    });
  } catch (error: any) {
    handlePrismaError(res, error, 'Document');
  }
};
