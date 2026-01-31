import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createTonearmSchema, updateTonearmSchema } from '@vintage-audio/shared';
import { createCrudController } from '../utils/crud-controller.factory';
import { filterHiddenFields } from '../utils/field-filter.util';
import { handlePrismaError, sendNotFound, sendSuccess } from '../utils/error-response.util';

// Base CRUD operations using factory
const baseCrud = createCrudController({
  modelName: 'Tonearm',
  fieldVisibilityKey: 'tonearm',
  prismaModel: prisma.tonearm,
  createSchema: createTonearmSchema,
  updateSchema: updateTonearmSchema,
  orderBy: [{ brand: { name: 'asc' } }, { modelName: 'asc' }],
  getAllIncludes: {
    brand: {
      select: { id: true, name: true, country: true },
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
  getByIdIncludes: {
    brand: true,
  },
});

// Export base methods
export const getAllTonearms = baseCrud.getAll;
export const createTonearm = baseCrud.create;
export const updateTonearm = baseCrud.update;
export const deleteTonearm = baseCrud.delete;

/**
 * Get tonearm by ID with full relations
 * Custom implementation due to complex includes
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
                brand: { select: { id: true, name: true } },
              },
            },
          },
        },
        compatibleCarts: {
          include: {
            cartridge: {
              include: {
                brand: { select: { id: true, name: true } },
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
                brand: { select: { name: true } },
              },
            },
            cartridge: {
              select: {
                id: true,
                modelName: true,
                brand: { select: { name: true } },
              },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tonearm) {
      return sendNotFound(res, 'Tonearm');
    }

    const filtered = filterHiddenFields('tonearm', tonearm);
    sendSuccess(res, filtered);
  } catch (error: any) {
    handlePrismaError(res, error, 'Tonearm');
  }
};
