import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

/**
 * Get component counts
 * GET /api/stats
 */
export const getStats = async (_req: Request, res: Response) => {
  try {
    const [turntables, tonearms, cartridges, suts, phonoPreamps] =
      await Promise.all([
        prisma.turntableBase.count(),
        prisma.tonearm.count(),
        prisma.cartridge.count(),
        prisma.sUT.count(),
        prisma.phonoPreamp.count(),
      ]);

    res.json({
      turntables,
      tonearms,
      cartridges,
      suts,
      phonoPreamps,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch stats',
    });
  }
};
