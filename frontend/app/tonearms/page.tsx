'use client';

import { useEffect, useState } from 'react';

interface Brand {
  id: string;
  name: string;
  country: string | null;
}

interface Tonearm {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber: string | null;
  armType: string;
  effectiveLength: number | null;
  effectiveMass: number;
  headshellType: string;
  totalWeight: number | null;
  height: number | null;
  imageUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
  brand: Brand;
}

export default function TonearmsPage() {
  const [tonearms, setTonearms] = useState<Tonearm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [armTypeFilter, setArmTypeFilter] = useState<string>('all');

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    return imageUrl.startsWith('http') ? imageUrl : `${apiBaseUrl}${imageUrl}`;
  };

  useEffect(() => {
    fetchTonearms();
  }, []);

  const fetchTonearms = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/tonearms`);

      if (!response.ok) {
        throw new Error(`Failed to fetch tonearms: ${response.statusText}`);
      }

      const data = await response.json();
      setTonearms(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tonearms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tonearms');
    } finally {
      setLoading(false);
    }
  };

  const filteredTonearms = tonearms.filter((tonearm) => {
    const matchesModel =
      modelFilter === '' ||
      tonearm.modelName.toLowerCase().includes(modelFilter.toLowerCase());

    const matchesBrand =
      brandFilter === 'all' || tonearm.brand.name === brandFilter;

    const matchesArmType =
      armTypeFilter === 'all' || tonearm.armType === armTypeFilter;

    return matchesModel && matchesBrand && matchesArmType;
  });

  const brands = ['all', ...Array.from(new Set(tonearms.map((t) => t.brand.name)))].sort();
  const armTypes = ['all', ...Array.from(new Set(tonearms.map((t) => t.armType)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tonearms...</p>
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
            onClick={fetchTonearms}
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vintage Tonearms</h1>
          <p className="text-gray-600">
            Browse our collection of {tonearms.length} classic tonearms from renowned manufacturers
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
                Arm Type
              </label>
              <select
                value={armTypeFilter}
                onChange={(e) => setArmTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {armTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Arm Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredTonearms.length} of {tonearms.length} tonearms
        </div>

        {/* Tonearms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTonearms.map((tonearm) => (
            <div
              key={tonearm.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {tonearm.imageUrl ? (
                  <img
                    src={getImageUrl(tonearm.imageUrl) || ''}
                    alt={`${tonearm.brand.name} ${tonearm.modelName}`}
                    className="max-w-[80%] max-h-[80%] object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-6xl">🎚️</div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tonearm.brand.name} {tonearm.modelName}
                    </h3>
                    <p className="text-sm text-gray-500">{tonearm.brand.country}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {tonearm.armType}
                  </span>
                </div>

                {/* Specs */}
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  {tonearm.effectiveLength && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Effective Length:</span>
                      <span>{tonearm.effectiveLength}mm</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Effective Mass:</span>
                    <span>{tonearm.effectiveMass}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Headshell:</span>
                    <span className="text-right">{tonearm.headshellType}</span>
                  </div>
                  {tonearm.totalWeight && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Weight:</span>
                      <span>{tonearm.totalWeight}g</span>
                    </div>
                  )}
                </div>

                {/* Data Source */}
                {tonearm.dataSource && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Source:{' '}
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
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTonearms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tonearms found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
