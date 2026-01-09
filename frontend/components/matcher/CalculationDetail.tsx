/**
 * CalculationDetail
 * Displays step-by-step matching calculations with formulas
 */

'use client';

import type { MatcherResponse } from '@/types/matcher';

interface CalculationDetailProps {
  result: MatcherResponse;
}

export default function CalculationDetail({ result }: CalculationDetailProps) {
  const { matching, components } = result;
  const { resonance, sut } = matching;

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">매칭 계산 상세</h3>
        <p className="text-sm text-blue-800">
          톤암과 카트리지의 매칭은 기계적 공진 이론을 기반으로 합니다.
          이 페이지에서는 실제 수학 공식을 사용하여 단계별로 계산 과정을 설명합니다.
        </p>
      </div>

      {/* Step 1: Total Mass Calculation */}
      <div className="border rounded-lg p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold mr-3">
            1
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">총 질량 계산</h4>
            <p className="text-sm text-gray-600 mt-1">
              톤암 유효질량 + 헤드셸 + 카트리지 무게를 합산합니다.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="font-mono text-sm">
            <div className="text-gray-700 mb-2">M = m<sub>arm,eff</sub> + m<sub>headshell</sub> + m<sub>cartridge</sub></div>
            <div className="text-gray-600 text-xs mb-3">
              (톤암 유효질량 + 헤드셸 무게 + 카트리지 무게)
            </div>

            <div className="space-y-1">
              <div className="text-gray-700">
                M = {components.tonearm.effectiveMass}g + 0g + {components.cartridge.weight}g
                {components.cartridge.weightEstimated && (
                  <span className="text-amber-600 text-xs ml-2">(카트리지 무게는 추정값)</span>
                )}
              </div>
              <div className="text-primary-600 font-semibold text-base pt-2 border-t border-gray-300">
                M = {resonance.totalMass.toFixed(1)}g
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>참고:</strong> 헤드셸 무게는 대부분의 경우 톤암 유효질량에 포함되어 있습니다.
        </div>
      </div>

      {/* Step 2: Resonance Frequency Calculation */}
      <div className="border rounded-lg p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold mr-3">
            2
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">공진 주파수 계산</h4>
            <p className="text-sm text-gray-600 mt-1">
              스프링-질량 시스템의 공진 주파수를 계산합니다.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="font-mono text-sm">
            <div className="text-gray-700 mb-3">
              <div className="text-center text-base mb-2">
                f<sub>r</sub> ≈ <span className="text-lg">159</span> / √(M · C)
              </div>
              <div className="text-gray-600 text-xs text-center">
                여기서 M은 총 질량(g), C는 카트리지 컴플라이언스(μm/mN)
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="text-gray-700">
                <div>f<sub>r</sub> ≈ 159 / √({resonance.totalMass.toFixed(1)} × {components.cartridge.compliance})</div>
              </div>
              <div className="text-gray-700">
                <div>f<sub>r</sub> ≈ 159 / √{(resonance.totalMass * components.cartridge.compliance).toFixed(1)}</div>
              </div>
              <div className="text-gray-700">
                <div>f<sub>r</sub> ≈ 159 / {Math.sqrt(resonance.totalMass * components.cartridge.compliance).toFixed(2)}</div>
              </div>
              <div className="text-primary-600 font-semibold text-base pt-2 border-t border-gray-300">
                f<sub>r</sub> ≈ {resonance.resonanceFrequency.toFixed(1)} Hz
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-blue-900 mb-2">공식의 의미</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 톤암 질량이 클수록(무거운 암) 공진 주파수는 <strong>낮아집니다</strong></li>
            <li>• 컴플라이언스가 클수록(부드러운 서스펜션) 공진 주파수는 <strong>낮아집니다</strong></li>
            <li>• 두 값의 곱의 제곱근에 반비례하는 관계입니다</li>
          </ul>
        </div>
      </div>

      {/* Step 3: Optimal Range Verification */}
      <div className="border rounded-lg p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold mr-3">
            3
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">최적 범위 검증</h4>
            <p className="text-sm text-gray-600 mt-1">
              계산된 공진 주파수가 권장 범위(8-12 Hz)에 있는지 확인합니다.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-gray-900">
              {resonance.resonanceFrequency.toFixed(1)} Hz
            </div>
            <div>
              {resonance.isOptimal ? (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                  ✓ 최적 범위
                </span>
              ) : (
                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                  ⚠ 범위 벗어남
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-300 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">권장 범위:</span>
              <span className="font-semibold text-gray-900">8 - 12 Hz</span>
            </div>
            <div className="relative pt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute left-0 h-2 bg-red-200" style={{ width: '33.33%' }}></div>
                <div className="absolute left-1/3 h-2 bg-green-200" style={{ width: '33.33%' }}></div>
                <div className="absolute left-2/3 h-2 bg-red-200" style={{ width: '33.34%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>&lt; 8 Hz</span>
                <span className="text-green-600 font-semibold">8-12 Hz</span>
                <span>&gt; 12 Hz</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className={`p-4 rounded-lg ${resonance.isOptimal ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <h5 className={`font-semibold mb-2 ${resonance.isOptimal ? 'text-green-900' : 'text-yellow-900'}`}>
              {resonance.isOptimal ? '✓ 권장사항' : '⚠ 주의사항'}
            </h5>
            <p className={`text-sm ${resonance.isOptimal ? 'text-green-800' : 'text-yellow-800'}`}>
              {resonance.recommendation}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">범위별 특성</h5>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <strong className="text-red-600">&lt; 8 Hz:</strong> 워프·발판 진동과 겹쳐 저역이 흐물흐물하고,
                우퍼가 크게 흔들리며 왜곡이 발생할 수 있습니다.
              </li>
              <li>
                <strong className="text-green-600">8-12 Hz:</strong> 음악 대역과 분리되어 안정적인 트래킹과
                자연스러운 톤 밸런스를 제공합니다.
              </li>
              <li>
                <strong className="text-red-600">&gt; 12 Hz:</strong> 음악 대역(특히 저역 상부)과 겹쳐
                톤 밸런스가 가벼워지고 트래킹 여유가 줄어듭니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SUT Calculations (if present) */}
      {sut && (
        <>
          {/* SUT Section Header with Component Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">카트리지-SUT 매칭 계산</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-purple-700 font-medium">카트리지</div>
                <div className="text-purple-900">{components.cartridge.brand} {components.cartridge.model}</div>
                <div className="text-purple-600 text-xs mt-1">
                  {components.cartridge.type} • {components.cartridge.outputVoltage || '?'} mV • {sut.cartridgeInternalImpedance} Ω
                </div>
              </div>
              <div>
                <div className="text-purple-700 font-medium">SUT</div>
                <div className="text-purple-900">{components.sut?.brand} {components.sut?.model}</div>
                <div className="text-purple-600 text-xs mt-1">
                  턴비 1:{sut.turnsRatio}
                </div>
              </div>
              <div>
                <div className="text-purple-700 font-medium">포노 프리앰프</div>
                <div className="text-purple-900">{components.phonoPreamp?.brand || 'MM 입력'} {components.phonoPreamp?.model || ''}</div>
                <div className="text-purple-600 text-xs mt-1">
                  입력 임피던스: 47kΩ (표준)
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: SUT Impedance Calculation */}
          <div className="border rounded-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold mr-3">
                4
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">SUT 임피던스 계산</h4>
                <p className="text-sm text-gray-600 mt-1">
                  SUT의 턴비에 따라 카트리지가 보는 부하 임피던스를 계산합니다.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="font-mono text-sm">
                <div className="text-gray-700 mb-3">
                  <div className="text-center text-base mb-2">
                    R<sub>primary</sub> = R<sub>secondary</sub> / N²
                  </div>
                  <div className="text-gray-600 text-xs text-center">
                    여기서 N은 SUT 턴비(전압비), R<sub>secondary</sub>는 포노앰프 입력 임피던스
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="text-gray-700">
                    <div>R<sub>load</sub> = 47,000Ω / {sut.voltageGain}²</div>
                  </div>
                  <div className="text-gray-700">
                    <div>R<sub>load</sub> = 47,000Ω / {Math.pow(sut.voltageGain, 2)}</div>
                  </div>
                  <div className="text-primary-600 font-semibold text-base pt-2 border-t border-gray-300">
                    R<sub>load</sub> ≈ {sut.cartridgeLoadImpedance.toFixed(1)}Ω
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">임피던스 매칭 가이드</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 권장: 카트리지 내부 임피던스의 <strong>10배 이상</strong></li>
                <li>• 너무 낮은 부하(3배 이하): 고역 감쇠, 다이내믹스 감소</li>
                <li>• 너무 높은 부하: 노이즈 증가, 딱딱한 질감</li>
              </ul>
              <div className="mt-3 grid md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white p-2 rounded">
                  <div className="text-blue-700 text-xs">카트리지 내부 임피던스</div>
                  <div className="font-semibold text-blue-900">{sut.cartridgeInternalImpedance.toFixed(1)} Ω</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-blue-700 text-xs">실제 부하 임피던스</div>
                  <div className="font-semibold text-blue-900">{sut.cartridgeLoadImpedance.toFixed(1)} Ω</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-blue-700 text-xs">권장 최소 부하</div>
                  <div className="font-semibold text-blue-900">{sut.recommendedMinLoad.toFixed(0)} Ω</div>
                </div>
              </div>
              <div className={`mt-3 p-3 rounded ${sut.isLoadOptimal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <strong>{sut.isLoadOptimal ? '✓' : '⚠'}</strong> 현재 로딩: {sut.isLoadOptimal ? '최적' : '확인 필요'}
                ({sut.cartridgeLoadImpedance >= sut.recommendedMinLoad ? `${(sut.cartridgeLoadImpedance / sut.cartridgeInternalImpedance).toFixed(1)}배` : `권장보다 낮음`})
              </div>
            </div>
          </div>

          {/* Step 5: SUT Voltage Calculation */}
          <div className="border rounded-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold mr-3">
                5
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">SUT 전압 변환 계산</h4>
                <p className="text-sm text-gray-600 mt-1">
                  SUT를 통한 전압 증폭을 계산합니다.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="font-mono text-sm">
                <div className="text-gray-700 mb-3">
                  <div className="text-center text-base mb-2">
                    V<sub>out</sub> = N × V<sub>in</sub>
                  </div>
                  <div className="text-gray-600 text-xs text-center">
                    여기서 N은 SUT 턴비, V<sub>in</sub>은 카트리지 출력 전압
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="text-gray-700">
                    <div>V<sub>phono</sub> = {sut.voltageGain} × {components.cartridge.outputVoltage || '(카트리지 출력 전압)'}mV</div>
                  </div>
                  <div className="text-primary-600 font-semibold text-base pt-2 border-t border-gray-300">
                    V<sub>phono</sub> ≈ {sut.outputVoltage.toFixed(2)}mV
                  </div>
                  {!components.cartridge.outputVoltage && (
                    <div className="text-amber-600 text-xs mt-2">
                      ⚠ 카트리지 출력 전압 데이터가 없어 계산에 기본값이 사용되었습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">전압 레벨 가이드</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• MM 포노입 권장 범위: <strong>2.5 - 10 mV</strong></li>
                <li>• 너무 낮으면: 노이즈 플로어 상승</li>
                <li>• 너무 높으면: 과부하, 왜곡 발생</li>
              </ul>
              <div className={`mt-3 p-3 rounded ${sut.isVoltageOptimal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <strong>{sut.isVoltageOptimal ? '✓' : '⚠'}</strong> 현재 출력 전압: {sut.isVoltageOptimal ? '최적 범위' : '확인 필요'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* References */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">참고 자료</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 공진 주파수 공식: f<sub>r</sub> ≈ 159/√(M·C)</li>
          <li>• 최적 공진 범위: 8-12 Hz (일반적인 권장사항)</li>
          <li>• SUT 임피던스 공식: R<sub>primary</sub> = R<sub>secondary</sub> / N²</li>
          <li>• SUT 전압 공식: V<sub>out</sub> = N × V<sub>in</sub></li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          상세한 이론적 배경은 <a href="/docs/matching_guide.md" className="text-primary-600 hover:underline">매칭 가이드</a>를 참조하세요.
        </p>
      </div>
    </div>
  );
}
