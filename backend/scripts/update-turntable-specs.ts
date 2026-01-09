/**
 * Update existing turntable specs to English
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function translateMotorType(japanese: string): string {
  const translations: Record<string, string> = {
    'ブラシレスDCモーター': 'Brushless DC Motor',
    'ブラシレスDC': 'Brushless DC',
    '超低速電子整流子モーター': 'Ultra-low Speed Electronic Commutator Motor',
    'リニアブラシアンドスロットレスサーボモーター': 'Linear Brushless Slotless Servo Motor',
    'DCサーボモーター': 'DC Servo Motor',
    'DCサーボ': 'DC Servo',
    'ACシンクロナスモーター': 'AC Synchronous Motor',
    'ACシンクロナス': 'AC Synchronous',
    'ダイレクトドライブ': 'Direct Drive',
  };

  for (const [jp, en] of Object.entries(translations)) {
    if (japanese.includes(jp)) {
      return en;
    }
  }

  return japanese;
}

function translatePlatterMaterial(japanese: string): string {
  const translations: Record<string, string> = {
    'アルミダイキャスト': 'Die-cast Aluminum',
    'アルミニウム': 'Aluminum',
    'アルミ': 'Aluminum',
    'アクリル': 'Acrylic',
    'ガラス': 'Glass',
    '真鍮': 'Brass',
    'スチール': 'Steel',
    '鋼鉄': 'Steel',
  };

  for (const [jp, en] of Object.entries(translations)) {
    if (japanese.includes(jp)) {
      return en;
    }
  }

  return japanese;
}

async function updateTurntableSpecs() {
  console.log('🔄 Updating turntable specs to English...');

  try {
    // Get all turntables
    const turntables = await prisma.turntableBase.findMany({
      include: {
        brand: true,
      },
    });

    let updateCount = 0;

    for (const turntable of turntables) {
      let needsUpdate = false;
      const updates: any = {};

      // Check and translate motor type
      if (turntable.motorType) {
        const translated = translateMotorType(turntable.motorType);
        if (translated !== turntable.motorType) {
          updates.motorType = translated;
          needsUpdate = true;
          console.log(
            `  📝 ${turntable.brand.name} ${turntable.modelName}:`
          );
          console.log(`     Motor: "${turntable.motorType}" → "${translated}"`);
        }
      }

      // Check and translate platter material
      if (turntable.platterMaterial) {
        const translated = translatePlatterMaterial(turntable.platterMaterial);
        if (translated !== turntable.platterMaterial) {
          updates.platterMaterial = translated;
          needsUpdate = true;
          console.log(
            `  📝 ${turntable.brand.name} ${turntable.modelName}:`
          );
          console.log(
            `     Platter: "${turntable.platterMaterial}" → "${translated}"`
          );
        }
      }

      // Update if needed
      if (needsUpdate) {
        await prisma.turntableBase.update({
          where: { id: turntable.id },
          data: updates,
        });
        updateCount++;
      }
    }

    console.log(`\n✅ Updated ${updateCount} turntable(s)`);
    console.log(`📊 Total turntables checked: ${turntables.length}`);
  } catch (error) {
    console.error('❌ Error updating turntable specs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTurntableSpecs();
