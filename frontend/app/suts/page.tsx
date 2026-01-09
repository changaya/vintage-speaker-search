'use client';

import { useEffect, useState } from 'react';

interface Brand {
  id: string;
  name: string;
  country: string | null;
}

interface SUT {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber: string | null;
  gainDb: number;
  gainRatio: string | null;
  primaryImpedance: number | null;
  secondaryImp: number | null;
  inputImpedance: string;
  freqRespLow: number | null;
  freqRespHigh: number | null;
  coreType: string | null;
  inputConnectors: string;
  outputConnectors: string;
  imageUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
  brand: Brand;
}

export default function SUTsPage() {
  const [suts, setSuts] = useState<SUT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [coreTypeFilter, setCoreTypeFilter] = useState<string>('all');

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    // Relative paths need to be prefixed with backend URL
    const fullUrl = `http://localhost:4000${imageUrl}`;
    console.log('Image URL:', imageUrl, '→', fullUrl);
    return fullUrl;
  };

  useEffect(() => {
    fetchSUTs();
  }, []);

  const fetchSUTs = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/suts`);

      if (!response.ok) {
        throw new Error(`Failed to fetch SUTs: ${response.statusText}`);
      }

      const data = await response.json();
      setSuts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching SUTs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load SUTs');
    } finally {
      setLoading(false);
    }
  };

  const filteredSUTs = suts.filter((sut) => {
    const matchesModel =
      modelFilter === '' ||
      sut.modelName.toLowerCase().includes(modelFilter.toLowerCase());

    const matchesBrand =
      brandFilter === 'all' || sut.brand.name === brandFilter;

    const matchesCoreType =
      coreTypeFilter === 'all' || sut.coreType === coreTypeFilter;

    return matchesModel && matchesBrand && matchesCoreType;
  });

  const brands = ['all', ...Array.from(new Set(suts.map((s) => s.brand.name)))].sort();
  const coreTypes = ['all', ...Array.from(new Set(suts.map((s) => s.coreType).filter(Boolean)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SUTs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchSUTs}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vintage Step-Up Transformers</h1>
          <p className="text-gray-600">
            Browse our collection of {suts.length} classic SUTs from renowned manufacturers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                type="text"
                placeholder="Search by model name..."
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Brands</option>
                {brands.filter(b => b !== 'all').map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Core Type
              </label>
              <select
                value={coreTypeFilter}
                onChange={(e) => setCoreTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {coreTypes.map((type) => (
                  <option key={type || 'all'} value={type || 'all'}>
                    {type === 'all' ? 'All Core Types' : type || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredSUTs.length} of {suts.length} SUTs
        </div>

        {/* SUTs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSUTs.map((sut) => (
            <div
              key={sut.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {getImageUrl(sut.imageUrl) ? (
                  <img
                    src={getImageUrl(sut.imageUrl)!}
                    alt={`${sut.brand.name} ${sut.modelName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', getImageUrl(sut.imageUrl));
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-6xl">🔌</div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sut.brand.name} {sut.modelName}
                    </h3>
                    <p className="text-sm text-gray-500">{sut.brand.country}</p>
                  </div>
                  {sut.coreType && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {sut.coreType}
                    </span>
                  )}
                </div>

                {/* Specs */}
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gain:</span>
                    <span>{sut.gainDb}dB{sut.gainRatio ? ` (${sut.gainRatio})` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Input Impedance:</span>
                    <span className="text-right">{sut.inputImpedance}</span>
                  </div>
                  {sut.primaryImpedance && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Primary:</span>
                      <span>{sut.primaryImpedance}Ω</span>
                    </div>
                  )}
                  {sut.secondaryImp && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Secondary:</span>
                      <span>{sut.secondaryImp}Ω</span>
                    </div>
                  )}
                  {sut.freqRespLow && sut.freqRespHigh && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Frequency:</span>
                      <span>{sut.freqRespLow}Hz - {sut.freqRespHigh}kHz</span>
                    </div>
                  )}
                </div>

                {/* Data Source */}
                {sut.dataSource && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Source:{' '}
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
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSUTs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SUTs found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
