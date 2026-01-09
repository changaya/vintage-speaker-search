/**
 * MatchingResults
 * Displays matching calculation results with tabs and charts
 */

'use client';

import { useState } from 'react';
import type { MatcherResponse, Tonearm, Cartridge, SUT, PhonoPreamp } from '@/types/matcher';
import { getCompatibilityColor, getImageUrl } from '@/lib/matcher-api';
import MarkdownDisplay from './MarkdownDisplay';
import ResonanceChart from './ResonanceChart';
import CalculationDetail from './CalculationDetail';

interface MatchingResultsProps {
  result: MatcherResponse;
  selectedComponents: {
    tonearm: Tonearm | null;
    cartridge: Cartridge | null;
    sut: SUT | null;
    phonoPreamp: PhonoPreamp | null;
  };
}

export default function MatchingResults({ result, selectedComponents }: MatchingResultsProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'chart' | 'calculation' | 'components'>('analysis');

  const { matching, components } = result;
  const compatibilityColor = getCompatibilityColor(matching.overallCompatibility);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with Compatibility Badge */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Matching Results</h2>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${compatibilityColor}`}
          >
            {matching.overallCompatibility}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analysis'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Detailed Analysis
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'chart'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resonance Chart
          </button>
          <button
            onClick={() => setActiveTab('calculation')}
            className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'calculation'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Calculation Detail
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'components'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Component Details
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <MarkdownDisplay content={matching.detailedAnalysis} />
          </div>
        )}

        {/* Chart Tab */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resonance Frequency Analysis
            </h3>
            <ResonanceChart resonance={matching.resonance} />

            {/* Additional Details */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Total Mass</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {matching.resonance.totalMass.toFixed(1)} g
                </dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Resonance Frequency</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {matching.resonance.resonanceFrequency.toFixed(1)} Hz
                  {matching.resonance.isOptimal && (
                    <span className="ml-2 text-sm text-green-600">✓ Optimal</span>
                  )}
                </dd>
              </div>
            </div>

            {/* Weight Estimation Warning */}
            {components.cartridge.weightEstimated && components.cartridge.weightEstimationInfo && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">추정된 무게 사용</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        선택한 카트리지의 무게 데이터가 없어, <strong>{components.cartridge.weightEstimationInfo.source}</strong>를 사용하여
                        <strong> {components.cartridge.weight}g</strong>로 추정했습니다.
                      </p>
                      <p className="mt-1">
                        실제 무게와 다를 수 있으니 참고용으로만 사용하세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUT Details if present */}
            {matching.sut && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  카트리지-SUT 매칭 상세
                </h4>

                {/* SUT Turns Ratio */}
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">SUT 턴비</span>
                    <span className="text-lg font-bold text-blue-900">1:{matching.sut.turnsRatio}</span>
                  </div>
                </div>

                {/* Impedance Matching */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">임피던스 매칭</h5>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg border ${
                      matching.sut.isLoadOptimal
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <dt className="text-xs font-medium text-gray-600">카트리지 내부 임피던스</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {matching.sut.cartridgeInternalImpedance.toFixed(1)} Ω
                      </dd>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      matching.sut.isLoadOptimal
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <dt className="text-xs font-medium text-gray-600">부하 임피던스</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {matching.sut.cartridgeLoadImpedance.toFixed(1)} Ω
                        {matching.sut.isLoadOptimal ? (
                          <span className="ml-2 text-sm text-green-600">✓ 최적</span>
                        ) : (
                          <span className="ml-2 text-sm text-amber-600">⚠ 주의</span>
                        )}
                      </dd>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      matching.sut.isLoadOptimal
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <dt className="text-xs font-medium text-gray-600">권장 최소 부하</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {matching.sut.recommendedMinLoad.toFixed(0)} Ω
                      </dd>
                      <dd className="text-xs text-gray-500 mt-1">
                        (내부 임피던스 × 10)
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Voltage Matching */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">전압 매칭</h5>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg border ${
                      matching.sut.isVoltageOptimal
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <dt className="text-xs font-medium text-gray-600">포노앰프 입력 전압</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {matching.sut.outputVoltage.toFixed(2)} mV
                        {matching.sut.isVoltageOptimal ? (
                          <span className="ml-2 text-sm text-green-600">✓ 최적</span>
                        ) : (
                          <span className="ml-2 text-sm text-amber-600">⚠ 주의</span>
                        )}
                      </dd>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <dt className="text-xs font-medium text-gray-600">전압 이득</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {matching.sut.voltageGain}x ({(20 * Math.log10(matching.sut.voltageGain)).toFixed(1)} dB)
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-lg ${
                  matching.sut.isLoadOptimal && matching.sut.isVoltageOptimal
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {matching.sut.isLoadOptimal && matching.sut.isVoltageOptimal ? (
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        matching.sut.isLoadOptimal && matching.sut.isVoltageOptimal
                          ? 'text-green-800'
                          : 'text-amber-800'
                      }`}>
                        매칭 분석
                      </h3>
                      <p className={`mt-2 text-sm ${
                        matching.sut.isLoadOptimal && matching.sut.isVoltageOptimal
                          ? 'text-green-700'
                          : 'text-amber-700'
                      }`}>
                        {matching.sut.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calculation Detail Tab */}
        {activeTab === 'calculation' && (
          <div className="space-y-6">
            <CalculationDetail result={result} />
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tonearm */}
            {components.tonearm && (
              <div className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {components.tonearm.imageUrl && (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <img
                        src={getImageUrl(components.tonearm.imageUrl) || ''}
                        alt={`${components.tonearm.brand} ${components.tonearm.model}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500">Tonearm</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {components.tonearm.brand} {components.tonearm.model}
                    </p>
                    <dl className="mt-2 space-y-1 text-sm">
                      {components.tonearm.effectiveLength && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Effective Length:</dt>
                          <dd className="text-gray-900 font-medium">
                            {Math.round(components.tonearm.effectiveLength / 25.4)}"
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Effective Mass:</dt>
                        <dd className="text-gray-900 font-medium">
                          {components.tonearm.effectiveMass}g
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Type:</dt>
                        <dd className="text-gray-900 font-medium">
                          {components.tonearm.armType}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Cartridge */}
            {components.cartridge && (
              <div className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {components.cartridge.imageUrl && (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <img
                        src={getImageUrl(components.cartridge.imageUrl) || ''}
                        alt={`${components.cartridge.brand} ${components.cartridge.model}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500">Cartridge</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {components.cartridge.brand} {components.cartridge.model}
                    </p>
                    <dl className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Type:</dt>
                        <dd className="text-gray-900 font-medium">
                          {components.cartridge.type}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Compliance:</dt>
                        <dd className="text-gray-900 font-medium">
                          {components.cartridge.compliance} μm/mN
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Weight:</dt>
                        <dd className="text-gray-900 font-medium">
                          {components.cartridge.weight}g
                          {components.cartridge.weightEstimated && (
                            <span className="ml-1 text-xs text-amber-600" title="추정된 무게">*</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* SUT */}
            {components.sut && (
              <div className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {components.sut.imageUrl && (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <img
                        src={getImageUrl(components.sut.imageUrl) || ''}
                        alt={`${components.sut.brand} ${components.sut.model}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500">SUT</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {components.sut.brand} {components.sut.model}
                    </p>
                    <dl className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Gain Ratio:</dt>
                        <dd className="text-gray-900 font-medium">
                          {components.sut.gainRatio || `${components.sut.gainDb}dB`}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Phono Preamp */}
            {components.phonoPreamp && (
              <div className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {components.phonoPreamp.imageUrl && (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <img
                        src={getImageUrl(components.phonoPreamp.imageUrl) || ''}
                        alt={`${components.phonoPreamp.brand} ${components.phonoPreamp.model}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500">Phono Preamp</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {components.phonoPreamp.brand} {components.phonoPreamp.model}
                    </p>
                    <dl className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Type:</dt>
                        <dd className="text-gray-900 font-medium">
                          {components.phonoPreamp.preampType}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with timestamp */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <p className="text-xs text-gray-500">
          Calculated at {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
