'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  FilterBar,
  ComponentCard,
  ComponentGrid,
  FilterConfig,
} from '@/components/shared';
import { useComponentList, ComponentWithBrand } from '@/hooks/useComponentList';
import { getImageUrl } from '@/lib/image-utils';

interface Cartridge extends ComponentWithBrand {
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
}

const FILTERS: FilterConfig[] = [
  { key: 'model', label: 'Model Name', type: 'text', placeholder: 'Search by model name...' },
  { key: 'brand', label: 'Brand', type: 'select', allLabel: 'All Brands' },
  { key: 'cartridgeType', label: 'Cartridge Type', type: 'select', allLabel: 'All Types' },
];

export default function CartridgesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const {
    items,
    filteredItems,
    loading,
    error,
    filterValues,
    filterOptions,
    setFilterValue,
    refetch,
  } = useComponentList<Cartridge>({
    endpoint: '/api/cartridges',
    filters: FILTERS,
  });

  if (loading) return <LoadingState message="Loading cartridges..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vintage Cartridges</h1>
          <p className="text-gray-600">
            Browse our collection of {items.length} classic phono cartridges from renowned manufacturers
          </p>
        </div>

        <FilterBar
          filters={FILTERS}
          values={filterValues}
          options={filterOptions}
          onChange={setFilterValue}
        />

        {/* Results Count and View Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} cartridges
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
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
                  {filteredItems.map((cartridge) => (
                    <tr
                      key={cartridge.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => (window.location.href = `/cartridges/${cartridge.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                          {cartridge.imageUrl ? (
                            <img
                              src={getImageUrl(cartridge.imageUrl) || ''}
                              alt={`${cartridge.brand.name} ${cartridge.modelName}`}
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
                        {cartridge.outputVoltage ? `${cartridge.outputVoltage}mV` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cartridge.outputImpedance ? `${cartridge.outputImpedance}Ω` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cartridge.compliance ? `${cartridge.compliance}µm/mN` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cartridge.trackingForceMin && cartridge.trackingForceMax
                          ? `${cartridge.trackingForceMin}-${cartridge.trackingForceMax}g`
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

        {/* Grid View */}
        {viewMode === 'grid' && (
          <ComponentGrid>
            {filteredItems.map((cartridge) => (
              <ComponentCard
                key={cartridge.id}
                href={`/cartridges/${cartridge.id}`}
                imageUrl={getImageUrl(cartridge.imageUrl)}
                imageAlt={`${cartridge.brand.name} ${cartridge.modelName}`}
                placeholderIcon="💿"
                title={`${cartridge.brand.name} ${cartridge.modelName}`}
                subtitle={cartridge.brand.country}
                badges={[{ text: cartridge.cartridgeType }]}
                specs={[
                  { label: 'Output', value: cartridge.outputVoltage, unit: 'mV' },
                  { label: 'Compliance', value: cartridge.compliance, unit: 'µm/mN' },
                  {
                    label: 'Tracking Force',
                    value:
                      cartridge.trackingForceMin && cartridge.trackingForceMax
                        ? `${cartridge.trackingForceMin}-${cartridge.trackingForceMax}`
                        : null,
                    unit: 'g',
                  },
                  { label: 'Stylus', value: cartridge.stylusType },
                ]}
                dataSource={cartridge.dataSource}
                dataSourceUrl={cartridge.dataSourceUrl}
              />
            ))}
          </ComponentGrid>
        )}

        {filteredItems.length === 0 && (
          <EmptyState icon="🔍" title="No cartridges found" />
        )}
      </div>
    </div>
  );
}
