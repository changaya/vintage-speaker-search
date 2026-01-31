import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createCartridgeSchema, updateCartridgeSchema } from '@vintage-audio/shared';
import { createCrudController } from '../utils/crud-controller.factory';
import { filterHiddenFields } from '../utils/field-filter.util';
import { handlePrismaError, sendNotFound, sendSuccess } from '../utils/error-response.util';

// Base CRUD operations using factory
const baseCrud = createCrudController({
  modelName: 'Cartridge',
  fieldVisibilityKey: 'cartridge',
  prismaModel: prisma.cartridge,
  createSchema: createCartridgeSchema,
  updateSchema: updateCartridgeSchema,
  orderBy: [{ brand: { name: 'asc' } }, { modelName: 'asc' }],
  getAllIncludes: {
    brand: {
      select: { id: true, name: true, country: true },
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
  getByIdIncludes: {
    brand: true,
  },
});

// Export base methods
export const getAllCartridges = baseCrud.getAll;
export const createCartridge = baseCrud.create;
export const updateCartridge = baseCrud.update;
export const deleteCartridge = baseCrud.delete;

/**
 * Get cartridge by ID with full relations
 * Custom implementation due to complex includes
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
                brand: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { compatibilityScore: 'desc' },
        },
        compatibleSUTs: {
          include: {
            sut: {
              include: {
                brand: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { compatibilityScore: 'desc' },
        },
        compatiblePhonos: {
          include: {
            phonoPreamp: {
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
            tonearm: {
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

    if (!cartridge) {
      return sendNotFound(res, 'Cartridge');
    }

    const filtered = filterHiddenFields('cartridge', cartridge);
    sendSuccess(res, filtered);
  } catch (error: any) {
    handlePrismaError(res, error, 'Cartridge');
  }
};
