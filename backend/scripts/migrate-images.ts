/**
 * Data Migration Script: Migrate existing imageUrl to ComponentImage table
 *
 * This script migrates existing imageUrl data from each component table
 * to the new ComponentImage table for multi-image support.
 *
 * Run with: npx ts-node scripts/migrate-images.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationResult {
  componentType: string;
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
}

async function migrateImages(): Promise<void> {
  console.log('Starting image migration...\n');

  const results: MigrationResult[] = [];

  // Migrate turntables
  const turntableResult = await migrateComponentImages(
    'turntable',
    async () =>
      prisma.turntableBase.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, imageUrl: true },
      })
  );
  results.push(turntableResult);

  // Migrate tonearms
  const tonearmResult = await migrateComponentImages(
    'tonearm',
    async () =>
      prisma.tonearm.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, imageUrl: true },
      })
  );
  results.push(tonearmResult);

  // Migrate cartridges
  const cartridgeResult = await migrateComponentImages(
    'cartridge',
    async () =>
      prisma.cartridge.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, imageUrl: true },
      })
  );
  results.push(cartridgeResult);

  // Migrate SUTs
  const sutResult = await migrateComponentImages(
    'sut',
    async () =>
      prisma.sUT.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, imageUrl: true },
      })
  );
  results.push(sutResult);

  // Migrate PhonoPreamps
  const phonoResult = await migrateComponentImages(
    'phonopreamp',
    async () =>
      prisma.phonoPreamp.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, imageUrl: true },
      })
  );
  results.push(phonoResult);

  // Print summary
  console.log('\n========== Migration Summary ==========\n');
  console.log('Component Type    | Total | Migrated | Skipped | Errors');
  console.log('------------------|-------|----------|---------|-------');
  for (const result of results) {
    const typeStr = result.componentType.padEnd(17);
    const totalStr = String(result.total).padStart(5);
    const migratedStr = String(result.migrated).padStart(8);
    const skippedStr = String(result.skipped).padStart(7);
    const errorsStr = String(result.errors).padStart(6);
    console.log(typeStr + ' | ' + totalStr + ' | ' + migratedStr + ' | ' + skippedStr + ' | ' + errorsStr);
  }

  const totals = results.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      migrated: acc.migrated + r.migrated,
      skipped: acc.skipped + r.skipped,
      errors: acc.errors + r.errors,
    }),
    { total: 0, migrated: 0, skipped: 0, errors: 0 }
  );

  console.log('------------------|-------|----------|---------|-------');
  const totalTypeStr = 'TOTAL'.padEnd(17);
  const totalTotalStr = String(totals.total).padStart(5);
  const totalMigratedStr = String(totals.migrated).padStart(8);
  const totalSkippedStr = String(totals.skipped).padStart(7);
  const totalErrorsStr = String(totals.errors).padStart(6);
  console.log(totalTypeStr + ' | ' + totalTotalStr + ' | ' + totalMigratedStr + ' | ' + totalSkippedStr + ' | ' + totalErrorsStr);
  console.log('\nMigration complete!');
}

async function migrateComponentImages(
  componentType: string,
  fetchComponents: () => Promise<Array<{ id: string; imageUrl: string | null }>>
): Promise<MigrationResult> {
  console.log('Migrating ' + componentType + ' images...');

  const result: MigrationResult = {
    componentType,
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    const components = await fetchComponents();
    result.total = components.length;

    for (const component of components) {
      if (!component.imageUrl) {
        result.skipped++;
        continue;
      }

      try {
        // Check if already migrated
        const existing = await prisma.componentImage.findFirst({
          where: {
            componentType,
            componentId: component.id,
            url: component.imageUrl,
            deletedAt: null,
          },
        });

        if (existing) {
          console.log('  - Skipping ' + component.id + ' (already migrated)');
          result.skipped++;
          continue;
        }

        // Create ComponentImage record
        await prisma.componentImage.create({
          data: {
            url: component.imageUrl,
            isPrimary: true,
            sortOrder: 0,
            componentType,
            componentId: component.id,
          },
        });

        console.log('  + Migrated ' + component.id);
        result.migrated++;
      } catch (error) {
        console.error('  ! Error migrating ' + component.id + ':', error);
        result.errors++;
      }
    }
  } catch (error) {
    console.error('Error fetching ' + componentType + ' components:', error);
  }

  console.log('  Done: ' + result.migrated + ' migrated, ' + result.skipped + ' skipped, ' + result.errors + ' errors\n');
  return result;
}

// Run migration
migrateImages()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
