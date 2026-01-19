import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getOrCreateBrand(name: string, country: string, description?: string) {
  return prisma.brand.upsert({
    where: { name },
    update: {},
    create: { name, country, description }
  });
}

async function main() {
  console.log('🌱 Seeding famous audio products...\n');

  // Create brands
  const brands = {
    denon: await getOrCreateBrand('Denon', 'Japan', 'Japanese audio equipment manufacturer'),
    nagaoka: await getOrCreateBrand('Nagaoka', 'Japan', 'Japanese cartridge manufacturer known for MP series'),
    shure: await getOrCreateBrand('Shure', 'USA', 'American audio electronics company'),
    grado: await getOrCreateBrand('Grado', 'USA', 'American manufacturer of headphones and phono cartridges'),
    sumiko: await getOrCreateBrand('Sumiko', 'USA', 'American high-end phono cartridge manufacturer'),
    koetsu: await getOrCreateBrand('Koetsu', 'Japan', 'Japanese high-end MC cartridge manufacturer'),
    rega: await getOrCreateBrand('Rega', 'UK', 'British turntable and tonearm manufacturer'),
    jelco: await getOrCreateBrand('Jelco', 'Japan', 'Japanese tonearm manufacturer'),
    clearaudio: await getOrCreateBrand('Clearaudio', 'Germany', 'German high-end turntable manufacturer'),
    hashimoto: await getOrCreateBrand('Hashimoto', 'Japan', 'Japanese transformer manufacturer'),
    grahamSlee: await getOrCreateBrand('Graham Slee', 'UK', 'British phono preamp manufacturer'),
    proJect: await getOrCreateBrand('Pro-Ject', 'Austria', 'Austrian turntable and audio equipment manufacturer'),
  };

  console.log('✅ Brands created/verified\n');

  // Cartridges
  const cartridges = [
    {
      brandId: brands.denon.id,
      modelName: 'DL-103',
      cartridgeType: 'MC',
      outputVoltage: 0.3,
      outputType: 'low',
      outputImpedance: 40,
      loadImpedance: 100,
      compliance: 5,
      complianceFreq: '100Hz',
      cartridgeWeight: 8.5,
      trackingForceMin: 2.2,
      trackingForceMax: 2.8,
      trackingForceRec: 2.5,
      stylusType: 'spherical',
      freqRespLow: 20,
      freqRespHigh: 45,
      channelSeparation: 25,
      mountType: 'half-inch',
      dataSource: 'Stereophile',
      dataSourceUrl: 'https://www.stereophile.com/content/denon-dl-103-phono-cartridge-specifications'
    },
    {
      brandId: brands.nagaoka.id,
      modelName: 'MP-500',
      cartridgeType: 'MM',
      outputVoltage: 3.0,
      outputType: 'medium',
      loadImpedance: 47000,
      compliance: 8.5,
      complianceFreq: '100Hz',
      cartridgeWeight: 8,
      trackingForceMin: 1.3,
      trackingForceMax: 1.8,
      trackingForceRec: 1.5,
      stylusType: 'line-contact',
      cantilevMaterial: 'boron',
      freqRespLow: 20,
      freqRespHigh: 25,
      channelSeparation: 27,
      mountType: 'half-inch',
      dataSource: 'LP Gear',
      dataSourceUrl: 'https://www.lpgear.com/product/NAGAOKAMP500.html'
    },
    {
      brandId: brands.shure.id,
      modelName: 'M97xE',
      cartridgeType: 'MM',
      outputVoltage: 4.0,
      outputType: 'high',
      outputImpedance: 650,
      loadImpedance: 47000,
      loadCapacitance: 250,
      compliance: 20,
      complianceFreq: '10Hz',
      cartridgeWeight: 6.6,
      trackingForceMin: 0.75,
      trackingForceMax: 1.5,
      trackingForceRec: 1.25,
      stylusType: 'elliptical',
      cantilevMaterial: 'aluminum',
      freqRespLow: 20,
      freqRespHigh: 22,
      channelSeparation: 25,
      mountType: 'half-inch',
      dataSource: 'Shure',
      dataSourceUrl: 'https://www.shure.com/en-US/docs/guide/M97XE'
    },
    {
      brandId: brands.grado.id,
      modelName: 'Gold3',
      cartridgeType: 'MI',
      outputVoltage: 5.0,
      outputType: 'high',
      outputImpedance: 475,
      loadImpedance: 47000,
      compliance: 20,
      complianceFreq: '10Hz',
      cartridgeWeight: 5.5,
      trackingForceMin: 1.0,
      trackingForceMax: 2.0,
      trackingForceRec: 1.5,
      stylusType: 'elliptical',
      freqRespLow: 10,
      freqRespHigh: 60,
      channelSeparation: 35,
      inductance: 45,
      mountType: 'half-inch',
      dataSource: 'Grado Labs',
      dataSourceUrl: 'https://gradolabs.com/products/grado-prestige-gold3-phono-cartridge'
    },
    {
      brandId: brands.sumiko.id,
      modelName: 'Blue Point No.2',
      cartridgeType: 'MC',
      outputVoltage: 2.5,
      outputType: 'high',
      loadImpedance: 47000,
      compliance: 15,
      complianceFreq: '100Hz',
      cartridgeWeight: 6.3,
      trackingForceMin: 1.6,
      trackingForceMax: 2.0,
      trackingForceRec: 1.8,
      stylusType: 'elliptical',
      cantilevMaterial: 'aluminum',
      freqRespLow: 15,
      freqRespHigh: 35,
      channelSeparation: 32,
      mountType: 'half-inch',
      notes: 'High Output MC - compatible with MM phono inputs',
      dataSource: 'Sumiko',
      dataSourceUrl: 'https://sumikophonocartridges.com/product/blue-point-no-2-mc-phono-cartridge/'
    },
    {
      brandId: brands.koetsu.id,
      modelName: 'Black Goldline',
      cartridgeType: 'MC',
      outputVoltage: 0.4,
      outputType: 'low',
      outputImpedance: 5,
      loadImpedance: 100,
      compliance: 5,
      complianceFreq: '100Hz',
      cartridgeWeight: 10.2,
      trackingForceMin: 1.8,
      trackingForceMax: 2.0,
      trackingForceRec: 1.9,
      stylusType: 'line-contact',
      cantilevMaterial: 'boron',
      bodyMaterial: 'aluminum',
      freqRespLow: 20,
      freqRespHigh: 100,
      channelSeparation: 25,
      mountType: 'half-inch',
      dataSource: 'Koetsu USA',
      dataSourceUrl: 'http://www.koetsuaudio.com/black'
    }
  ];

  for (const cart of cartridges) {
    try {
      await prisma.cartridge.upsert({
        where: { brandId_modelName: { brandId: cart.brandId, modelName: cart.modelName } },
        update: cart,
        create: cart
      });
      console.log(`✅ Cartridge: ${cart.modelName}`);
    } catch (e: any) {
      console.log(`⚠️ Cartridge ${cart.modelName}: ${e.message}`);
    }
  }

  // Tonearms
  const tonearms = [
    {
      brandId: brands.rega.id,
      modelName: 'RB330',
      armType: 'pivoted-9',
      effectiveLength: 237,
      effectiveMass: 11,
      armTubeType: 'straight',
      armTubeMaterial: 'aluminum',
      bearingType: 'gimbal',
      headshellType: 'integrated',
      vtaAdjustable: false,
      azimuthAdjust: false,
      vtfMin: 0,
      vtfMax: 3,
      vtfAdjustType: 'counterweight',
      antiSkateType: 'spring',
      mountingType: 'proprietary',
      dataSource: 'Rega',
      dataSourceUrl: 'https://www.rega.co.uk/products/rb330'
    },
    {
      brandId: brands.jelco.id,
      modelName: 'SA-750D',
      armType: 'pivoted-9',
      effectiveLength: 229,
      effectiveMass: 13.5,
      armTubeType: 'S-shape',
      bearingType: 'gimbal',
      headshellType: 'removable-SME',
      headshellWeight: 12,
      vtaAdjustable: true,
      azimuthAdjust: false,
      vtfMin: 0,
      vtfMax: 4,
      vtfAdjustType: 'counterweight',
      antiSkateType: 'weight',
      mountingType: 'universal',
      dataSource: 'Vinyl Engine',
      dataSourceUrl: 'https://www.vinylengine.com/library/jelco/sa-750d.shtml'
    },
    {
      brandId: brands.clearaudio.id,
      modelName: 'Verify',
      armType: 'pivoted-9',
      effectiveLength: 239,
      effectiveMass: 10.5,
      armTubeType: 'straight',
      armTubeMaterial: 'aluminum',
      bearingType: 'magnetic',
      headshellType: 'integrated',
      vtaAdjustable: true,
      azimuthAdjust: true,
      vtfMin: 0,
      vtfMax: 3,
      vtfAdjustType: 'counterweight',
      antiSkateType: 'magnetic',
      mountingType: 'proprietary',
      dataSource: 'Clearaudio',
      dataSourceUrl: 'https://www.clearaudio.de/en/products/tonearms-verify.php'
    }
  ];

  for (const arm of tonearms) {
    try {
      await prisma.tonearm.upsert({
        where: { brandId_modelName: { brandId: arm.brandId, modelName: arm.modelName } },
        update: arm,
        create: arm
      });
      console.log(`✅ Tonearm: ${arm.modelName}`);
    } catch (e: any) {
      console.log(`⚠️ Tonearm ${arm.modelName}: ${e.message}`);
    }
  }

  // SUTs
  const suts = [
    {
      brandId: brands.hashimoto.id,
      modelName: 'HM-3',
      transformerType: 'MC',
      gainDb: 26,
      gainRatio: '1:20',
      primaryImpedance: 12,
      secondaryImp: 47000,
      inputImpedance: '3-12',
      freqRespLow: 15,
      freqRespHigh: 50,
      coreType: 'permalloy',
      inputConnectors: 'RCA',
      outputConnectors: 'RCA',
      balanced: false,
      dataSource: 'Acoustic Dimension',
      dataSourceUrl: 'https://www.acoustic-dimension.com/hashimoto/hashimoto-mc-stepup-transformers.htm'
    }
  ];

  for (const sut of suts) {
    try {
      await prisma.sUT.upsert({
        where: { brandId_modelName: { brandId: sut.brandId, modelName: sut.modelName } },
        update: sut,
        create: sut
      });
      console.log(`✅ SUT: ${sut.modelName}`);
    } catch (e: any) {
      console.log(`⚠️ SUT ${sut.modelName}: ${e.message}`);
    }
  }

  // Phono Preamps
  const phonoPreamps = [
    {
      brandId: brands.grahamSlee.id,
      modelName: 'Gram Amp 2 SE',
      supportsMM: true,
      supportsMC: false,
      mmInputImpedance: 47000,
      mmInputCapacitance: 100,
      mmGain: 41,
      mcInputImpedance: '',
      gainAdjustable: false,
      impedanceAdjust: false,
      impedanceOptions: '',
      capacitanceAdjust: false,
      equalizationCurve: 'RIAA',
      freqRespLow: 20,
      freqRespHigh: 20,
      amplifierType: 'solid-state',
      powerSupply: 'external',
      inputConnectors: 'RCA',
      outputConnectors: 'RCA',
      balanced: false,
      dataSource: 'LP Gear',
      dataSourceUrl: 'https://www.lpgear.com/product/GA2PPNS.html'
    },
    {
      brandId: brands.proJect.id,
      modelName: 'Tube Box DS',
      supportsMM: true,
      supportsMC: true,
      mmInputImpedance: 47000,
      mmGain: 40,
      mcInputImpedance: '10-1000',
      mcGain: 60,
      gainAdjustable: true,
      gainRange: '40-60dB',
      impedanceAdjust: true,
      impedanceOptions: '10-1000',
      capacitanceAdjust: true,
      capacitanceRange: '47-367pF',
      equalizationCurve: 'RIAA',
      freqRespLow: 20,
      freqRespHigh: 20,
      amplifierType: 'tube',
      powerSupply: 'external',
      inputConnectors: 'RCA',
      outputConnectors: 'RCA',
      balanced: false,
      dataSource: 'Pro-Ject',
      dataSourceUrl: 'https://pro-jectusa.com/product/tube-box-ds2/'
    }
  ];

  for (const phono of phonoPreamps) {
    try {
      await prisma.phonoPreamp.upsert({
        where: { brandId_modelName: { brandId: phono.brandId, modelName: phono.modelName } },
        update: phono,
        create: phono
      });
      console.log(`✅ Phono Preamp: ${phono.modelName}`);
    } catch (e: any) {
      console.log(`⚠️ Phono ${phono.modelName}: ${e.message}`);
    }
  }

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
