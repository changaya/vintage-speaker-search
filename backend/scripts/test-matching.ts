/**
 * Test Component Matching Calculator
 * Demonstrates matching calculations with real component data
 */

import { PrismaClient } from '@prisma/client';
import {
  calculateMatching,
  formatMatchingResult,
  TonearmData,
  CartridgeData,
  SUTData,
  PhonoAmpData,
} from '../src/utils/matching-calculator';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 컴포넌트 매칭 계산 테스트\n');

  try {
    // Fetch sample tonearms
    const tonearms = await prisma.tonearm.findMany({
      include: { brand: true },
      take: 5,
    });

    // Fetch sample cartridges
    const cartridges = await prisma.cartridge.findMany({
      include: { brand: true },
      where: {
        compliance: { not: null },
        cartridgeWeight: { not: null },
        outputVoltage: { not: null },
      },
      take: 5,
    });

    console.log(
      `📊 데이터베이스에서 ${tonearms.length}개 톤암, ${cartridges.length}개 카트리지를 가져왔습니다.\n`
    );

    // Example 1: Tonearm-Cartridge matching (no SUT)
    if (tonearms.length > 0 && cartridges.length > 0) {
      const tonearm = tonearms[0];
      const cartridge = cartridges[0];

      console.log('═'.repeat(70));
      console.log(
        `예시 1: ${tonearm.brand.name} ${tonearm.modelName} + ${cartridge.brand.name} ${cartridge.modelName}`
      );
      console.log('═'.repeat(70));
      console.log('');

      const tonearmData: TonearmData = {
        modelName: tonearm.modelName,
        effectiveMass: tonearm.effectiveMass,
      };

      const cartridgeData: CartridgeData = {
        modelName: cartridge.modelName,
        compliance: cartridge.compliance || 10,
        weight: cartridge.cartridgeWeight || 5,
        outputVoltage: cartridge.outputVoltage || 0.3,
        internalImpedance: cartridge.outputImpedance || 10,
        cartridgeType: (cartridge.cartridgeType as 'MM' | 'MC') || 'MC',
      };

      const result1 = calculateMatching(tonearmData, cartridgeData);
      console.log(formatMatchingResult(result1));
      console.log('\n');
    }

    // Example 2: MC Cartridge with SUT
    const mcCartridge = cartridges.find((c) => c.cartridgeType === 'MC');
    if (tonearms.length > 0 && mcCartridge) {
      const tonearm = tonearms[1] || tonearms[0];

      console.log('═'.repeat(70));
      console.log(
        `예시 2: MC 카트리지 + SUT 매칭 (${tonearm.brand.name} ${tonearm.modelName} + ${mcCartridge.brand.name} ${mcCartridge.modelName})`
      );
      console.log('═'.repeat(70));
      console.log('');

      const tonearmData: TonearmData = {
        modelName: tonearm.modelName,
        effectiveMass: tonearm.effectiveMass,
      };

      const cartridgeData: CartridgeData = {
        modelName: mcCartridge.modelName,
        compliance: mcCartridge.compliance || 10,
        weight: mcCartridge.cartridgeWeight || 5,
        outputVoltage: mcCartridge.outputVoltage || 0.3,
        internalImpedance: mcCartridge.outputImpedance || 10,
        cartridgeType: 'MC',
      };

      // Test with different SUT ratios
      const sutRatios = [10, 20, 30];
      const phonoAmp: PhonoAmpData = {
        modelName: 'Generic MM Phono',
        inputImpedance: 47000, // 47kΩ standard MM input
        minInputVoltage: 2.5,
        maxInputVoltage: 10.0,
      };

      for (const ratio of sutRatios) {
        const sut: SUTData = {
          modelName: `1:${ratio} SUT`,
          turnsRatio: ratio,
        };

        console.log(`\n--- SUT 턴비 1:${ratio} ---`);
        const result = calculateMatching(
          tonearmData,
          cartridgeData,
          sut,
          phonoAmp
        );

        if (result.sut) {
          console.log(
            `카트리지 부하: ${result.sut.cartridgeLoadImpedance.toFixed(1)} Ω ${result.sut.isLoadOptimal ? '✓' : '✗'}`
          );
          console.log(
            `출력 전압: ${result.sut.outputVoltage.toFixed(2)} mV ${result.sut.isVoltageOptimal ? '✓' : '✗'}`
          );
          console.log(`전압 이득: ${result.sut.voltageGain}x`);
          console.log(`평가: ${result.sut.recommendation}`);
        }
      }

      console.log('\n');
    }

    // Example 3: Detailed matching for specific components
    console.log('═'.repeat(70));
    console.log('예시 3: 상세 매칭 분석');
    console.log('═'.repeat(70));
    console.log('');

    // SME 3009 + Denon DL-103
    const sme3009 = tonearms.find((t) =>
      t.modelName.toLowerCase().includes('3009')
    );
    const dl103 = cartridges.find((c) =>
      c.modelName.toLowerCase().includes('dl-103')
    );

    if (sme3009 && dl103) {
      console.log(
        `컴포넌트: ${sme3009.brand.name} ${sme3009.modelName} + ${dl103.brand.name} ${dl103.modelName}`
      );
      console.log('');

      const tonearmData: TonearmData = {
        modelName: sme3009.modelName,
        effectiveMass: sme3009.effectiveMass,
      };

      const cartridgeData: CartridgeData = {
        modelName: dl103.modelName,
        compliance: dl103.compliance || 5,
        weight: dl103.cartridgeWeight || 8.5,
        outputVoltage: dl103.outputVoltage || 0.3,
        internalImpedance: dl103.outputImpedance || 40,
        cartridgeType: 'MC',
      };

      // With 1:10 SUT
      const sut: SUTData = {
        modelName: 'Denon AU-300LC',
        turnsRatio: 10,
      };

      const phonoAmp: PhonoAmpData = {
        modelName: 'MM Phono Input',
        inputImpedance: 47000,
        minInputVoltage: 2.5,
        maxInputVoltage: 10.0,
      };

      const result = calculateMatching(
        tonearmData,
        cartridgeData,
        sut,
        phonoAmp
      );
      console.log(formatMatchingResult(result));
    } else {
      console.log(
        '⚠️  SME 3009 또는 Denon DL-103을 찾을 수 없습니다. 다른 조합으로 테스트합니다.\n'
      );

      if (tonearms.length > 0 && cartridges.length > 0) {
        const tonearmData: TonearmData = {
          modelName: tonearms[0].modelName,
          effectiveMass: tonearms[0].effectiveMass,
        };

        const cartridgeData: CartridgeData = {
          modelName: cartridges[0].modelName,
          compliance: cartridges[0].compliance || 10,
          weight: cartridges[0].cartridgeWeight || 5,
          outputVoltage: cartridges[0].outputVoltage || 0.3,
          internalImpedance: cartridges[0].outputImpedance || 10,
          cartridgeType:
            (cartridges[0].cartridgeType as 'MM' | 'MC') || 'MC',
        };

        const result = calculateMatching(tonearmData, cartridgeData);
        console.log(formatMatchingResult(result));
      }
    }

    // Example 4: Show calculation formulas
    console.log('\n');
    console.log('═'.repeat(70));
    console.log('사용된 공식');
    console.log('═'.repeat(70));
    console.log('');
    console.log('1. 톤암-카트리지 공진 주파수:');
    console.log('   fr = 159 / √(M × C)');
    console.log('   여기서 M = 톤암 유효질량 + 헤드셸 + 카트리지 + 나사 (gram)');
    console.log('   C = 카트리지 컴플라이언스 (μm/mN)');
    console.log('   최적 범위: 8-12 Hz');
    console.log('');
    console.log('2. SUT 임피던스 반사:');
    console.log('   Rprimary = Rsecondary / N²');
    console.log('   여기서 N = 턴비 (예: 1:10이면 N=10)');
    console.log(
      '   Rsecondary = 포노앰프 입력 임피던스 (보통 47kΩ for MM)'
    );
    console.log('');
    console.log('3. SUT 출력 전압:');
    console.log('   Vout = N × Vin');
    console.log('   최적 범위: 2.5-10 mV (MM 포노앰프 입력)');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
