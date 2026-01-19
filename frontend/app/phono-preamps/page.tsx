'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  country: string | null;
}

interface PhonoPreamp {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber: string | null;
  supportsMM: boolean;
  supportsMC: boolean;
  mmGain: number | null;
  mcGain: number | null;
  amplifierType: string | null;
  snr: number | null;
  thd: number | null;
  balanced: boolean;
  imageUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
  brand: Brand;
}

export default function PhonoPreampsPage() {
  const [phonoPreamps, setPhonoPreamps] = useState<PhonoPreamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    return imageUrl.startsWith('http') ? imageUrl : `${apiBaseUrl}${imageUrl}`;
  };

  useEffect(() => {
    fetchPhonoPreamps();
  }, []);

  const fetchPhonoPreamps = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/phono-preamps`);

      if (!response.ok) {
        throw new Error(`Failed to fetch phono preamps: ${response.statusText}`);
      }

      const data = await response.json();
      setPhonoPreamps(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching phono preamps:', err);
      setError(err instanceof Error ? err.message : 'Failed to load phono preamps');
    } finally {
      setLoading(false);
    }
  };

  const filteredPhonoPreamps = phonoPreamps.filter((preamp) => {
    const matchesModel =
      modelFilter === '' ||
      preamp.modelName.toLowerCase().includes(modelFilter.toLowerCase());

    const matchesBrand =
      brandFilter === 'all' || preamp.brand.name === brandFilter;

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'MM' && preamp.supportsMM) ||
      (typeFilter === 'MC' && preamp.supportsMC) ||
      (typeFilter === 'MM/MC' && preamp.supportsMM && preamp.supportsMC);

    return matchesModel && matchesBrand && matchesType;
  });

  const brands = ['all', ...Array.from(new Set(phonoPreamps.map((p) => p.brand.name)))].sort();
  const types = ['all', 'MM', 'MC', 'MM/MC'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading phono preamps...</p>
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
            onClick={fetchPhonoPreamps}
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vintage Phono Preamps</h1>
          <p className="text-gray-600">
            Browse our collection of {phonoPreamps.length} classic phono preamps from renowned manufacturers
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
                Cartridge Type Support
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredPhonoPreamps.length} of {phonoPreamps.length} phono preamps
        </div>

        {/* Phono Preamps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhonoPreamps.map((preamp) => (
            <Link
              key={preamp.id}
              href={'/phono-preamps/' + preamp.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border group"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {preamp.imageUrl ? (
                  <img
                    src={getImageUrl(preamp.imageUrl) || ''}
                    alt={`${preamp.brand.name} ${preamp.modelName}`}
                    className="max-w-[80%] max-h-[80%] object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-6xl">🎛️</div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {preamp.brand.name} {preamp.modelName}
                    </h3>
                    <p className="text-sm text-gray-500">{preamp.brand.country}</p>
                  </div>
                  <div className="flex gap-1">
                    {preamp.supportsMM && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        MM
                      </span>
                    )}
                    {preamp.supportsMC && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        MC
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs */}
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  {preamp.amplifierType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{preamp.amplifierType}</span>
                    </div>
                  )}
                  {preamp.mmGain !== null && preamp.supportsMM && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">MM Gain:</span>
                      <span>{preamp.mmGain}dB</span>
                    </div>
                  )}
                  {preamp.mcGain !== null && preamp.supportsMC && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">MC Gain:</span>
                      <span>{preamp.mcGain}dB</span>
                    </div>
                  )}
                  {preamp.snr !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">S/N Ratio:</span>
                      <span>{preamp.snr}dB</span>
                    </div>
                  )}
                </div>

                {/* Data Source */}
                {preamp.dataSource && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Source:{' '}
                      {preamp.dataSourceUrl ? (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(preamp.dataSourceUrl!, '_blank');
                          }}
                          className="text-primary-600 hover:underline cursor-pointer"
                        >
                          {preamp.dataSource}
                        </span>
                      ) : (
                        preamp.dataSource
                      )}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPhonoPreamps.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No phono preamps found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
