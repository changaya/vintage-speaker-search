import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

const VALID_COMPONENT_TYPES = ['turntable', 'tonearm', 'cartridge', 'sut', 'phonopreamp'] as const;
type ComponentType = (typeof VALID_COMPONENT_TYPES)[number];
const MAX_IMAGES_PER_COMPONENT = 10;

/**
 * Validate component type
 */
const isValidComponentType = (type: string): type is ComponentType => {
  return VALID_COMPONENT_TYPES.includes(type as ComponentType);
};

/**
 * Check if component exists
 */
const componentExists = async (componentType: ComponentType, componentId: string): Promise<boolean> => {
  try {
    let result = null;
    switch (componentType) {
      case 'turntable':
        result = await prisma.turntableBase.findUnique({ where: { id: componentId } });
        break;
      case 'tonearm':
        result = await prisma.tonearm.findUnique({ where: { id: componentId } });
        break;
      case 'cartridge':
        result = await prisma.cartridge.findUnique({ where: { id: componentId } });
        break;
      case 'sut':
        result = await prisma.sUT.findUnique({ where: { id: componentId } });
        break;
      case 'phonopreamp':
        result = await prisma.phonoPreamp.findUnique({ where: { id: componentId } });
        break;
    }
    return result !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get images for a component
 * GET /api/component-images/:componentType/:componentId
 */
export const getComponentImages = async (req: Request, res: Response) => {
  try {
    const { componentType, componentId } = req.params;

    if (!isValidComponentType(componentType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid component type. Must be one of: turntable, tonearm, cartridge, sut, phonopreamp',
      });
    }

    const images = await prisma.componentImage.findMany({
      where: {
        componentType,
        componentId,
        deletedAt: null,
      },
      orderBy: [
        { isPrimary: 'desc' }, // Primary first
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    res.json({ images });
  } catch (error) {
    console.error('Get component images error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch component images',
    });
  }
};

/**
 * Add image to component
 * POST /api/component-images/:componentType/:componentId
 */
export const addComponentImage = async (req: Request, res: Response) => {
  try {
    const { componentType, componentId } = req.params;
    const { url, isPrimary = false } = req.body;

    // Validate component type
    if (!isValidComponentType(componentType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid component type. Must be one of: turntable, tonearm, cartridge, sut, phonopreamp',
      });
    }

    // Validate URL
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL is required',
      });
    }

    // Check if component exists
    const exists = await componentExists(componentType, componentId);
    if (!exists) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Component not found: ' + componentType + ' with id ' + componentId,
      });
    }

    // Check image count limit
    const existingCount = await prisma.componentImage.count({
      where: {
        componentType,
        componentId,
        deletedAt: null,
      },
    });

    if (existingCount >= MAX_IMAGES_PER_COMPONENT) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Maximum of ' + MAX_IMAGES_PER_COMPONENT + ' images allowed per component',
      });
    }

    // Determine if this should be primary (first image is auto-primary)
    const shouldBePrimary = existingCount === 0 || isPrimary;

    // If this will be primary, unset other primary images
    if (shouldBePrimary) {
      await prisma.componentImage.updateMany({
        where: {
          componentType,
          componentId,
          isPrimary: true,
          deletedAt: null,
        },
        data: { isPrimary: false },
      });
    }

    // Get next sort order
    const maxSortOrder = await prisma.componentImage.findFirst({
      where: {
        componentType,
        componentId,
        deletedAt: null,
      },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const nextSortOrder = (maxSortOrder?.sortOrder ?? -1) + 1;

    // Create the image
    const image = await prisma.componentImage.create({
      data: {
        url: url.trim(),
        isPrimary: shouldBePrimary,
        sortOrder: nextSortOrder,
        componentType,
        componentId,
      },
    });

    res.status(201).json(image);
  } catch (error) {
    console.error('Add component image error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add component image',
    });
  }
};

/**
 * Update image (isPrimary, sortOrder)
 * PUT /api/component-images/:id
 */
export const updateComponentImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isPrimary, sortOrder } = req.body;

    const imageId = parseInt(id, 10);
    if (isNaN(imageId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid image ID',
      });
    }

    // Find existing image
    const existingImage = await prisma.componentImage.findFirst({
      where: { id: imageId, deletedAt: null },
    });

    if (!existingImage) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Image not found',
      });
    }

    // Build update data
    const updateData: { isPrimary?: boolean; sortOrder?: number } = {};

    if (typeof isPrimary === 'boolean') {
      updateData.isPrimary = isPrimary;

      // If setting as primary, unset other primary images
      if (isPrimary) {
        await prisma.componentImage.updateMany({
          where: {
            componentType: existingImage.componentType,
            componentId: existingImage.componentId,
            id: { not: imageId },
            isPrimary: true,
            deletedAt: null,
          },
          data: { isPrimary: false },
        });
      }
    }

    if (typeof sortOrder === 'number' && sortOrder >= 0) {
      updateData.sortOrder = sortOrder;
    }

    // Update the image
    const image = await prisma.componentImage.update({
      where: { id: imageId },
      data: updateData,
    });

    res.json(image);
  } catch (error) {
    console.error('Update component image error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update component image',
    });
  }
};

/**
 * Reorder images for a component
 * PUT /api/component-images/:componentType/:componentId/reorder
 */
export const reorderComponentImages = async (req: Request, res: Response) => {
  try {
    const { componentType, componentId } = req.params;
    const { imageIds } = req.body;

    // Validate component type
    if (!isValidComponentType(componentType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid component type. Must be one of: turntable, tonearm, cartridge, sut, phonopreamp',
      });
    }

    // Validate imageIds
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'imageIds must be a non-empty array of image IDs',
      });
    }

    // Validate all IDs are numbers
    if (!imageIds.every((id) => typeof id === 'number' && Number.isInteger(id))) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'All imageIds must be integers',
      });
    }

    // Get existing images for this component
    const existingImages = await prisma.componentImage.findMany({
      where: {
        componentType,
        componentId,
        deletedAt: null,
      },
      select: { id: true },
    });

    const existingIds = new Set(existingImages.map((img) => img.id));

    // Validate all provided IDs belong to this component
    for (const id of imageIds) {
      if (!existingIds.has(id)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Image ID ' + id + ' does not belong to this component',
        });
      }
    }

    // Update sort orders
    const updates = imageIds.map((imageId, index) =>
      prisma.componentImage.update({
        where: { id: imageId },
        data: { sortOrder: index },
      })
    );

    await prisma.$transaction(updates);

    // Return updated images
    const images = await prisma.componentImage.findMany({
      where: {
        componentType,
        componentId,
        deletedAt: null,
      },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
    });

    res.json({ images });
  } catch (error) {
    console.error('Reorder component images error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to reorder component images',
    });
  }
};

/**
 * Soft delete image
 * DELETE /api/component-images/:id
 */
export const deleteComponentImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const imageId = parseInt(id, 10);
    if (isNaN(imageId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid image ID',
      });
    }

    // Find existing image
    const existingImage = await prisma.componentImage.findFirst({
      where: { id: imageId, deletedAt: null },
    });

    if (!existingImage) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Image not found',
      });
    }

    // Soft delete
    await prisma.componentImage.update({
      where: { id: imageId },
      data: { deletedAt: new Date() },
    });

    // If this was the primary image, set the next image as primary
    if (existingImage.isPrimary) {
      const nextImage = await prisma.componentImage.findFirst({
        where: {
          componentType: existingImage.componentType,
          componentId: existingImage.componentId,
          deletedAt: null,
        },
        orderBy: { sortOrder: 'asc' },
      });

      if (nextImage) {
        await prisma.componentImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete component image error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete component image',
    });
  }
};

/**
 * Bulk upsert images for a component
 * PUT /api/component-images/:componentType/:componentId
 * 
 * Request body: { images: [{url, isPrimary, sortOrder, id?}] }
 * - Existing images not in the request are soft-deleted
 * - Images without id are created
 * - Images with id are updated
 * - Only the first isPrimary=true is honored
 * - Maximum 10 images per component
 */
export const bulkUpsertComponentImages = async (req: Request, res: Response) => {
  try {
    const { componentType, componentId } = req.params;
    const { images } = req.body;

    // Validate component type
    if (!isValidComponentType(componentType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid component type. Must be one of: turntable, tonearm, cartridge, sut, phonopreamp',
      });
    }

    // Validate images array
    if (!Array.isArray(images)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'images must be an array',
      });
    }

    // Validate image count
    if (images.length > MAX_IMAGES_PER_COMPONENT) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Maximum of ${MAX_IMAGES_PER_COMPONENT} images allowed per component`,
      });
    }

    // Validate each image object
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.url || typeof img.url !== 'string' || img.url.trim() === '') {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Image at index ${i} must have a valid url`,
        });
      }
    }

    // Check if component exists
    const exists = await componentExists(componentType, componentId);
    if (!exists) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Component not found: ${componentType} with id ${componentId}`,
      });
    }

    // Get existing images for this component
    const existingImages = await prisma.componentImage.findMany({
      where: {
        componentType,
        componentId,
        deletedAt: null,
      },
    });

    const existingImageIds = new Set(existingImages.map((img) => img.id));

    // Validate that all provided IDs belong to this component
    const providedIds = images.filter((img) => img.id !== undefined).map((img) => img.id);
    for (const id of providedIds) {
      if (!existingImageIds.has(id)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Image ID ${id} does not belong to this component or does not exist`,
        });
      }
    }

    // Determine which IDs to keep (those in the request)
    const idsToKeep = new Set(providedIds);

    // Determine which existing images to soft delete (not in request)
    const idsToDelete = existingImages
      .filter((img) => !idsToKeep.has(img.id))
      .map((img) => img.id);

    // Process isPrimary: only first true is honored
    let primarySet = false;
    const processedImages = images.map((img, index) => {
      let isPrimary = false;
      if (img.isPrimary && !primarySet) {
        isPrimary = true;
        primarySet = true;
      }
      return {
        id: img.id,
        url: img.url.trim(),
        isPrimary,
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
      };
    });

    // If no isPrimary was set and there are images, make the first one primary
    if (!primarySet && processedImages.length > 0) {
      processedImages[0].isPrimary = true;
    }

    // Execute all operations in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete images not in request
      if (idsToDelete.length > 0) {
        await tx.componentImage.updateMany({
          where: { id: { in: idsToDelete } },
          data: { deletedAt: new Date() },
        });
      }

      // 2. Update existing images and create new ones
      for (const img of processedImages) {
        if (img.id !== undefined) {
          // Update existing image
          await tx.componentImage.update({
            where: { id: img.id },
            data: {
              url: img.url,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
            },
          });
        } else {
          // Create new image
          await tx.componentImage.create({
            data: {
              url: img.url,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
              componentType,
              componentId,
            },
          });
        }
      }
    });

    // Return updated images list
    const updatedImages = await prisma.componentImage.findMany({
      where: {
        componentType,
        componentId,
        deletedAt: null,
      },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    res.json({ images: updatedImages });
  } catch (error) {
    console.error('Bulk upsert component images error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to bulk upsert component images',
    });
  }
};
