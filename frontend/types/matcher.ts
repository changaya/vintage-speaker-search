/**
 * Matcher Types
 * TypeScript definitions for component matching feature
 */

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

// API request/response types
export interface MatcherRequest {
  tonearmId: string;
  cartridgeId: string;
  sutId?: string;
  phonoPreampId?: string;
  headshellWeight?: number;
}

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

// Component data types (from database)
export interface Brand {
  id: string;
  name: string;
  country: string | null;
}

export interface Tonearm {
  id: string;
  brandId: string;
  modelName: string;
  effectiveMass: number;
  effectiveLength?: number | null;
  armType: string;
  headshellType?: string | null;
  imageUrl: string | null;
  brand: Brand;
}

export interface Cartridge {
  id: string;
  brandId: string;
  modelName: string;
  cartridgeType: string;
  compliance: number | null;
  cartridgeWeight: number | null;
  outputVoltage: number | null;
  outputImpedance: number | null;
  imageUrl: string | null;
  brand: Brand;
}

export interface SUT {
  id: string;
  brandId: string;
  modelName: string;
  gainDb: number;
  gainRatio: string | null;
  imageUrl: string | null;
  brand: Brand;
}

export interface PhonoPreamp {
  id: string;
  brandId: string;
  modelName: string;
  preampType: string;
  mmInputImpedance: number | null;
  imageUrl: string | null;
  brand: Brand;
}
