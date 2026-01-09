/**
 * Component Matching Calculator
 * Calculates compatibility between tonearm, cartridge, SUT, and phono preamp
 * Based on formulas from docs/matching_guide.md
 */

export interface TonearmData {
  modelName: string;
  effectiveMass: number; // grams
  headshellWeight?: number; // grams (default: 5g)
  screwsWeight?: number; // grams (default: 1g)
}

export interface CartridgeData {
  modelName: string;
  compliance: number; // μm/mN (at 10Hz)
  weight: number; // grams
  outputVoltage: number; // mV
  internalImpedance: number; // Ω
  cartridgeType: 'MM' | 'MC';
}

export interface SUTData {
  modelName: string;
  turnsRatio: number; // e.g., 10 for 1:10, 20 for 1:20
  secondaryImpedance?: number; // Ω (default: 47000 for MM phono input)
  extraLoadResistance?: number; // Ω (parallel loading resistor on secondary)
}

export interface PhonoAmpData {
  modelName: string;
  inputImpedance: number; // Ω (MM input)
  minInputVoltage: number; // mV
  maxInputVoltage: number; // mV
}

export interface ResonanceResult {
  totalMass: number; // grams
  resonanceFrequency: number; // Hz
  isOptimal: boolean; // 8-12 Hz range
  recommendation: string;
}

export interface SUTMatchingResult {
  cartridgeLoadImpedance: number; // Ω - impedance seen by cartridge
  cartridgeInternalImpedance: number; // Ω - cartridge internal impedance
  recommendedMinLoad: number; // Ω - recommended minimum load (10x internal impedance)
  outputVoltage: number; // mV - voltage to phono amp
  voltageGain: number; // ratio
  turnsRatio: number; // SUT turns ratio (e.g., 10 for 1:10)
  isLoadOptimal: boolean; // >= 10x cartridge internal impedance
  isVoltageOptimal: boolean; // 2.5-10 mV range
  recommendation: string;
}

export interface MatchingResult {
  resonance: ResonanceResult;
  sut?: SUTMatchingResult;
  overallCompatibility: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  detailedAnalysis: string;
}

/**
 * Calculate tonearm-cartridge resonance frequency
 * Formula: fr ≈ 159 / √(M·C)
 * Optimal range: 8-12 Hz
 */
export function calculateResonance(
  tonearm: TonearmData,
  cartridge: CartridgeData
): ResonanceResult {
  // Default values for headshell and screws
  const headshellWeight = tonearm.headshellWeight || 5.0; // typical headshell
  const screwsWeight = tonearm.screwsWeight || 1.0; // typical screws

  // Total mass: M = marm,eff + mheadshell + mcartridge + mscrews
  const totalMass =
    tonearm.effectiveMass +
    headshellWeight +
    cartridge.weight +
    screwsWeight;

  // Resonance frequency: fr = 159 / √(M·C)
  const resonanceFrequency =
    159 / Math.sqrt(totalMass * cartridge.compliance);

  // Check if in optimal range (8-12 Hz)
  const isOptimal = resonanceFrequency >= 8 && resonanceFrequency <= 12;

  // Generate recommendation
  let recommendation = '';
  if (resonanceFrequency < 8) {
    recommendation = `공진 주파수가 ${resonanceFrequency.toFixed(1)} Hz로 너무 낮습니다. 워프나 발판 진동과 겹쳐 저역이 흐물흐물하고 왜곡이 발생할 수 있습니다. 더 가벼운 톤암이나 낮은 컴플라이언스 카트리지를 고려하세요.`;
  } else if (resonanceFrequency > 12) {
    recommendation = `공진 주파수가 ${resonanceFrequency.toFixed(1)} Hz로 너무 높습니다. 음악 대역과 겹쳐 톤 밸런스가 가벼워지고 트래킹 여유가 줄어들 수 있습니다. 더 무거운 톤암이나 높은 컴플라이언스 카트리지를 고려하세요.`;
  } else {
    recommendation = `공진 주파수가 ${resonanceFrequency.toFixed(1)} Hz로 최적 범위(8-12 Hz)에 있습니다. 톤암과 카트리지가 잘 매칭됩니다.`;
  }

  return {
    totalMass,
    resonanceFrequency,
    isOptimal,
    recommendation,
  };
}

/**
 * Calculate SUT matching with cartridge and phono amp
 *
 * Impedance formula: Rprimary = Rsecondary / N²
 * Voltage formula: Vout = N × Vin
 */
export function calculateSUTMatching(
  cartridge: CartridgeData,
  sut: SUTData,
  phonoAmp: PhonoAmpData
): SUTMatchingResult {
  const N = sut.turnsRatio;
  const Rsecondary = sut.secondaryImpedance || phonoAmp.inputImpedance;

  // Calculate parallel resistance if extra load is present
  let effectiveSecondary = Rsecondary;
  if (sut.extraLoadResistance) {
    // Parallel resistance: 1/R = 1/R1 + 1/R2
    effectiveSecondary =
      (Rsecondary * sut.extraLoadResistance) /
      (Rsecondary + sut.extraLoadResistance);
  }

  // Impedance seen by cartridge: Rload = Rsecondary / N²
  const cartridgeLoadImpedance = effectiveSecondary / (N * N);

  // Output voltage: Vout = N × Vin
  const outputVoltage = N * cartridge.outputVoltage;
  const voltageGain = N;

  // Check if load impedance is optimal (>= 10x cartridge internal impedance)
  const minRecommendedLoad = cartridge.internalImpedance * 10;
  const isLoadOptimal = cartridgeLoadImpedance >= minRecommendedLoad;

  // Check if output voltage is in optimal range (2.5-10 mV for MM phono)
  const isVoltageOptimal =
    outputVoltage >= phonoAmp.minInputVoltage &&
    outputVoltage <= phonoAmp.maxInputVoltage;

  // Generate recommendation
  let recommendation = '';
  const issues: string[] = [];

  if (!isLoadOptimal) {
    issues.push(
      `카트리지 부하 임피던스(${cartridgeLoadImpedance.toFixed(1)} Ω)가 권장값(${minRecommendedLoad.toFixed(0)} Ω 이상)보다 낮습니다. 고역이 죽고 다이내믹스가 줄어들 수 있습니다.`
    );
  }

  if (!isVoltageOptimal) {
    if (outputVoltage < phonoAmp.minInputVoltage) {
      issues.push(
        `출력 전압(${outputVoltage.toFixed(2)} mV)이 포노앰프 입력 범위(${phonoAmp.minInputVoltage}-${phonoAmp.maxInputVoltage} mV)보다 낮습니다. 더 높은 턴비의 SUT를 고려하세요.`
      );
    } else {
      issues.push(
        `출력 전압(${outputVoltage.toFixed(2)} mV)이 포노앰프 입력 범위(${phonoAmp.minInputVoltage}-${phonoAmp.maxInputVoltage} mV)보다 높습니다. 더 낮은 턴비의 SUT를 고려하세요.`
      );
    }
  }

  if (issues.length === 0) {
    recommendation = `SUT 매칭이 최적입니다. 카트리지 부하 ${cartridgeLoadImpedance.toFixed(1)} Ω, 출력 전압 ${outputVoltage.toFixed(2)} mV, 전압 이득 ${voltageGain}x`;
  } else {
    recommendation = issues.join(' ');
  }

  return {
    cartridgeLoadImpedance,
    cartridgeInternalImpedance: cartridge.internalImpedance,
    recommendedMinLoad: minRecommendedLoad,
    outputVoltage,
    voltageGain,
    turnsRatio: N,
    isLoadOptimal,
    isVoltageOptimal,
    recommendation,
  };
}

/**
 * Calculate overall component matching
 */
export function calculateMatching(
  tonearm: TonearmData,
  cartridge: CartridgeData,
  sut?: SUTData,
  phonoAmp?: PhonoAmpData
): MatchingResult {
  // Calculate resonance
  const resonance = calculateResonance(tonearm, cartridge);

  // Calculate SUT matching if applicable
  let sutMatching: SUTMatchingResult | undefined;
  if (sut && cartridge.cartridgeType === 'MC') {
    // Use provided phonoAmp or create default MM phono input
    const phonoAmpData = phonoAmp || {
      modelName: 'MM 포노 입력 (표준)',
      inputImpedance: 47000,
      minInputVoltage: 2.5,
      maxInputVoltage: 10.0,
    };
    sutMatching = calculateSUTMatching(cartridge, sut, phonoAmpData);
  }

  // Determine overall compatibility
  let overallCompatibility: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  const resonanceGood = resonance.isOptimal;
  const sutGood = sutMatching
    ? sutMatching.isLoadOptimal && sutMatching.isVoltageOptimal
    : true; // If no SUT, consider it OK

  if (resonanceGood && sutGood) {
    overallCompatibility = 'Excellent';
  } else if (resonanceGood || sutGood) {
    overallCompatibility = 'Good';
  } else if (
    Math.abs(resonance.resonanceFrequency - 10) < 4 ||
    (sutMatching && (sutMatching.isLoadOptimal || sutMatching.isVoltageOptimal))
  ) {
    overallCompatibility = 'Fair';
  } else {
    overallCompatibility = 'Poor';
  }

  // Generate detailed analysis
  const analysisLines: string[] = [];
  analysisLines.push('## 톤암-카트리지 매칭');
  analysisLines.push(`- 총 질량: ${resonance.totalMass.toFixed(1)}g`);
  analysisLines.push(
    `- 공진 주파수: ${resonance.resonanceFrequency.toFixed(1)} Hz ${resonance.isOptimal ? '✓' : '✗'}`
  );
  analysisLines.push(`- ${resonance.recommendation}`);

  if (sutMatching) {
    analysisLines.push('');
    analysisLines.push('## SUT-포노앰프 매칭');
    analysisLines.push(
      `- 카트리지 부하 임피던스: ${sutMatching.cartridgeLoadImpedance.toFixed(1)} Ω ${sutMatching.isLoadOptimal ? '✓' : '✗'}`
    );
    analysisLines.push(
      `- 포노앰프 입력 전압: ${sutMatching.outputVoltage.toFixed(2)} mV ${sutMatching.isVoltageOptimal ? '✓' : '✗'}`
    );
    analysisLines.push(`- 전압 이득: ${sutMatching.voltageGain}x`);
    analysisLines.push(`- ${sutMatching.recommendation}`);
  }

  analysisLines.push('');
  analysisLines.push(`## 종합 평가: ${overallCompatibility}`);

  return {
    resonance,
    sut: sutMatching,
    overallCompatibility,
    detailedAnalysis: analysisLines.join('\n'),
  };
}

/**
 * Format matching result as a readable string
 */
export function formatMatchingResult(result: MatchingResult): string {
  const lines: string[] = [];

  lines.push('═'.repeat(60));
  lines.push('컴포넌트 매칭 분석 결과');
  lines.push('═'.repeat(60));
  lines.push('');

  lines.push(result.detailedAnalysis);

  lines.push('');
  lines.push('═'.repeat(60));

  return lines.join('\n');
}
