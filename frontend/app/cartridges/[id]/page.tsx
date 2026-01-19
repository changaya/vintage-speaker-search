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

interface Cartridge {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber: string | null;
  cartridgeType: string;
  outputVoltage: number | null;
  outputType: string | null;
  outputImpedance: number | null;
  loadImpedance: number | null;
  loadCapacitance: number | null;
  dcResistance: number | null;
  inductance: number | null;
  compliance: number | null;
  complianceFreq: string | null;
  complianceType: string | null;
  cartridgeWeight: number | null;
  trackingForceMin: number | null;
  trackingForceMax: number | null;
  trackingForceRec: number | null;
  stylusType: string | null;
  cantilevMaterial: string | null;
  freqRespLow: number | null;
  freqRespHigh: number | null;
  freqRespTolerance: number | null;
  channelSeparation: number | null;
  channelBalance: number | null;
  height: number | null;
  mountType: string | null;
  bodyMaterial: string | null;
  verticalTrackingAngle: number | null;
  recommendedUse: string | null;
  replacementStylus: string | null;
  imageUrl: string | null;
  specSheetUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
  notes: string | null;
  brand: Brand;
  productionPeriods: ProductionPeriod[];
  _count?: {
    compatibleTonearms: number;
    compatibleSUTs: number;
    compatiblePhonos: number;
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

export default function CartridgeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [cartridge, setCartridge] = useState<Cartridge | null>(null);
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch cartridge data and images in parallel
        const [cartridgeRes, imagesRes] = await Promise.all([
          api.get('/api/cartridges/' + id),
          api.get('/api/component-images/cartridge/' + id),
        ]);

        setCartridge(cartridgeRes.data);
        setImages(imagesRes.data.images || []);
      } catch (err: any) {
        console.error('Error fetching cartridge:', err);
        if (err.response?.status === 404) {
          setError('Cartridge not found');
        } else {
          setError('Failed to load cartridge details');
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
          <p className="text-gray-600">Loading cartridge details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !cartridge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || 'Cartridge not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The cartridge you are looking for might have been removed or does not exist.
          </p>
          <Link
            href="/cartridges"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cartridges
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
              <Link href="/cartridges" className="hover:text-primary-600">Cartridges</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">
              {cartridge.brand.name} {cartridge.modelName}
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
                placeholderIcon="💿"
                alt={cartridge.brand.name + ' ' + cartridge.modelName}
              />
            </div>

            {/* Details */}
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {cartridge.brand.name}
                      {cartridge.brand.country && ' · ' + cartridge.brand.country}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {cartridge.modelName}
                    </h1>
                    {cartridge.modelNumber && (
                      <p className="text-gray-500 mt-1">Model: {cartridge.modelNumber}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {cartridge.cartridgeType}
                    </span>
                    {cartridge.outputType && (
                      <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' +
                        (cartridge.outputType === 'low' 
                          ? 'bg-blue-100 text-blue-800' 
                          : cartridge.outputType === 'high'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800')
                      }>
                        {cartridge.outputType} output
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {cartridge.outputVoltage !== null && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Output</p>
                    <p className="text-sm font-medium text-gray-900">{cartridge.outputVoltage}mV</p>
                  </div>
                )}
                {cartridge.compliance !== null && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Compliance</p>
                    <p className="text-sm font-medium text-gray-900">
                      {cartridge.compliance}µm/mN
                      {cartridge.complianceFreq && ' @ ' + cartridge.complianceFreq}
                    </p>
                  </div>
                )}
                {cartridge.trackingForceRec !== null && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Force</p>
                    <p className="text-sm font-medium text-gray-900">{cartridge.trackingForceRec}g (rec)</p>
                  </div>
                )}
                {cartridge.stylusType && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Stylus</p>
                    <p className="text-sm font-medium text-gray-900">{cartridge.stylusType}</p>
                  </div>
                )}
              </div>

              {/* Detailed Specs */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
                <dl className="space-y-3">
                  {cartridge.outputImpedance !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Output Impedance</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.outputImpedance}Ω</dd>
                    </div>
                  )}
                  {cartridge.loadImpedance !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Load Impedance</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.loadImpedance}Ω</dd>
                    </div>
                  )}
                  {cartridge.loadCapacitance !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Load Capacitance</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.loadCapacitance}pF</dd>
                    </div>
                  )}
                  {cartridge.dcResistance !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">DC Resistance</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.dcResistance}Ω</dd>
                    </div>
                  )}
                  {cartridge.cantilevMaterial && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Cantilever</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.cantilevMaterial}</dd>
                    </div>
                  )}
                  {(cartridge.trackingForceMin !== null || cartridge.trackingForceMax !== null) && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tracking Force Range</dt>
                      <dd className="text-gray-900 font-medium">
                        {cartridge.trackingForceMin && cartridge.trackingForceMax 
                          ? cartridge.trackingForceMin + ' - ' + cartridge.trackingForceMax + 'g'
                          : (cartridge.trackingForceMin || cartridge.trackingForceMax) + 'g'}
                      </dd>
                    </div>
                  )}
                  {(cartridge.freqRespLow !== null || cartridge.freqRespHigh !== null) && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Frequency Response</dt>
                      <dd className="text-gray-900 font-medium">
                        {cartridge.freqRespLow}Hz - {cartridge.freqRespHigh}kHz
                        {cartridge.freqRespTolerance && ' ±' + cartridge.freqRespTolerance + 'dB'}
                      </dd>
                    </div>
                  )}
                  {cartridge.channelSeparation !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Channel Separation</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.channelSeparation}dB</dd>
                    </div>
                  )}
                  {cartridge.cartridgeWeight !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Weight</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.cartridgeWeight}g</dd>
                    </div>
                  )}
                  {cartridge.height !== null && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Height</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.height}mm</dd>
                    </div>
                  )}
                  {cartridge.mountType && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Mount Type</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.mountType}</dd>
                    </div>
                  )}
                  {cartridge.bodyMaterial && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Body Material</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.bodyMaterial}</dd>
                    </div>
                  )}
                  {cartridge.replacementStylus && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Replacement Stylus</dt>
                      <dd className="text-gray-900 font-medium">{cartridge.replacementStylus}</dd>
                    </div>
                  )}
                  {cartridge.productionPeriods && cartridge.productionPeriods.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Production Years</dt>
                      <dd className="text-gray-900 font-medium">
                        {formatProductionYears(cartridge.productionPeriods)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Compatible Equipment Count */}
              {cartridge._count && (cartridge._count.compatibleTonearms > 0 || cartridge._count.compatibleSUTs > 0 || cartridge._count.compatiblePhonos > 0 || cartridge._count.userSetups > 0) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Compatibility</h2>
                  <div className="flex flex-wrap gap-4">
                    {cartridge._count.compatibleTonearms > 0 && (
                      <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{cartridge._count.compatibleTonearms}</p>
                        <p className="text-xs text-blue-600">Compatible Tonearms</p>
                      </div>
                    )}
                    {cartridge._count.compatibleSUTs > 0 && (
                      <div className="bg-purple-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{cartridge._count.compatibleSUTs}</p>
                        <p className="text-xs text-purple-600">Compatible SUTs</p>
                      </div>
                    )}
                    {cartridge._count.compatiblePhonos > 0 && (
                      <div className="bg-orange-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{cartridge._count.compatiblePhonos}</p>
                        <p className="text-xs text-orange-600">Compatible Phonos</p>
                      </div>
                    )}
                    {cartridge._count.userSetups > 0 && (
                      <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{cartridge._count.userSetups}</p>
                        <p className="text-xs text-green-600">User Setups</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          {cartridge.notes && (
            <div className="border-t border-gray-200 px-6 lg:px-8 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
              <div 
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: cartridge.notes }}
              />
            </div>
          )}

          {/* Data Source */}
          {cartridge.dataSource && (
            <div className="border-t border-gray-200 px-6 lg:px-8 py-4 bg-gray-50">
              <p className="text-sm text-gray-500">
                Data source:{' '}
                {cartridge.dataSourceUrl ? (
                  <a
                    href={cartridge.dataSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {cartridge.dataSource}
                  </a>
                ) : (
                  cartridge.dataSource
                )}
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/cartridges"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all cartridges
          </Link>
        </div>
      </div>
    </div>
  );
}
