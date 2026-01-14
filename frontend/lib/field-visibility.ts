/**
 * Field Visibility Configuration
 *
 * Controls which fields are visible in Admin UI.
 * Hidden fields are still stored in database but not shown in UI forms.
 *
 * Usage:
 * - hidden: Fields that will be excluded from UI forms
 * - visible: Fields that will be shown in UI forms
 *
 * Based on database analysis (2025-12-22):
 * - UNUSED (0%): Fields with no data
 * - LOW USAGE (<25%): Fields with less than 25% data coverage
 *
 * ⚠️ IMPORTANT: This config must match backend config at:
 * vintage-audio-backend/src/config/field-visibility.config.ts
 */

export interface ModelFieldConfig {
  hidden: string[];
  visible?: string[] | null;
}

export interface FieldVisibilityConfig {
  cartridge: ModelFieldConfig;
  tonearm: ModelFieldConfig;
  turntableBase: ModelFieldConfig;
  sut: ModelFieldConfig;
  phonoPreamp: ModelFieldConfig;
}

/**
 * Field Visibility Configuration
 *
 * Strategy: Aggressive (Option 2)
 * - Hide UNUSED (0%) fields
 * - Hide LOW USAGE (<25%) fields
 */
export const FIELD_VISIBILITY: FieldVisibilityConfig = {
  // ============================================================================
  // CARTRIDGE - 30 fields hidden (71% reduction: 42 → 12 visible)
  // ============================================================================
  cartridge: {
    // Hidden fields: UNUSED (20) + LOW USAGE (10) = 30 total
    hidden: [
      // UNUSED (0%) - 20 fields
      'modelNumber',
      'outputCategory',
      'dcResistance',
      'inductance',
      'complianceType',
      'complianceDirection',
      'freqRespTolerance',
      'freqResponseRaw',
      'channelBalance',
      'height',
      'width',
      'depth',
      'mountingHoles',
      'mountType',
      'bodyMaterial',
      'verticalTrackingAngle',
      'replacementStylus',
      'specSheetUrl',
      'specSourceUrl',
      'notes',

      // LOW USAGE (<25%) - 10 fields
      'loadCapacitance', // 3.1%
      'cantilevMaterial', // 3.1%
      'recommendedUse', // 3.1%
      'loadImpedance', // 6.3%
      'complianceFreq', // 6.3%
      'trackingForceRec', // 6.3%
      'freqRespLow', // 6.3%
      'freqRespHigh', // 6.3%
      'outputType', // 9.4%
      'cartridgeWeight', // 9.4% - ⚠️ Important for matching but lacks data
    ],

    // Visible fields: 12 core fields (high usage + essential for matching)
    visible: [
      'id',
      'brandId',
      'modelName', // 100%
      'cartridgeType', // 100% - MM/MC distinction
      'outputVoltage', // 100% - SUT matching
      'outputImpedance', // 100% - Impedance matching
      'compliance', // 84.4% - Matching critical!
      'trackingForceMin', // 96.9%
      'trackingForceMax', // 96.9%
      'stylusType', // 93.8%
      'channelSeparation', // 68.8%
      'imageUrl', // 93.8%
      'dataSource', // 96.9%
      'dataSourceUrl', // 90.6%
      'createdAt',
      'updatedAt',
    ],
  },

  // ============================================================================
  // TONEARM - 13 fields hidden (52% reduction: 25 → 12 visible)
  // ============================================================================
  tonearm: {
    // Hidden fields: UNUSED (5) + LOW USAGE (8) = 13 total
    hidden: [
      // UNUSED (0%) - 5 fields
      'modelNumber',
      'bearingMaterial',
      'headshellWeight',
      'specSheetUrl',
      'manualUrl',

      // LOW USAGE (<25%) - 8 fields
      'armTubeType', // 4.3%
      'armTubeMaterial', // 4.3%
      'bearingType', // 4.3%
      'vtfMin', // 4.3%
      'vtfMax', // 4.3%
      'vtfAdjustType', // 4.3%
      'antiSkateType', // 4.3%
      'mountingType', // 4.3%
    ],

    // Visible fields: 12 core fields
    visible: [
      'id',
      'brandId',
      'modelName', // 100%
      'armType', // 100% - 9"/10"/12" distinction
      'effectiveMass', // 100% - Matching critical!
      'effectiveLength', // 26.1%
      'headshellType', // 100%
      'vtaAdjustable', // 100%
      'azimuthAdjust', // 100%
      'totalWeight', // 39.1%
      'height', // 69.6%
      'imageUrl', // 95.7%
      'dataSource', // 100%
      'dataSourceUrl', // 95.7%
      'createdAt',
      'updatedAt',
    ],
  },

  // ============================================================================
  // TURNTABLE BASE - 14 fields hidden (61% reduction: 23 → 9 visible)
  // ============================================================================
  turntableBase: {
    // Hidden fields: UNUSED (8) + LOW USAGE (6) = 14 total
    hidden: [
      // UNUSED (0%) - 8 fields
      'modelNumber',
      'platterDiameter',
      'speedAccuracy',
      'isolationFeet',
      'powerConsumption',
      'voltage',
      'specSheetUrl',
      'manualUrl',

      // LOW USAGE (<25%) - 6 fields
      'platterMaterial', // 5.0%
      'platterWeight', // 5.0%
      'width', // 5.0%
      'depth', // 5.0%
      'height', // 5.0%
      'suspensionType', // 10.0%
    ],

    // Visible fields: 9 core fields
    visible: [
      'id',
      'brandId',
      'modelName', // 100%
      'driveType', // 100% - Core spec
      'motorType', // 75%
      'speeds', // 100%
      'wowFlutter', // 50%
      'weight', // 95%
      'imageUrl', // 100%
      'dataSource', // 100%
      'dataSourceUrl', // 95%
      'createdAt',
      'updatedAt',
    ],
  },

  // ============================================================================
  // SUT - 10 fields hidden (40% reduction: 25 → 15 visible)
  // ============================================================================
  sut: {
    // Hidden fields: UNUSED (10) + LOW USAGE (0) = 10 total
    hidden: [
      // UNUSED (0%) - 10 fields
      'modelNumber',
      'primaryImpedance',
      'secondaryImp',
      'inputCapacitance',
      'freqRespTolerance',
      'coreType',
      'width',
      'depth',
      'height',
      'specSheetUrl',
    ],

    // Visible fields: 15 core fields
    visible: [
      'id',
      'brandId',
      'modelName', // 100%
      'transformerType', // 100%
      'gainDb', // 100% - Core!
      'gainRatio', // 50%
      'inputImpedance', // 100%
      'freqRespLow', // 100%
      'freqRespHigh', // 100%
      'inputConnectors', // 100%
      'outputConnectors', // 100%
      'channels', // 100%
      'balanced', // 100%
      'weight', // 100%
      'imageUrl', // 100%
      'dataSource', // 100%
      'dataSourceUrl', // 100%
      'createdAt',
      'updatedAt',
    ],
  },

  // ============================================================================
  // PHONO PREAMP - No data yet, keep all fields visible for now
  // ============================================================================
  phonoPreamp: {
    hidden: [],
    visible: null, // null = show all fields
  },
};

/**
 * Get visible fields for a model
 */
export function getVisibleFields(modelName: keyof FieldVisibilityConfig): string[] | null {
  const config = FIELD_VISIBILITY[modelName];
  return config.visible || null;
}

/**
 * Get hidden fields for a model
 */
export function getHiddenFields(modelName: keyof FieldVisibilityConfig): string[] {
  const config = FIELD_VISIBILITY[modelName];
  return config.hidden || [];
}

/**
 * Check if a field is visible for a model
 */
export function isFieldVisible(modelName: keyof FieldVisibilityConfig, fieldName: string): boolean {
  const config = FIELD_VISIBILITY[modelName];
  const { visible, hidden } = config;

  // If visible list is null or undefined, all non-hidden fields are visible
  if (visible === null || visible === undefined) {
    return !hidden.includes(fieldName);
  }

  // Otherwise, check if field is in visible list
  return visible.includes(fieldName);
}

/**
 * Check if a field is hidden for a model
 */
export function isFieldHidden(modelName: keyof FieldVisibilityConfig, fieldName: string): boolean {
  const config = FIELD_VISIBILITY[modelName];
  return config.hidden.includes(fieldName);
}

/**
 * Field labels for display in UI
 */
export const FIELD_LABELS: Record<string, string> = {
  // Common fields
  brandId: 'Brand',
  modelName: 'Model Name',
  imageUrl: 'Image URL',
  dataSource: 'Data Source',
  dataSourceUrl: 'Data Source URL',

  // Cartridge fields
  cartridgeType: 'Cartridge Type',
  outputVoltage: 'Output Voltage (mV)',
  outputImpedance: 'Output Impedance (Ω)',
  compliance: 'Compliance (μm/mN)',
  trackingForceMin: 'Tracking Force Min (g)',
  trackingForceMax: 'Tracking Force Max (g)',
  stylusType: 'Stylus Type',
  channelSeparation: 'Channel Separation (dB)',

  // Tonearm fields
  armType: 'Arm Type',
  effectiveMass: 'Effective Mass (g)',
  effectiveLength: 'Effective Length (mm)',
  headshellType: 'Headshell Type',
  vtaAdjustable: 'VTA Adjustable',
  azimuthAdjust: 'Azimuth Adjust',
  totalWeight: 'Total Weight (g)',
  height: 'Height (mm)',

  // Turntable fields
  driveType: 'Drive Type',
  motorType: 'Motor Type',
  speeds: 'Speeds',
  wowFlutter: 'Wow & Flutter (%)',
  weight: 'Weight (kg)',

  // SUT fields
  transformerType: 'Transformer Type',
  gainDb: 'Gain (dB)',
  gainRatio: 'Gain Ratio',
  inputImpedance: 'Input Impedance (Ω)',
  freqRespLow: 'Frequency Response Low (Hz)',
  freqRespHigh: 'Frequency Response High (Hz)',
  inputConnectors: 'Input Connectors',
  outputConnectors: 'Output Connectors',
  channels: 'Channels',
  balanced: 'Balanced',
};

/**
 * Get field label for display
 */
export function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] || fieldName;
}
