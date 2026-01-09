/**
 * Column Usage Analysis Script
 * Analyzes database to find unused or rarely used columns
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ColumnStats {
  fieldName: string;
  totalRecords: number;
  nonNullCount: number;
  usagePercentage: number;
}

interface ModelAnalysis {
  modelName: string;
  totalRecords: number;
  columns: ColumnStats[];
}

// Fields to exclude from analysis (auto-managed fields)
const EXCLUDED_FIELDS = ['id', 'createdAt', 'updatedAt', 'brandId'];

async function analyzeModel(
  modelName: string,
  model: any,
  fields: string[]
): Promise<ModelAnalysis> {
  console.log(`\n📊 Analyzing ${modelName}...`);

  // Get all records
  const allRecords = await model.findMany();
  const totalRecords = allRecords.length;
  console.log(`   Total records: ${totalRecords}`);

  if (totalRecords === 0) {
    return {
      modelName,
      totalRecords: 0,
      columns: [],
    };
  }

  const columnStats: ColumnStats[] = [];

  // Analyze each field
  for (const fieldName of fields) {
    if (EXCLUDED_FIELDS.includes(fieldName)) {
      continue;
    }

    // Count non-null values by checking each record
    const nonNullCount = allRecords.filter((record: any) => {
      const value = record[fieldName];
      // Consider null, undefined, empty string, and empty arrays as "not used"
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;

    const usagePercentage = (nonNullCount / totalRecords) * 100;

    columnStats.push({
      fieldName,
      totalRecords,
      nonNullCount,
      usagePercentage,
    });
  }

  return {
    modelName,
    totalRecords,
    columns: columnStats.sort((a, b) => a.usagePercentage - b.usagePercentage),
  };
}

async function main() {
  console.log('🔍 Column Usage Analysis');
  console.log('=' .repeat(80));

  const analyses: ModelAnalysis[] = [];

  // Analyze TurntableBase
  analyses.push(
    await analyzeModel('TurntableBase', prisma.turntableBase, [
      'modelName',
      'modelNumber',
      'driveType',
      'motorType',
      'platterMaterial',
      'platterWeight',
      'platterDiameter',
      'speeds',
      'wowFlutter',
      'speedAccuracy',
      'suspensionType',
      'isolationFeet',
      'width',
      'depth',
      'height',
      'weight',
      'powerConsumption',
      'voltage',
      'imageUrl',
      'specSheetUrl',
      'manualUrl',
      'dataSource',
      'dataSourceUrl',
    ])
  );

  // Analyze Tonearm
  analyses.push(
    await analyzeModel('Tonearm', prisma.tonearm, [
      'modelName',
      'modelNumber',
      'armType',
      'effectiveLength',
      'effectiveMass',
      'armTubeType',
      'armTubeMaterial',
      'bearingType',
      'bearingMaterial',
      'headshellType',
      'headshellWeight',
      'vtaAdjustable',
      'azimuthAdjust',
      'vtfMin',
      'vtfMax',
      'vtfAdjustType',
      'antiSkateType',
      'totalWeight',
      'height',
      'mountingType',
      'imageUrl',
      'specSheetUrl',
      'manualUrl',
      'dataSource',
      'dataSourceUrl',
    ])
  );

  // Analyze Cartridge
  analyses.push(
    await analyzeModel('Cartridge', prisma.cartridge, [
      'modelName',
      'modelNumber',
      'cartridgeType',
      'outputVoltage',
      'outputType',
      'outputCategory',
      'outputImpedance',
      'loadImpedance',
      'loadCapacitance',
      'dcResistance',
      'inductance',
      'compliance',
      'complianceFreq',
      'complianceType',
      'complianceDirection',
      'cartridgeWeight',
      'trackingForceMin',
      'trackingForceMax',
      'trackingForceRec',
      'stylusType',
      'cantilevMaterial',
      'freqRespLow',
      'freqRespHigh',
      'freqRespTolerance',
      'freqResponseRaw',
      'channelSeparation',
      'channelBalance',
      'height',
      'width',
      'depth',
      'mountingHoles',
      'mountType',
      'bodyMaterial',
      'verticalTrackingAngle',
      'recommendedUse',
      'replacementStylus',
      'imageUrl',
      'specSheetUrl',
      'dataSource',
      'dataSourceUrl',
      'specSourceUrl',
      'notes',
    ])
  );

  // Analyze SUT
  analyses.push(
    await analyzeModel('SUT', prisma.sUT, [
      'modelName',
      'modelNumber',
      'transformerType',
      'gainDb',
      'gainRatio',
      'primaryImpedance',
      'secondaryImp',
      'inputImpedance',
      'inputCapacitance',
      'freqRespLow',
      'freqRespHigh',
      'freqRespTolerance',
      'coreType',
      'inputConnectors',
      'outputConnectors',
      'channels',
      'balanced',
      'width',
      'depth',
      'height',
      'weight',
      'imageUrl',
      'specSheetUrl',
      'dataSource',
      'dataSourceUrl',
    ])
  );

  // Analyze PhonoPreamp
  analyses.push(
    await analyzeModel('PhonoPreamp', prisma.phonoPreamp, [
      'modelName',
      'modelNumber',
      'supportsMM',
      'supportsMC',
      'mmInputImpedance',
      'mmInputCapacitance',
      'mmGain',
      'mcInputImpedance',
      'mcInputCapacitance',
      'mcGain',
      'gainAdjustable',
      'gainRange',
      'impedanceAdjust',
      'impedanceOptions',
      'capacitanceAdjust',
      'capacitanceRange',
      'equalizationCurve',
      'freqRespLow',
      'freqRespHigh',
      'thd',
      'snr',
      'inputConnectors',
      'outputConnectors',
      'balanced',
      'powerSupply',
      'voltage',
      'amplifierType',
      'width',
      'depth',
      'height',
      'weight',
      'imageUrl',
      'specSheetUrl',
      'dataSource',
      'dataSourceUrl',
    ])
  );

  // Print results
  console.log('\n\n📈 ANALYSIS RESULTS');
  console.log('=' .repeat(80));

  for (const analysis of analyses) {
    console.log(`\n\n🔹 ${analysis.modelName} (${analysis.totalRecords} records)`);
    console.log('-'.repeat(80));

    if (analysis.totalRecords === 0) {
      console.log('   ⚠️  No records found');
      continue;
    }

    // Group by usage level
    const unused = analysis.columns.filter((c) => c.usagePercentage === 0);
    const lowUsage = analysis.columns.filter(
      (c) => c.usagePercentage > 0 && c.usagePercentage < 25
    );
    const mediumUsage = analysis.columns.filter(
      (c) => c.usagePercentage >= 25 && c.usagePercentage < 75
    );
    const highUsage = analysis.columns.filter((c) => c.usagePercentage >= 75);

    if (unused.length > 0) {
      console.log(`\n   🔴 UNUSED (0%) - ${unused.length} fields:`);
      unused.forEach((c) => {
        console.log(`      - ${c.fieldName}`);
      });
    }

    if (lowUsage.length > 0) {
      console.log(`\n   🟡 LOW USAGE (<25%) - ${lowUsage.length} fields:`);
      lowUsage.forEach((c) => {
        console.log(
          `      - ${c.fieldName.padEnd(25)} ${c.nonNullCount}/${c.totalRecords} (${c.usagePercentage.toFixed(1)}%)`
        );
      });
    }

    if (mediumUsage.length > 0) {
      console.log(`\n   🟢 MEDIUM USAGE (25-75%) - ${mediumUsage.length} fields:`);
      mediumUsage.forEach((c) => {
        console.log(
          `      - ${c.fieldName.padEnd(25)} ${c.nonNullCount}/${c.totalRecords} (${c.usagePercentage.toFixed(1)}%)`
        );
      });
    }

    if (highUsage.length > 0) {
      console.log(`\n   ✅ HIGH USAGE (≥75%) - ${highUsage.length} fields:`);
      highUsage.forEach((c) => {
        console.log(
          `      - ${c.fieldName.padEnd(25)} ${c.nonNullCount}/${c.totalRecords} (${c.usagePercentage.toFixed(1)}%)`
        );
      });
    }
  }

  // Summary recommendations
  console.log('\n\n💡 RECOMMENDATIONS');
  console.log('=' .repeat(80));

  for (const analysis of analyses) {
    if (analysis.totalRecords === 0) continue;

    const unused = analysis.columns.filter((c) => c.usagePercentage === 0);
    const lowUsage = analysis.columns.filter(
      (c) => c.usagePercentage > 0 && c.usagePercentage < 25
    );

    if (unused.length > 0 || lowUsage.length > 0) {
      console.log(`\n${analysis.modelName}:`);

      if (unused.length > 0) {
        console.log(
          `  - Consider hiding ${unused.length} UNUSED fields from UI`
        );
      }

      if (lowUsage.length > 0) {
        console.log(
          `  - Consider hiding ${lowUsage.length} LOW USAGE fields from UI (optional/advanced section)`
        );
      }
    }
  }

  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
