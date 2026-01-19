'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import ImageCarousel, { CarouselImage } from '@/components/ui/ImageCarousel';

// =============================================================================
// Types
// =============================================================================

interface Brand {
  id: string;
  name: string;
  country: string | null;
}

interface ProductionPeriod {
  id: string;
  startYear: number;
  endYear: number | null;
  originalPrice: string | null;
  originalPriceCurrency: string | null;
}

interface PhonoPreamp {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber: string | null;
  supportsMM: boolean;
  supportsMC: boolean;
  mmInputImpedance: number | null;
  mmInputCapacitance: number | null;
  mmGain: number | null;
  mcInputImpedance: string | null;
  mcInputCapacitance: number | null;
  mcGain: number | null;
  gainAdjustable: boolean;
  gainRange: string | null;
  impedanceAdjust: boolean;
  impedanceOptions: string | null;
  capacitanceAdjust: boolean;
  capacitanceRange: string | null;
  equalizationCurve: string | null;
  freqRespLow: number | null;
  freqRespHigh: number | null;
  thd: number | null;
  snr: number | null;
  inputConnectors: string | null;
  outputConnectors: string | null;
  balanced: boolean;
  powerSupply: string | null;
  voltage: string | null;
  amplifierType: string | null;
  width: number | null;
  depth: number | null;
  height: number | null;
  weight: number | null;
  imageUrl: string | null;
  specSheetUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
  brand: Brand;
  productionPeriods: ProductionPeriod[];
  _count?: {
    compatibleCarts: number;
    userSetups: number;
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

const formatProductionYears = (periods: ProductionPeriod[]): string => {
  if (!periods || periods.length === 0) return 'Unknown';
  
  const sorted = [...periods].sort((a, b) => a.startYear - b.startYear);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  
  if (first.startYear === last.endYear || (!last.endYear && periods.length === 1)) {
    return first.endYear ? first.startYear + ' - ' + first.endYear : first.startYear + ' - Present';
  }
  
  return first.startYear + ' - ' + (last.endYear || 'Present');
};

// =============================================================================
// Component
// =============================================================================

export default function PhonoPreampDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [phonoPreamp, setPhonoPreamp] = useState<PhonoPreamp | null>(null);
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch phono preamp data and images in parallel
        const [phonoRes, imagesRes] = await Promise.all([
          api.get('/api/phono-preamps/' + id),
          api.get('/api/component-images/phonopreamp/' + id),
        ]);

        setPhonoPreamp(phonoRes.data);
        setImages(imagesRes.data.images || []);
      } catch (err: any) {
        console.error('Error fetching phono preamp:', err);
        if (err.response?.status === 404) {
          setError('Phono Preamp not found');
        } else {
          setError('Failed to load phono preamp details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading phono preamp details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !phonoPreamp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || 'Phono Preamp not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The phono preamp you are looking for might have been removed or does not exist.
          </p>
          <Link
            href="/phono-preamps"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Phono Preamps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-primary-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/phono-preamps" className="hover:text-primary-600">Phono Preamps</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">
              {phonoPreamp.brand.name} {phonoPreamp.modelName}
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Carousel */}
            <div>
              <ImageCarousel
                images={images}
                showThumbnails={images.length > 1}
                aspectRatio="4/3"
                objectFit="contain"
                placeholderIcon="🎛️"
                alt={phonoPreamp.brand.name + ' ' + phonoPreamp.modelName}
              />
            </div>

            {/* Details */}
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {phonoPreamp.brand.name}
                      {phonoPreamp.brand.country && ' · ' + phonoPreamp.brand.country}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {phonoPreamp.modelName}
                    </h1>
                    {phonoPreamp.modelNumber && (
                      <p className="text-gray-500 mt-1">Model: {phonoPreamp.modelNumber}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {phonoPreamp.amplifierType && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                        {phonoPreamp.amplifierType}
                      </span>
                    )}
                    {phonoPreamp.balanced && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Balanced
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cartridge Type Support */}
              <div className="flex gap-2 mb-6">
                <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + 
                  (phonoPreamp.supportsMM ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500')}>
                  MM {phonoPreamp.supportsMM ? '✓' : '✗'}
                </span>
                <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + 
                  (phonoPreamp.supportsMC ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500')}>
                  MC {phonoPreamp.supportsMC ? '✓' : '✗'}
                </span>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {phonoPreamp.mmGain !== null && phonoPreamp.supportsMM && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">MM Gain</p>
                    <p className="text-sm font-medium text-gray-900">{phonoPreamp.mmGain}dB</p>
                  </div>
                )}
                {phonoPreamp.mcGain !== null && phonoPreamp.supportsMC && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">MC Gain</p>
                    <p className="text-sm font-medium text-gray-900">{phonoPreamp.mcGain}dB</p>
                  </div>
                )}
                {phonoPreamp.snr !== null && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">S/N Ratio</p>
                    <p className="text-sm font-medium text-gray-900">{phonoPreamp.snr}dB</p>
                  </div>
                )}
                {phonoPreamp.thd !== null && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">THD</p>
                    <p className="text-sm font-medium text-gray-900">{phonoPreamp.thd}%</p>
                  </div>
                )}
              </div>

              {/* MM Input Section */}
              {phonoPreamp.supportsMM && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">MM Input</h2>
                  <dl className="space-y-3">
                    {phonoPreamp.mmInputImpedance !== null && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Input Impedance</dt>
                        <dd className="text-gray-900 font-medium">{phonoPreamp.mmInputImpedance}kΩ</dd>
                      </div>
                    )}
                    {phonoPreamp.mmInputCapacitance !== null && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Input Capacitance</dt>
                        <dd className="text-gray-900 font-medium">{phonoPreamp.mmInputCapacitance}pF</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* MC Input Section */}
              {phonoPreamp.supportsMC && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">MC Input</h2>
                  <dl className="space-y-3">
                    {phonoPreamp.mcInputImpedance && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Input Impedance</dt>
                        <dd className="text-gray-900 font-medium">{phonoPreamp.mcInputImpedance}</dd>
                      </div>
                    )}
                    {phonoPreamp.mcInputCapacitance !== null && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Input Capacitance</dt>
                        <dd className="text-gray-900 font-medium">{phonoPreamp.mcInputCapacitance}pF</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Adjustability */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjustability</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + 
                    (phonoPreamp.gainAdjustable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                    Gain {phonoPreamp.gainAdjustable ? '✓' : '✗'}
                  </span>
                  <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + 
                    (phonoPreamp.impedanceAdjust ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                    Impedance {phonoPreamp.impedanceAdjust ? '✓' : '✗'}
                  </span>
                  <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + 
                    (phonoPreamp.capacitanceAdjust ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                    Capacitance {phonoPreamp.capacitanceAdjust ? '✓' : '✗'}
                  </span>
                </div>
                <dl className="space-y-3">
                  {phonoPreamp.gainRange && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Gain Range</dt>
                      <dd className="text-gray-900 font-medium">{phonoPreamp.gainRange}</dd>
                    </div>
                  )}
                  {phonoPreamp.impedanceOptions && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Impedance Options</dt>
                      <dd className="text-gray-900 font-medium">{phonoPreamp.impedanceOptions}</dd>
                    </div>
                  )}
                  {phonoPreamp.capacitanceRange && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Capacitance Range</dt>
                      <dd className="text-gray-900 font-medium">{phonoPreamp.capacitanceRange}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* General Specs */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">General Specifications</h2>
                <dl className="space-y-3">
                  {(phonoPreamp.freqRespLow !== null || phonoPreamp.freqRespHigh !== null) && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Frequency Response</dt>
                      <dd className="text-gray-900 font-medium">
                        {phonoPreamp.freqRespLow}Hz - {phonoPreamp.freqRespHigh}kHz
                      </dd>
                    </div>
                  )}
                  {phonoPreamp.equalizationCurve && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Equalization</dt>
                      <dd className="text-gray-900 font-medium">{phonoPreamp.equalizationCurve}</dd>
                    </div>
                  )}
                  {phonoPreamp.inputConnectors && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Input Connectors</dt>
                      <dd className="text-gray-900 font-medium">{phonoPreamp.inputConnectors}</dd>
                    </div>
                  )}
                  {phonoPreamp.outputConnectors && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Output Connectors</dt>
                      <dd className="text-gray-900 font-medium">{phonoPreamp.outputConnectors}</dd>
                    </div>
                  )}
                  {phonoPreamp.powerSupply && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Power Supply</dt>
                      <dd className="text-gray-900 font-medium">{phonoPreamp.powerSupply}</dd>
                    </div>
                  )}
                  {phonoPreamp.voltage && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Voltage</dt>
                      <dd className="text-gray-900 font-medium">{phonoPreamp.voltage}</dd>
                    </div>
                  )}
                  {phonoPreamp.productionPeriods && phonoPreamp.productionPeriods.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Production Years</dt>
                      <dd className="text-gray-900 font-medium">
                        {formatProductionYears(phonoPreamp.productionPeriods)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Dimensions */}
              {(phonoPreamp.width !== null || phonoPreamp.depth !== null || phonoPreamp.height !== null || phonoPreamp.weight !== null) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Dimensions</h2>
                  <dl className="space-y-3">
                    {(phonoPreamp.width !== null || phonoPreamp.depth !== null || phonoPreamp.height !== null) && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Size (W×D×H)</dt>
                        <dd className="text-gray-900 font-medium">
                          {[phonoPreamp.width, phonoPreamp.depth, phonoPreamp.height].filter(v => v !== null).join(' × ')}mm
                        </dd>
                      </div>
                    )}
                    {phonoPreamp.weight !== null && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Weight</dt>
                        <dd className="text-gray-900 font-medium">{phonoPreamp.weight}kg</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Compatible Equipment Count */}
              {phonoPreamp._count && (phonoPreamp._count.compatibleCarts > 0 || phonoPreamp._count.userSetups > 0) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Compatibility</h2>
                  <div className="flex gap-4">
                    {phonoPreamp._count.compatibleCarts > 0 && (
                      <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{phonoPreamp._count.compatibleCarts}</p>
                        <p className="text-xs text-blue-600">Compatible Cartridges</p>
                      </div>
                    )}
                    {phonoPreamp._count.userSetups > 0 && (
                      <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{phonoPreamp._count.userSetups}</p>
                        <p className="text-xs text-green-600">User Setups</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Source */}
          {phonoPreamp.dataSource && (
            <div className="border-t border-gray-200 px-6 lg:px-8 py-4 bg-gray-50">
              <p className="text-sm text-gray-500">
                Data source:{' '}
                {phonoPreamp.dataSourceUrl ? (
                  <a
                    href={phonoPreamp.dataSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {phonoPreamp.dataSource}
                  </a>
                ) : (
                  phonoPreamp.dataSource
                )}
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/phono-preamps"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all phono preamps
          </Link>
        </div>
      </div>
    </div>
  );
}
