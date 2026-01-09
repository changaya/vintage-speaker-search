import { Request, Response } from 'express';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Upload single image
 * POST /api/upload/image
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const processedImage = (req as any).processedImage;

    if (!processedImage) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No image file provided',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        filename: processedImage.filename,
        url: processedImage.url,
      },
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upload image',
    });
  }
};

/**
 * Upload multiple images
 * POST /api/upload/images
 */
export const uploadImages = async (req: Request, res: Response) => {
  try {
    const processedImages = (req as any).processedImages;

    if (!processedImages || processedImages.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No image files provided',
      });
    }

    res.status(201).json({
      success: true,
      message: `${processedImages.length} images uploaded successfully`,
      images: processedImages.map((img: any) => ({
        filename: img.filename,
        url: img.url,
      })),
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upload images',
    });
  }
};

/**
 * Download image from URL
 * POST /api/upload/from-url
 * Body: { url: string }
 */
export const downloadImageFromUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL is required',
      });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid URL format',
      });
    }

    // Download image
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VintageAudio/1.0)',
      },
    });

    // Check content type
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL does not point to an image',
      });
    }

    // Setup paths
    const imagesDir = path.join(process.cwd(), 'uploads', 'images');
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const filepath = path.join(imagesDir, filename);

    // Process and save image with Sharp
    await sharp(response.data)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toFile(filepath);

    // Return URL path
    const imageUrl = `/uploads/images/${filename}`;

    res.status(201).json({
      success: true,
      message: 'Image downloaded and uploaded successfully',
      image: {
        filename,
        url: imageUrl,
      },
    });
  } catch (error: any) {
    console.error('Download image error:', error);

    let message = 'Failed to download image from URL';
    if (error.code === 'ECONNABORTED') {
      message = 'Request timeout - URL took too long to respond';
    } else if (error.response?.status === 404) {
      message = 'Image not found at URL';
    } else if (error.response?.status >= 400) {
      message = `Failed to access URL (HTTP ${error.response.status})`;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message,
    });
  }
};
