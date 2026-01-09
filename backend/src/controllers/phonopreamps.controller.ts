import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createPhonoPreampSchema, updatePhonoPreampSchema } from '../schemas/phonopreamp.schema';

/**
 * Get all phono preamps
 * GET /api/phono-preamps
 */
export const getAllPhonoPreamps = async (req: Request, res: Response) => {
  try {
    const phonoPreamps = await prisma.phonoPreamp.findMany({
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

    res.json(phonoPreamps);
  } catch (error) {
    console.error('Get phono preamps error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch phono preamps',
    });
  }
};

/**
 * Get phono preamp by ID
 * GET /api/phono-preamps/:id
 */
export const getPhonoPreampById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const phonoPreamp = await prisma.phonoPreamp.findUnique({
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
            sut: {
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

    if (!phonoPreamp) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Phono preamp not found',
      });
    }

    res.json(phonoPreamp);
  } catch (error) {
    console.error('Get phono preamp error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch phono preamp',
    });
  }
};

/**
 * Create new phono preamp
 * POST /api/phono-preamps
 */
export const createPhonoPreamp = async (req: Request, res: Response) => {
  try {
    const validation = createPhonoPreampSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const phonoPreamp = await prisma.phonoPreamp.create({
      data: validation.data,
      include: {
        brand: true,
      },
    });

    res.status(201).json(phonoPreamp);
  } catch (error: any) {
    console.error('Create phono preamp error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Phono preamp with this brand and model name already exists',
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
      message: 'Failed to create phono preamp',
    });
  }
};

/**
 * Update phono preamp
 * PUT /api/phono-preamps/:id
 */
export const updatePhonoPreamp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updatePhonoPreampSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const phonoPreamp = await prisma.phonoPreamp.update({
      where: { id },
      data: validation.data,
      include: {
        brand: true,
      },
    });

    res.json(phonoPreamp);
  } catch (error: any) {
    console.error('Update phono preamp error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Phono preamp not found',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Phono preamp with this brand and model name already exists',
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
      message: 'Failed to update phono preamp',
    });
  }
};

/**
 * Delete phono preamp
 * DELETE /api/phono-preamps/:id
 */
export const deletePhonoPreamp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.phonoPreamp.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Phono preamp deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete phono preamp error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Phono preamp not found',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete phono preamp',
    });
  }
};
