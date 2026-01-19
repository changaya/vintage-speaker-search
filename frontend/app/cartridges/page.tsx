'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  country: string | null;
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
  compliance: number | null;
  trackingForceMin: number | null;
  trackingForceMax: number | null;
  stylusType: string | null;
  cantilevMaterial: string | null;
  channelSeparation: number | null;
  freqRespLow: number | null;
  freqRespHigh: number | null;
  cartridgeWeight: number | null;
  imageUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
  brand: Brand;
}

export default function CartridgesPage() {
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    return imageUrl.startsWith('http') ? imageUrl : apiBaseUrl + imageUrl;
  };

  useEffect(() => {
    fetchCartridges();
  }, []);

  const fetchCartridges = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(apiUrl + '/api/cartridges');

      if (!response.ok) {
        throw new Error('Failed to fetch cartridges: ' + response.statusText);
      }

      const data = await response.json();
      setCartridges(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cartridges:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cartridges');
    } finally {
      setLoading(false);
    }
  };

  const filteredCartridges = cartridges.filter((cartridge) => {
    const matchesModel =
      modelFilter === '' ||
      cartridge.modelName.toLowerCase().includes(modelFilter.toLowerCase());

    const matchesBrand =
      brandFilter === 'all' || cartridge.brand.name === brandFilter;

    const matchesType =
      typeFilter === 'all' || cartridge.cartridgeType === typeFilter;

    return matchesModel && matchesBrand && matchesType;
  });

  const brands = ['all', ...Array.from(new Set(cartridges.map((c) => c.brand.name)))].sort();
  const cartridgeTypes = ['all', ...Array.from(new Set(cartridges.map((c) => c.cartridgeType)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cartridges...</p>
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
            onClick={fetchCartridges}
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vintage Cartridges</h1>
          <p className="text-gray-600">
            Browse our collection of {cartridges.length} classic phono cartridges from renowned manufacturers
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
                Cartridge Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {cartridgeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count and View Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredCartridges.length} of {cartridges.length} cartridges
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50')
              }
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (viewMode === 'table'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50')
              }
            >
              Table View
            </button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impedance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking Force</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stylus</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCartridges.map((cartridge) => (
                    <tr
                      key={cartridge.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => window.location.href = '/cartridges/' + cartridge.id}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                          {cartridge.imageUrl ? (
                            <img
                              src={getImageUrl(cartridge.imageUrl) || ''}
                              alt={cartridge.brand.name + ' ' + cartridge.modelName}
                              className="max-w-[90%] max-h-[90%] object-contain"
                            />
                          ) : (
                            <span className="text-gray-400 text-2xl">💿</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 hover:text-primary-600">
                          {cartridge.brand.name} {cartridge.modelName}
                        </div>
                        <div className="text-sm text-gray-500">{cartridge.brand.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {cartridge.cartridgeType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cartridge.outputVoltage ? cartridge.outputVoltage + 'mV' : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cartridge.outputImpedance ? cartridge.outputImpedance + 'Ω' : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cartridge.compliance ? cartridge.compliance + 'µm/mN' : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cartridge.trackingForceMin && cartridge.trackingForceMax
                          ? cartridge.trackingForceMin + '-' + cartridge.trackingForceMax + 'g'
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={cartridge.stylusType || ''}>
                        {cartridge.stylusType || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cartridges Grid */}
        {viewMode === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCartridges.map((cartridge) => (
              <Link
                key={cartridge.id}
                href={'/cartridges/' + cartridge.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border group"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {cartridge.imageUrl ? (
                    <img
                      src={getImageUrl(cartridge.imageUrl) || ''}
                      alt={cartridge.brand.name + ' ' + cartridge.modelName}
                      className="max-w-[80%] max-h-[80%] object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-6xl">💿</div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {cartridge.brand.name} {cartridge.modelName}
                      </h3>
                      <p className="text-sm text-gray-500">{cartridge.brand.country}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {cartridge.cartridgeType}
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {cartridge.outputVoltage && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Output:</span>
                        <span>{cartridge.outputVoltage}mV</span>
                      </div>
                    )}
                    {cartridge.compliance && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Compliance:</span>
                        <span>{cartridge.compliance}µm/mN</span>
                      </div>
                    )}
                    {cartridge.trackingForceMin && cartridge.trackingForceMax && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tracking Force:</span>
                        <span>{cartridge.trackingForceMin}-{cartridge.trackingForceMax}g</span>
                      </div>
                    )}
                    {cartridge.stylusType && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Stylus:</span>
                        <span className="text-right">{cartridge.stylusType}</span>
                      </div>
                    )}
                  </div>

                  {/* Data Source */}
                  {cartridge.dataSource && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Source:{' '}
                        {cartridge.dataSourceUrl ? (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(cartridge.dataSourceUrl!, '_blank');
                            }}
                            className="text-primary-600 hover:underline cursor-pointer"
                          >
                            {cartridge.dataSource}
                          </span>
                        ) : (
                          cartridge.dataSource
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCartridges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cartridges found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
