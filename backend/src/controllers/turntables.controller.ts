import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createTurntableSchema, updateTurntableSchema } from '../schemas/turntable.schema';
import {
  filterHiddenFields,
  filterHiddenFieldsArray,

  filterDtoFields,
} from '../utils/field-filter.util';

const isDevelopment = process.env.NODE_ENV === 'development';


/**
 * Get all turntables
 * GET /api/turntables
 */
export const getAllTurntables = async (req: Request, res: Response) => {
  try {
    const turntables = await prisma.turntableBase.findMany({
      orderBy: [{ brand: { name: 'asc' } }, { modelName: 'asc' }],
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
        tonearmMounting: true,
        _count: {
          select: {
            compatibleTonearms: true,
            productionPeriods: true,
            userSetups: true,
          },
        },
      },
    });

    const filtered = filterHiddenFieldsArray('turntableBase', turntables);
    res.json(filtered);
  } catch (error) {
    console.error('Get turntables error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch turntables',
    });
  }
};

/**
 * Get turntable by ID
 * GET /api/turntables/:id
 */
export const getTurntableById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const turntable = await prisma.turntableBase.findUnique({
      where: { id },
      include: {
        brand: true,
        tonearmMounting: true,
        compatibleTonearms: {
          include: {
            tonearm: {
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
        },
        productionPeriods: {
          orderBy: { startYear: 'asc' },
        },
        userSetups: {
          include: {
            tonearm: {
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
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!turntable) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Turntable not found',
      });
    }

    const filtered = filterHiddenFields('turntableBase', turntable);
    res.json(filtered);
  } catch (error) {
    console.error('Get turntable error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch turntable',
    });
  }
};

/**
 * Create new turntable
 * POST /api/turntables
 */
export const createTurntable = async (req: Request, res: Response) => {
  try {
    const validation = createTurntableSchema.safeParse(req.body);
    if (!validation.success) {
      console.error('Turntable Validation Error:', {
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

    const { tonearmMounting, ...turntableData } = validation.data;
    const filteredData = filterDtoFields('turntableBase', turntableData);

    const turntable = await prisma.turntableBase.create({
      data: {
        ...filteredData,
        tonearmMounting: tonearmMounting
          ? {
              create: tonearmMounting,
            }
          : undefined,
      },
      include: {
        brand: true,
        tonearmMounting: true,
      },
    });

    const filtered = filterHiddenFields('turntableBase', turntable);
    res.status(201).json(filtered);
  } catch (error: any) {
    console.error('Create turntable error:', {
      message: error.message,
      code: error.code,
      stack: isDevelopment ? error.stack : undefined,
    });

    // Handle unique constraint violation (Prisma P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Turntable with this brand and model already exists',
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
          ? `Failed to create turntable: ${error.message}`
          : 'Failed to create turntable',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * Update turntable
 * PUT /api/turntables/:id
 */
export const updateTurntable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updateTurntableSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const { tonearmMounting, ...turntableData } = validation.data;
    const filteredData = filterDtoFields('turntableBase', turntableData);

    // Check if turntable exists
    const existingTurntable = await prisma.turntableBase.findUnique({
      where: { id },
      include: { tonearmMounting: true },
    });

    if (!existingTurntable) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Turntable not found',
      });
    }

    const turntable = await prisma.turntableBase.update({
      where: { id },
      data: {
        ...filteredData,
        tonearmMounting: tonearmMounting
          ? existingTurntable.tonearmMounting
            ? {
                update: tonearmMounting,
              }
            : {
                create: tonearmMounting,
              }
          : undefined,
      },
      include: {
        brand: true,
        tonearmMounting: true,
      },
    });

    const filtered = filterHiddenFields('turntableBase', turntable);
    res.json(filtered);
  } catch (error: any) {
    console.error('Update turntable error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Turntable not found',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Turntable with this brand and model name already exists',
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
      message: 'Failed to update turntable',
    });
  }
};

/**
 * Delete turntable
 * DELETE /api/turntables/:id
 */
export const deleteTurntable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.turntableBase.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Turntable deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete turntable error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Turntable not found',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete turntable',
    });
  }
};
