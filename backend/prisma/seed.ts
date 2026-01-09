import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      email: 'admin@vintageaudio.com',
      role: 'admin',
    },
  });
  console.log('✅ Created admin user:', admin.username);

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { name: 'Technics' },
      update: {},
      create: {
        name: 'Technics',
        country: 'Japan',
        foundedYear: 1965,
        description: 'Renowned for high-quality direct-drive turntables',
      },
    }),
    prisma.brand.upsert({
      where: { name: 'Ortofon' },
      update: {},
      create: {
        name: 'Ortofon',
        country: 'Denmark',
        foundedYear: 1918,
        description: 'Premium phono cartridge manufacturer',
      },
    }),
    prisma.brand.upsert({
      where: { name: 'Audio-Technica' },
      update: {},
      create: {
        name: 'Audio-Technica',
        country: 'Japan',
        foundedYear: 1962,
        description: 'Professional and consumer audio equipment',
      },
    }),
    prisma.brand.upsert({
      where: { name: 'SME' },
      update: {},
      create: {
        name: 'SME',
        country: 'UK',
        foundedYear: 1946,
        description: 'Precision tonearm manufacturer',
      },
    }),
    prisma.brand.upsert({
      where: { name: 'Pioneer' },
      update: {},
      create: {
        name: 'Pioneer',
        country: 'Japan',
        foundedYear: 1938,
        description: 'Consumer electronics and audio equipment',
      },
    }),
  ]);
  console.log(`✅ Created ${brands.length} brands`);

  // Create sample turntable
  const technics = brands.find(b => b.name === 'Technics')!;
  const turntable = await prisma.turntableBase.upsert({
    where: {
      brandId_modelName: {
        brandId: technics.id,
        modelName: 'SL-1200MK2'
      }
    },
    update: {},
    create: {
      brandId: technics.id,
      modelName: 'SL-1200MK2',
      driveType: 'direct-drive',
      motorType: 'DC servo',
      platterMaterial: 'aluminum',
      platterWeight: 1.8,
      speeds: JSON.stringify(['33.33', '45']),
      wowFlutter: 0.025,
      suspensionType: 'rubber',
      width: 453,
      depth: 353,
      height: 169,
      weight: 12.5,
      dataSource: 'manufacturer-spec',
    },
  });
  console.log('✅ Created sample turntable:', turntable.modelName);

  // Create tonearm mounting for the turntable
  await prisma.tonearmMounting.upsert({
    where: { turntableBaseId: turntable.id },
    update: {},
    create: {
      turntableBaseId: turntable.id,
      mountingType: 'SME-standard',
      smeStandard: 'S-shape',
      mountingHoleDist: 23.01,
      pivotToSpindle: 230,
      overhang: 15,
      armboardIncluded: true,
      heightAdjustable: true,
    },
  });
  console.log('✅ Created tonearm mounting specs');

  // Create sample tonearm
  const sme = brands.find(b => b.name === 'SME')!;
  const tonearm = await prisma.tonearm.upsert({
    where: {
      brandId_modelName: {
        brandId: sme.id,
        modelName: '3009 Series II'
      }
    },
    update: {},
    create: {
      brandId: sme.id,
      modelName: '3009 Series II',
      armType: 'pivoted-9',
      effectiveLength: 229,
      effectiveMass: 9.5,
      armTubeType: 'S-shape',
      armTubeMaterial: 'aluminum',
      bearingType: 'gimbal',
      headshellType: 'removable-SME',
      vtfMin: 0.5,
      vtfMax: 3.0,
      vtfAdjustType: 'counterweight',
      antiSkateType: 'weight',
      mountingType: 'SME-standard',
      dataSource: 'manufacturer-spec',
    },
  });
  console.log('✅ Created sample tonearm:', tonearm.modelName);

  // Create sample MM cartridge
  const audioTechnica = brands.find(b => b.name === 'Audio-Technica')!;
  const cartridgeMM = await prisma.cartridge.upsert({
    where: {
      brandId_modelName: {
        brandId: audioTechnica.id,
        modelName: 'AT95E'
      }
    },
    update: {},
    create: {
      brandId: audioTechnica.id,
      modelName: 'AT95E',
      cartridgeType: 'MM',
      outputVoltage: 3.5,
      outputType: 'high',
      outputImpedance: 600,
      loadImpedance: 47000,
      loadCapacitance: 150,
      compliance: 20,
      complianceFreq: '10Hz',
      cartridgeWeight: 6.0,
      trackingForceMin: 1.5,
      trackingForceMax: 2.5,
      trackingForceRec: 2.0,
      stylusType: 'elliptical',
      freqRespLow: 20,
      freqRespHigh: 20,
      channelSeparation: 23,
      dataSource: 'manufacturer-spec',
    },
  });
  console.log('✅ Created sample MM cartridge:', cartridgeMM.modelName);

  // Create sample MC cartridge
  const ortofon = brands.find(b => b.name === 'Ortofon')!;
  const cartridgeMC = await prisma.cartridge.upsert({
    where: {
      brandId_modelName: {
        brandId: ortofon.id,
        modelName: 'MC20 Super'
      }
    },
    update: {},
    create: {
      brandId: ortofon.id,
      modelName: 'MC20 Super',
      cartridgeType: 'MC',
      outputVoltage: 0.15,
      outputType: 'low',
      outputImpedance: 5,
      loadImpedance: 100,
      compliance: 9,
      complianceFreq: '10Hz',
      cartridgeWeight: 5.0,
      trackingForceMin: 1.2,
      trackingForceMax: 1.8,
      trackingForceRec: 1.5,
      stylusType: 'line-contact',
      cantilevMaterial: 'boron',
      freqRespLow: 20,
      freqRespHigh: 45,
      channelSeparation: 28,
      dataSource: 'manufacturer-spec',
    },
  });
  console.log('✅ Created sample MC cartridge:', cartridgeMC.modelName);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
