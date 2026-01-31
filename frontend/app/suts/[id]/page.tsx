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

interface SUT {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber: string | null;
  transformerType: string;
  gainDb: number | null;
  gainRatio: string | null;
  primaryImpedance: number | null;
  secondaryImp: number | null;
  inputImpedance: string | null;
  freqRespLow: number | null;
  freqRespHigh: number | null;
  freqRespTolerance: number | null;
  coreType: string | null;
  inputConnectors: string | null;
  outputConnectors: string | null;
  balanced: boolean;
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

export default function SUTDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [sut, setSut] = useState<SUT | null>(null);
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch SUT data and images in parallel
        const [sutRes, imagesRes] = await Promise.all([
          api.get('/api/suts/' + id),
          api.get('/api/component-images/sut/' + id),
        ]);

        setSut(sutRes.data);
        setImages(imagesRes.data.images || []);
      } catch (err: any) {
        console.error('Error fetching SUT:', err);
        if (err.response?.status === 404) {
          setError('Step-Up Transformer not found');
        } else {
          setError('Failed to load SUT details');
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
          <p className="text-gray-600">Loading SUT details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !sut) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || 'SUT not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The step-up transformer you are looking for might have been removed or does not exist.
          </p>
          <Link
            href="/suts"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to SUTs
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
              <Link href="/suts" className="hover:text-primary-600">Step-Up Transformers</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">
              {sut.brand.name} {sut.modelName}
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
                placeholderIcon="🔌"
                alt={sut.brand.name + ' ' + sut.modelName}
              />
            </div>

            {/* Details */}
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {sut.brand.name}
                      {sut.brand.country && ' · ' + sut.brand.country}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {sut.modelName}
                    </h1>
                    {sut.modelNumber && (
                      <p className="text-gray-500 mt-1">Model: {sut.modelNumber}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {sut.transformerType}
                    </span>
                    {sut.balanced && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Balanced
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {sut.gainDb !== null && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Gain</p>
                    <p className="text-sm font-medium text-gray-900">
                      {sut.gainDb}dB
                      {sut.gainRatio && ' (' + sut.gainRatio + ')'}
                    </p>
                  </div>
                )}
                {sut.inputImpedance && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Input Impedance</p>
                    <p className="text-sm font-medium text-gray-900">{sut.inputImpedance}</p>
                  </div>
                )}
                {sut.coreType && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Core Type</p>
                    <p className="text-sm font-medium text-gray-900">{sut.coreType}</p>
                  </div>
                )}
                {(sut.freqRespLow !== null || sut.freqRespHigh !== null) && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Frequency</p>
                    <p className="text-sm font-medium text-gray-900">
                      {sut.freqRespLow}Hz - {sut.freqRespHigh}kHz
                    </p>
                  </div>
                )}
              </div>

              {/* Detailed Specs */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
                <dl className="space-y-3">
                  {sut.primaryImpedance !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Primary Impedance</dt>
                      <dd className="text-gray-900 font-medium">{sut.primaryImpedance}Ω</dd>
                    </div>
                  )}
                  {sut.secondaryImp !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Secondary Impedance</dt>
                      <dd className="text-gray-900 font-medium">{sut.secondaryImp}Ω</dd>
                    </div>
                  )}
                  {sut.freqRespTolerance !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Frequency Tolerance</dt>
                      <dd className="text-gray-900 font-medium">±{sut.freqRespTolerance}dB</dd>
                    </div>
                  )}
                  {sut.inputConnectors && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Input Connectors</dt>
                      <dd className="text-gray-900 font-medium">{sut.inputConnectors}</dd>
                    </div>
                  )}
                  {sut.outputConnectors && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Output Connectors</dt>
                      <dd className="text-gray-900 font-medium">{sut.outputConnectors}</dd>
                    </div>
                  )}
                  {sut.productionPeriods && sut.productionPeriods.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Production Years</dt>
                      <dd className="text-gray-900 font-medium">
                        {formatProductionYears(sut.productionPeriods)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Dimensions */}
              {(sut.width !== null || sut.depth !== null || sut.height !== null || sut.weight !== null) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Dimensions</h2>
                  <dl className="space-y-3">
                    {(sut.width !== null || sut.depth !== null || sut.height !== null) && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Size (W×D×H)</dt>
                        <dd className="text-gray-900 font-medium">
                          {[sut.width, sut.depth, sut.height].filter(v => v !== null).join(' × ')}mm
                        </dd>
                      </div>
                    )}
                    {sut.weight !== null && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Weight</dt>
                        <dd className="text-gray-900 font-medium">{sut.weight}kg</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Compatible Equipment Count */}
              {sut._count && (sut._count.compatibleCarts > 0 || sut._count.userSetups > 0) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Compatibility</h2>
                  <div className="flex gap-4">
                    {sut._count.compatibleCarts > 0 && (
                      <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{sut._count.compatibleCarts}</p>
                        <p className="text-xs text-blue-600">Compatible Cartridges</p>
                      </div>
                    )}
                    {sut._count.userSetups > 0 && (
                      <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{sut._count.userSetups}</p>
                        <p className="text-xs text-green-600">User Setups</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Source */}
          {sut.dataSource && (
            <div className="border-t border-gray-200 px-6 lg:px-8 py-4 bg-gray-50">
              <p className="text-sm text-gray-500">
                Data source:{' '}
                {sut.dataSourceUrl ? (
                  <a
                    href={sut.dataSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {sut.dataSource}
                  </a>
                ) : (
                  sut.dataSource
                )}
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/suts"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all step-up transformers
          </Link>
        </div>
      </div>
    </div>
  );
}
