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

interface Tonearm {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber: string | null;
  armType: string;
  effectiveLength: number | null;
  effectiveMass: number;
  armTubeType: string | null;
  armTubeMaterial: string | null;
  bearingType: string | null;
  headshellType: string;
  headshellWeight: number | null;
  vtaAdjustable: boolean;
  azimuthAdjust: boolean;
  vtfMin: number | null;
  vtfMax: number | null;
  vtfAdjustType: string | null;
  antiSkateType: string | null;
  totalWeight: number | null;
  mountingType: string | null;
  imageUrl: string | null;
  specSheetUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
  brand: Brand;
  productionPeriods: ProductionPeriod[];
  _count?: {
    compatibleBases: number;
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

export default function TonearmDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [tonearm, setTonearm] = useState<Tonearm | null>(null);
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tonearm data and images in parallel
        const [tonearmRes, imagesRes] = await Promise.all([
          api.get('/api/tonearms/' + id),
          api.get('/api/component-images/tonearm/' + id),
        ]);

        setTonearm(tonearmRes.data);
        setImages(imagesRes.data.images || []);
      } catch (err: any) {
        console.error('Error fetching tonearm:', err);
        if (err.response?.status === 404) {
          setError('Tonearm not found');
        } else {
          setError('Failed to load tonearm details');
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
          <p className="text-gray-600">Loading tonearm details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tonearm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || 'Tonearm not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The tonearm you are looking for might have been removed or does not exist.
          </p>
          <Link
            href="/tonearms"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tonearms
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
              <Link href="/tonearms" className="hover:text-primary-600">Tonearms</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">
              {tonearm.brand.name} {tonearm.modelName}
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
                placeholderIcon="🎚️"
                alt={tonearm.brand.name + ' ' + tonearm.modelName}
              />
            </div>

            {/* Details */}
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {tonearm.brand.name}
                      {tonearm.brand.country && ' · ' + tonearm.brand.country}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {tonearm.modelName}
                    </h1>
                    {tonearm.modelNumber && (
                      <p className="text-gray-500 mt-1">Model: {tonearm.modelNumber}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {tonearm.armType}
                  </span>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Effective Mass</p>
                  <p className="text-sm font-medium text-gray-900">{tonearm.effectiveMass}g</p>
                </div>
                {tonearm.effectiveLength && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Effective Length</p>
                    <p className="text-sm font-medium text-gray-900">{tonearm.effectiveLength}mm</p>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Headshell</p>
                  <p className="text-sm font-medium text-gray-900">{tonearm.headshellType}</p>
                </div>
                {tonearm.bearingType && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Bearing</p>
                    <p className="text-sm font-medium text-gray-900">{tonearm.bearingType}</p>
                  </div>
                )}
              </div>

              {/* Detailed Specs */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
                <dl className="space-y-3">
                  {tonearm.armTubeType && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Arm Tube Type</dt>
                      <dd className="text-gray-900 font-medium">{tonearm.armTubeType}</dd>
                    </div>
                  )}
                  {tonearm.armTubeMaterial && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Arm Tube Material</dt>
                      <dd className="text-gray-900 font-medium">{tonearm.armTubeMaterial}</dd>
                    </div>
                  )}
                  {tonearm.headshellWeight !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Headshell Weight</dt>
                      <dd className="text-gray-900 font-medium">{tonearm.headshellWeight}g</dd>
                    </div>
                  )}
                  {(tonearm.vtfMin !== null || tonearm.vtfMax !== null) && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tracking Force Range</dt>
                      <dd className="text-gray-900 font-medium">
                        {tonearm.vtfMin && tonearm.vtfMax 
                          ? tonearm.vtfMin + ' - ' + tonearm.vtfMax + 'g'
                          : (tonearm.vtfMin || tonearm.vtfMax) + 'g'}
                      </dd>
                    </div>
                  )}
                  {tonearm.vtfAdjustType && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">VTF Adjustment</dt>
                      <dd className="text-gray-900 font-medium">{tonearm.vtfAdjustType}</dd>
                    </div>
                  )}
                  {tonearm.antiSkateType && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Anti-Skate</dt>
                      <dd className="text-gray-900 font-medium">{tonearm.antiSkateType}</dd>
                    </div>
                  )}
                  {tonearm.mountingType && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Mounting Type</dt>
                      <dd className="text-gray-900 font-medium">{tonearm.mountingType}</dd>
                    </div>
                  )}
                  {tonearm.totalWeight !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total Weight</dt>
                      <dd className="text-gray-900 font-medium">{tonearm.totalWeight}g</dd>
                    </div>
                  )}
                  {tonearm.productionPeriods && tonearm.productionPeriods.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Production Years</dt>
                      <dd className="text-gray-900 font-medium">
                        {formatProductionYears(tonearm.productionPeriods)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Adjustability Features */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjustability</h2>
                <div className="flex flex-wrap gap-2">
                  <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + 
                    (tonearm.vtaAdjustable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                    VTA {tonearm.vtaAdjustable ? '✓' : '✗'}
                  </span>
                  <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + 
                    (tonearm.azimuthAdjust ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                    Azimuth {tonearm.azimuthAdjust ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              {/* Compatible Equipment Count */}
              {tonearm._count && (tonearm._count.compatibleBases > 0 || tonearm._count.compatibleCarts > 0 || tonearm._count.userSetups > 0) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Compatibility</h2>
                  <div className="flex gap-4">
                    {tonearm._count.compatibleBases > 0 && (
                      <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{tonearm._count.compatibleBases}</p>
                        <p className="text-xs text-blue-600">Compatible Turntables</p>
                      </div>
                    )}
                    {tonearm._count.compatibleCarts > 0 && (
                      <div className="bg-purple-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{tonearm._count.compatibleCarts}</p>
                        <p className="text-xs text-purple-600">Compatible Cartridges</p>
                      </div>
                    )}
                    {tonearm._count.userSetups > 0 && (
                      <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{tonearm._count.userSetups}</p>
                        <p className="text-xs text-green-600">User Setups</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Source */}
          {tonearm.dataSource && (
            <div className="border-t border-gray-200 px-6 lg:px-8 py-4 bg-gray-50">
              <p className="text-sm text-gray-500">
                Data source:{' '}
                {tonearm.dataSourceUrl ? (
                  <a
                    href={tonearm.dataSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {tonearm.dataSource}
                  </a>
                ) : (
                  tonearm.dataSource
                )}
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/tonearms"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all tonearms
          </Link>
        </div>
      </div>
    </div>
  );
}
