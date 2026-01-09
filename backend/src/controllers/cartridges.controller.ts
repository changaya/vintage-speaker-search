import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createCartridgeSchema, updateCartridgeSchema } from '../schemas/cartridge.schema';
import {
  filterHiddenFields,
  filterHiddenFieldsArray,
  
  filterDtoFields,
} from '../utils/field-filter.util';

/**
 * Get all cartridges
 * GET /api/cartridges
 */
export const getAllCartridges = async (req: Request, res: Response) => {
  try {
    const cartridges = await prisma.cartridge.findMany({
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
            compatibleTonearms: true,
            compatibleSUTs: true,
            compatiblePhonos: true,
            productionPeriods: true,
            userSetups: true,
          },
        },
      },
    });

    // Filter hidden fields from response
    const filtered = filterHiddenFieldsArray('cartridge', cartridges);
    res.json(filtered);
  } catch (error) {
    console.error('Get cartridges error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch cartridges',
    });
  }
};

/**
 * Get cartridge by ID
 * GET /api/cartridges/:id
 */
export const getCartridgeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cartridge = await prisma.cartridge.findUnique({
      where: { id },
      include: {
        brand: true,
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
          orderBy: { compatibilityScore: 'desc' },
        },
        compatibleSUTs: {
          include: {
            sut: {
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
        compatiblePhonos: {
          include: {
            phonoPreamp: {
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
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cartridge) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Cartridge not found',
      });
    }

    // Filter hidden fields from response
    const filtered = filterHiddenFields('cartridge', cartridge);
    res.json(filtered);
  } catch (error) {
    console.error('Get cartridge error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch cartridge',
    });
  }
};

/**
 * Create new cartridge
 * POST /api/cartridges
 */
export const createCartridge = async (req: Request, res: Response) => {
  try {
    const validation = createCartridgeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    // Filter DTO to only include visible fields
    const filteredData = filterDtoFields('cartridge', validation.data);

    const cartridge = await prisma.cartridge.create({
      data: filteredData as any,
      include: {
        brand: true,
      },
    });

    // Filter hidden fields from response
    const filtered = filterHiddenFields('cartridge', cartridge);
    res.status(201).json(filtered);
  } catch (error: any) {
    console.error('Create cartridge error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Cartridge with this brand and model name already exists',
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
      message: 'Failed to create cartridge',
    });
  }
};

/**
 * Update cartridge
 * PUT /api/cartridges/:id
 */
export const updateCartridge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updateCartridgeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    // Filter DTO to only include visible fields
    const filteredData = filterDtoFields('cartridge', validation.data);

    const cartridge = await prisma.cartridge.update({
      where: { id },
      data: filteredData as any,
      include: {
        brand: true,
      },
    });

    // Filter hidden fields from response
    const filtered = filterHiddenFields('cartridge', cartridge);
    res.json(filtered);
  } catch (error: any) {
    console.error('Update cartridge error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Cartridge not found',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Cartridge with this brand and model name already exists',
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
      message: 'Failed to update cartridge',
    });
  }
};

/**
 * Delete cartridge
 * DELETE /api/cartridges/:id
 */
export const deleteCartridge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.cartridge.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Cartridge deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete cartridge error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Cartridge not found',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete cartridge',
    });
  }
};
