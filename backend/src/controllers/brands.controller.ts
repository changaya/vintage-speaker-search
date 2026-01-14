import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createBrandSchema, updateBrandSchema } from '@vintage-audio/shared';

/**
 * Get all brands
 * GET /api/brands
 */
export const getAllBrands = async (req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            turntableBases: true,
            tonearms: true,
            cartridges: true,
            suts: true,
            phonoPreamps: true,
          },
        },
      },
    });

    res.json(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch brands',
    });
  }
};

/**
 * Get brand by ID
 * GET /api/brands/:id
 */
export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        turntableBases: true,
        tonearms: true,
        cartridges: true,
        suts: true,
        phonoPreamps: true,
      },
    });

    if (!brand) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Brand not found',
      });
    }

    res.json(brand);
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch brand',
    });
  }
};

/**
 * Create new brand
 * POST /api/brands
 */
export const createBrand = async (req: Request, res: Response) => {
  try {
    const validation = createBrandSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const brand = await prisma.brand.create({
      data: validation.data,
    });

    res.status(201).json(brand);
  } catch (error: any) {
    console.error('Create brand error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Brand with this name already exists',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create brand',
    });
  }
};

/**
 * Update brand
 * PUT /api/brands/:id
 */
export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updateBrandSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: validation.data,
    });

    res.json(brand);
  } catch (error: any) {
    console.error('Update brand error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Brand not found',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Brand with this name already exists',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update brand',
    });
  }
};

/**
 * Delete brand
 * DELETE /api/brands/:id
 */
export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.brand.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete brand error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Brand not found',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete brand',
    });
  }
};
