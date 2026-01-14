import { z } from 'zod';
import { matcherRequestSchema } from '../schemas/matcher.schema';

/**
 * Matcher Types
 * TypeScript definitions for component matching feature
 */

export type MatcherRequest = z.infer<typeof matcherRequestSchema>;

// Component selection types
export interface ComponentOption {
  value: string;
  label: string;
  brand: string;
  model: string;
  specs?: string;
}

export interface GroupedOption {
  label: string;
  options: ComponentOption[];
}

// Component info interfaces
export interface ComponentInfo {
  id: string;
  brand: string;
  model: string;
  imageUrl: string | null;
  [key: string]: any; // Additional component-specific fields
}

export interface TonearmInfo extends ComponentInfo {
  effectiveMass: number;
  effectiveLength?: number | null;
  armType: string;
  headshellType?: string | null;
  headshellWeight?: number;
}

export interface CartridgeInfo extends ComponentInfo {
  weight: number;
  weightEstimated?: boolean;
  weightEstimationInfo?: {
    source: string;
    count: number;
  };
  compliance: number;
  type: string;
  outputVoltage?: number;
}

// Matching result interfaces
export interface ResonanceResult {
  totalMass: number;
  resonanceFrequency: number;
  isOptimal: boolean;
  recommendation: string;
}

export interface SUTMatchingResult {
  cartridgeLoadImpedance: number;
  cartridgeInternalImpedance: number;
  recommendedMinLoad: number;
  outputVoltage: number;
  voltageGain: number;
  turnsRatio: number;
  isLoadOptimal: boolean;
  isVoltageOptimal: boolean;
  recommendation: string;
}

export interface MatchingResult {
  resonance: ResonanceResult;
  sut?: SUTMatchingResult;
  overallCompatibility: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  detailedAnalysis: string;
}

export interface MatcherResponse {
  components: {
    tonearm: TonearmInfo;
    cartridge: CartridgeInfo;
    sut: ComponentInfo | null;
    phonoPreamp: ComponentInfo | null;
  };
  matching: MatchingResult;
  timestamp: string;
}
