import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createSutSchema, updateSutSchema } from '@vintage-audio/shared';
import { createCrudController } from '../utils/crud-controller.factory';
import { filterHiddenFields } from '../utils/field-filter.util';
import { handlePrismaError, sendNotFound, sendSuccess } from '../utils/error-response.util';

// Base CRUD operations using factory
const baseCrud = createCrudController({
  modelName: 'SUT',
  fieldVisibilityKey: 'sut',
  prismaModel: prisma.sUT,
  createSchema: createSutSchema,
  updateSchema: updateSutSchema,
  orderBy: [{ brand: { name: 'asc' } }, { modelName: 'asc' }],
  getAllIncludes: {
    brand: {
      select: { id: true, name: true, country: true },
    },
    _count: {
      select: {
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
export const getAllSuts = baseCrud.getAll;
export const createSut = baseCrud.create;
export const updateSut = baseCrud.update;
export const deleteSut = baseCrud.delete;

/**
 * Get SUT by ID with full relations
 * Custom implementation due to complex includes
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
            cartridge: {
              select: {
                id: true,
                modelName: true,
                brand: { select: { name: true } },
              },
            },
            phonoPreamp: {
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

    if (!sut) {
      return sendNotFound(res, 'SUT');
    }

    const filtered = filterHiddenFields('sut', sut);
    sendSuccess(res, filtered);
  } catch (error: any) {
    handlePrismaError(res, error, 'SUT');
  }
};
