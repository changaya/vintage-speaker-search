/**
 * Matcher Controller
 * Handles component matching calculations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { matcherRequestSchema } from '../schemas/matcher.schema';
import {
  calculateMatching,
  TonearmData,
  CartridgeData,
  SUTData,
  PhonoAmpData,
} from '../utils/matching-calculator';

const prisma = new PrismaClient();

/**
 * Estimate cartridge weight from similar cartridges
 */
async function estimateCartridgeWeight(
  brandId: string,
  cartridgeType: string
): Promise<{ weight: number; source: string; count: number } | null> {
  try {
    // Try 1: Find same brand, same type cartridges with weight data
    let similarCartridges = await prisma.cartridge.findMany({
      where: {
        brandId,
        cartridgeType,
        cartridgeWeight: { not: null },
      },
      select: {
        cartridgeWeight: true,
        modelName: true,
      },
      take: 10,
    });

    let source = `${cartridgeType} 타입의 동일 브랜드 카트리지`;

    // Try 2: If no same-brand cartridges found, use same type from other brands
    if (similarCartridges.length === 0) {
      similarCartridges = await prisma.cartridge.findMany({
        where: {
          cartridgeType,
          cartridgeWeight: { not: null },
        },
        select: {
          cartridgeWeight: true,
          modelName: true,
        },
        take: 20,
      });

      source = `${cartridgeType} 타입의 카트리지`;
    }

    if (similarCartridges.length === 0) {
      return null;
    }

    // Calculate average weight
    const weights = similarCartridges
      .map((c) => c.cartridgeWeight)
      .filter((w): w is number => w !== null);

    if (weights.length === 0) {
      return null;
    }

    const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;

    return {
      weight: Math.round(averageWeight * 10) / 10, // Round to 1 decimal
      source: `${source} ${weights.length}개 평균`,
      count: weights.length,
    };
  } catch (error) {
    console.error('Error estimating cartridge weight:', error);
    return null;
  }
}

/**
 * Calculate component matching
 * POST /api/matcher/calculate
 */
export const calculateComponentMatching = async (req: Request, res: Response) => {
  try {
    // 1. Validate request
    const validation = matcherRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request parameters',
        details: validation.error.errors,
      });
    }

    const { tonearmId, cartridgeId, sutId, phonoPreampId, headshellWeight } = validation.data;

    // 2. Fetch components from database
    const [tonearm, cartridge, sut, phonoPreamp] = await Promise.all([
      prisma.tonearm.findUnique({
        where: { id: tonearmId },
        include: { brand: true },
      }),
      prisma.cartridge.findUnique({
        where: { id: cartridgeId },
        include: { brand: true },
      }),
      sutId ? prisma.sUT.findUnique({
        where: { id: sutId },
        include: { brand: true },
      }) : Promise.resolve(null),
      phonoPreampId ? prisma.phonoPreamp.findUnique({
        where: { id: phonoPreampId },
        include: { brand: true },
      }) : Promise.resolve(null),
    ]);

    // 3. Validate components exist
    if (!tonearm) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tonearm not found',
      });
    }

    if (!cartridge) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Cartridge not found',
      });
    }

    // 4. Validate required data for calculations
    if (!tonearm.effectiveMass) {
      return res.status(400).json({
        error: 'Incomplete Data',
        message: 'Tonearm effective mass data is required for matching calculation',
      });
    }

    if (!cartridge.compliance) {
      return res.status(400).json({
        error: 'Incomplete Data',
        message: 'Cartridge compliance data is required for matching calculation',
      });
    }

    // 4b. Handle missing cartridge weight - estimate from similar cartridges
    let cartridgeWeight = cartridge.cartridgeWeight;
    let weightEstimated = false;
    let weightEstimationInfo: { source: string; count: number } | null = null;

    if (!cartridgeWeight) {
      const estimation = await estimateCartridgeWeight(
        cartridge.brandId,
        cartridge.cartridgeType
      );

      if (estimation) {
        cartridgeWeight = estimation.weight;
        weightEstimated = true;
        weightEstimationInfo = {
          source: estimation.source,
          count: estimation.count,
        };
      } else {
        return res.status(400).json({
          error: 'Incomplete Data',
          message: 'Cartridge weight data is required for matching calculation, and no similar cartridges found for estimation',
        });
      }
    }

    // 5. Validate cartridge type combinations
    if (cartridge.cartridgeType === 'MM' && sutId) {
      return res.status(400).json({
        error: 'Invalid Combination',
        message: 'SUT is not needed for MM cartridges. Please remove SUT selection.',
      });
    }

    // 6. Map database models to calculator interfaces
    const tonearmData: TonearmData = {
      modelName: `${tonearm.brand.name} ${tonearm.modelName}`,
      effectiveMass: tonearm.effectiveMass,
      headshellWeight: headshellWeight !== undefined ? headshellWeight : (tonearm.headshellWeight || undefined),
    };

    const cartridgeData: CartridgeData = {
      modelName: `${cartridge.brand.name} ${cartridge.modelName}`,
      compliance: cartridge.compliance,
      weight: cartridgeWeight, // Use estimated weight if original is missing
      outputVoltage: cartridge.outputVoltage || 0.3,
      internalImpedance: cartridge.outputImpedance || 10,
      cartridgeType: (cartridge.cartridgeType as 'MM' | 'MC') || 'MC',
    };

    let sutData: SUTData | undefined;
    if (sut) {
      // Extract turns ratio from gainRatio string (e.g., "1:10" -> 10)
      let turnsRatio = 10; // default
      if (sut.gainRatio) {
        const parts = sut.gainRatio.split(':');
        if (parts.length === 2) {
          turnsRatio = parseInt(parts[1], 10) || 10;
        }
      } else if (sut.gainDb) {
        // Calculate from dB: N = 10^(gainDb/20)
        turnsRatio = Math.pow(10, sut.gainDb / 20);
      }

      sutData = {
        modelName: `${sut.brand.name} ${sut.modelName}`,
        turnsRatio,
        secondaryImpedance: sut.secondaryImp || undefined,
      };
    }

    let phonoAmpData: PhonoAmpData | undefined;
    if (phonoPreamp) {
      phonoAmpData = {
        modelName: `${phonoPreamp.brand.name} ${phonoPreamp.modelName}`,
        inputImpedance: phonoPreamp.mmInputImpedance || 47000,
        minInputVoltage: 2.5, // Standard MM phono input range
        maxInputVoltage: 10.0,
      };
    }

    // 7. Calculate matching
    const matching = calculateMatching(
      tonearmData,
      cartridgeData,
      sutData,
      phonoAmpData
    );

    // 8. Return result with component details
    res.json({
      components: {
        tonearm: {
          id: tonearm.id,
          brand: tonearm.brand.name,
          model: tonearm.modelName,
          effectiveMass: tonearm.effectiveMass,
          effectiveLength: tonearm.effectiveLength,
          armType: tonearm.armType,
          headshellType: tonearm.headshellType,
          headshellWeight: tonearmData.headshellWeight,
          imageUrl: tonearm.imageUrl,
        },
        cartridge: {
          id: cartridge.id,
          brand: cartridge.brand.name,
          model: cartridge.modelName,
          type: cartridge.cartridgeType,
          compliance: cartridge.compliance,
          weight: cartridgeWeight,
          weightEstimated,
          weightEstimationInfo: weightEstimated ? weightEstimationInfo : undefined,
          outputVoltage: cartridge.outputVoltage,
          imageUrl: cartridge.imageUrl,
        },
        sut: sut ? {
          id: sut.id,
          brand: sut.brand.name,
          model: sut.modelName,
          gainRatio: sut.gainRatio,
          gainDb: sut.gainDb,
          imageUrl: sut.imageUrl,
        } : null,
        phonoPreamp: phonoPreamp ? {
          id: phonoPreamp.id,
          brand: phonoPreamp.brand.name,
          model: phonoPreamp.modelName,
          preampType: phonoPreamp.preampType,
          imageUrl: phonoPreamp.imageUrl,
        } : null,
      },
      matching,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Calculate matching error:', error);

    // Handle Prisma specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2025') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'One or more components not found',
        });
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to calculate component matching',
    });
  }
};
