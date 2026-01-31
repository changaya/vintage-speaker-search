import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createTurntableSchema, updateTurntableSchema } from '@vintage-audio/shared';
import { filterHiddenFields, filterHiddenFieldsArray, filterDtoFields } from '../utils/field-filter.util';
import {
  handlePrismaError,
  sendValidationError,
  sendNotFound,
  sendSuccess,
  sendDeleteSuccess,
} from '../utils/error-response.util';

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
          select: { id: true, name: true, country: true },
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
    sendSuccess(res, filtered);
  } catch (error: any) {
    handlePrismaError(res, error, 'Turntable');
  }
};

/**
 * Get turntable by ID with full relations
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
                brand: { select: { id: true, name: true } },
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

    if (!turntable) {
      return sendNotFound(res, 'Turntable');
    }

    const filtered = filterHiddenFields('turntableBase', turntable);
    sendSuccess(res, filtered);
  } catch (error: any) {
    handlePrismaError(res, error, 'Turntable');
  }
};

/**
 * Create new turntable
 * POST /api/turntables
 *
 * Note: Custom implementation needed due to tonearmMounting nested create
 */
export const createTurntable = async (req: Request, res: Response) => {
  try {
    const validation = createTurntableSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error.errors);
    }

    const { tonearmMounting, ...turntableData } = validation.data;
    const filteredData = filterDtoFields('turntableBase', turntableData);

    const turntable = await prisma.turntableBase.create({
      data: {
        ...filteredData,
        tonearmMounting: tonearmMounting
          ? { create: tonearmMounting }
          : undefined,
      } as any,
      include: {
        brand: true,
        tonearmMounting: true,
      },
    });

    const filtered = filterHiddenFields('turntableBase', turntable);
    sendSuccess(res, filtered, 201);
  } catch (error: any) {
    handlePrismaError(res, error, 'Turntable');
  }
};

/**
 * Update turntable
 * PUT /api/turntables/:id
 *
 * Note: Custom implementation needed due to tonearmMounting upsert logic
 */
export const updateTurntable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updateTurntableSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error.errors);
    }

    // Check if turntable exists
    const existingTurntable = await prisma.turntableBase.findUnique({
      where: { id },
      include: { tonearmMounting: true },
    });

    if (!existingTurntable) {
      return sendNotFound(res, 'Turntable');
    }

    const { tonearmMounting, ...turntableData } = validation.data;
    const filteredData = filterDtoFields('turntableBase', turntableData);

    const turntable = await prisma.turntableBase.update({
      where: { id },
      data: {
        ...filteredData,
        tonearmMounting: tonearmMounting
          ? existingTurntable.tonearmMounting
            ? { update: tonearmMounting }
            : { create: tonearmMounting }
          : undefined,
      } as any,
      include: {
        brand: true,
        tonearmMounting: true,
      },
    });

    const filtered = filterHiddenFields('turntableBase', turntable);
    sendSuccess(res, filtered);
  } catch (error: any) {
    handlePrismaError(res, error, 'Turntable');
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

    sendDeleteSuccess(res, 'Turntable');
  } catch (error: any) {
    handlePrismaError(res, error, 'Turntable');
  }
};
