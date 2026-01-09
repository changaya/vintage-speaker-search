import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createTonearmSchema, updateTonearmSchema } from '../schemas/tonearm.schema';
import {
  filterHiddenFields,
  filterHiddenFieldsArray,
  
  filterDtoFields,
} from '../utils/field-filter.util';


/**
 * Get all tonearms
 * GET /api/tonearms
 */
export const getAllTonearms = async (req: Request, res: Response) => {
  try {
    const tonearms = await prisma.tonearm.findMany({
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
            compatibleBases: true,
            compatibleCarts: true,
            productionPeriods: true,
            userSetups: true,
          },
        },
      },
    });

    const filtered = filterHiddenFieldsArray('tonearm', tonearms);
    res.json(filtered);
  } catch (error) {
    console.error('Get tonearms error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tonearms',
    });
  }
};

/**
 * Get tonearm by ID
 * GET /api/tonearms/:id
 */
export const getTonearmById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tonearm = await prisma.tonearm.findUnique({
      where: { id },
      include: {
        brand: true,
        compatibleBases: {
          include: {
            turntableBase: {
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
            turntableBase: {
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

    if (!tonearm) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tonearm not found',
      });
    }

    const filtered = filterHiddenFields('tonearm', tonearm);
    res.json(filtered);
  } catch (error) {
    console.error('Get tonearm error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tonearm',
    });
  }
};

/**
 * Create new tonearm
 * POST /api/tonearms
 */
export const createTonearm = async (req: Request, res: Response) => {
  try {
    const validation = createTonearmSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const filteredData = filterDtoFields('tonearm', validation.data);
    const tonearm = await prisma.tonearm.create({
      data: filteredData as any,
      include: {
        brand: true,
      },
    });

    const filtered = filterHiddenFields('tonearm', tonearm);
    res.status(201).json(filtered);
  } catch (error: any) {
    console.error('Create tonearm error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Tonearm with this brand and model name already exists',
      });
    }

    // Handle foreign key constraint violation
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid brand ID',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create tonearm',
    });
  }
};

/**
 * Update tonearm
 * PUT /api/tonearms/:id
 */
export const updateTonearm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updateTonearmSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const filteredData = filterDtoFields('tonearm', validation.data);
    const tonearm = await prisma.tonearm.update({
      where: { id },
      data: filteredData as any,
      include: {
        brand: true,
      },
    });

    const filtered = filterHiddenFields('tonearm', tonearm);
    res.json(filtered);
  } catch (error: any) {
    console.error('Update tonearm error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tonearm not found',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Tonearm with this brand and model name already exists',
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
      message: 'Failed to update tonearm',
    });
  }
};

/**
 * Delete tonearm
 * DELETE /api/tonearms/:id
 */
export const deleteTonearm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.tonearm.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Tonearm deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete tonearm error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tonearm not found',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete tonearm',
    });
  }
};
