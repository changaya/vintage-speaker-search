import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createSutSchema, updateSutSchema } from '../schemas/sut.schema';
import {
  filterHiddenFields,
  filterHiddenFieldsArray,
  filterDtoFields,
} from '../utils/field-filter.util';

const isDevelopment = process.env.NODE_ENV === 'development';


/**
 * Get all SUTs
 * GET /api/suts
 */
export const getAllSuts = async (req: Request, res: Response) => {
  try {
    const suts = await prisma.sUT.findMany({
      orderBy: [{ brand: { name: 'asc' } }, { modelName: 'asc' }],
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
        _count: {
          select: {
            compatibleCarts: true,
            productionPeriods: true,
            userSetups: true,
          },
        },
      },
    });

    const filtered = filterHiddenFieldsArray('sut', suts);
    res.json(filtered);
  } catch (error) {
    console.error('Get SUTs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch SUTs',
    });
  }
};

/**
 * Get SUT by ID
 * GET /api/suts/:id
 */
export const getSutById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sut = await prisma.sUT.findUnique({
      where: { id },
      include: {
        brand: true,
        compatibleCarts: {
          include: {
            cartridge: {
              include: {
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { compatibilityScore: 'desc' },
        },
        productionPeriods: {
          orderBy: { startYear: 'asc' },
        },
        userSetups: {
          include: {
            cartridge: {
              select: {
                id: true,
                modelName: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            phonoPreamp: {
              select: {
                id: true,
                modelName: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sut) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'SUT not found',
      });
    }

    const filtered = filterHiddenFields('sut', sut);
    res.json(filtered);
  } catch (error) {
    console.error('Get SUT error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch SUT',
    });
  }
};

/**
 * Create new SUT
 * POST /api/suts
 */
export const createSut = async (req: Request, res: Response) => {
  try {
    const validation = createSutSchema.safeParse(req.body);
    if (!validation.success) {
      console.error('SUT Validation Error:', {
        errors: validation.error.errors,
        receivedData: req.body,
      });

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.error.errors,
        },
      });
    }

    const filteredData = filterDtoFields('sut', validation.data);
    const sut = await prisma.sUT.create({
      data: filteredData as any,
      include: {
        brand: true,
      },
    });

    const filtered = filterHiddenFields('sut', sut);
    res.status(201).json(filtered);
  } catch (error: any) {
    console.error('Create SUT error:', {
      message: error.message,
      code: error.code,
      stack: isDevelopment ? error.stack : undefined,
    });

    // Handle unique constraint violation (Prisma P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'SUT with this brand and model already exists',
          code: 'DUPLICATE_ENTRY',
        },
      });
    }

    // Handle foreign key constraint violation (Prisma P2003)
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid brand ID',
          code: 'INVALID_REFERENCE',
        },
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: {
        message: isDevelopment
          ? `Failed to create SUT: ${error.message}`
          : 'Failed to create SUT',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * Update SUT
 * PUT /api/suts/:id
 */
export const updateSut = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updateSutSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const filteredData = filterDtoFields('sut', validation.data);
    const sut = await prisma.sUT.update({
      where: { id },
      data: filteredData as any,
      include: {
        brand: true,
      },
    });

    const filtered = filterHiddenFields('sut', sut);
    res.json(filtered);
  } catch (error: any) {
    console.error('Update SUT error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'SUT not found',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'SUT with this brand and model name already exists',
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid brand ID',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update SUT',
    });
  }
};

/**
 * Delete SUT
 * DELETE /api/suts/:id
 */
export const deleteSut = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.sUT.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'SUT deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete SUT error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'SUT not found',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete SUT',
    });
  }
};
