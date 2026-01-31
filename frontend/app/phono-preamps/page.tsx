'use client';

import {
  LoadingState,
  ErrorState,
  EmptyState,
  FilterBar,
  ComponentCard,
  ComponentGrid,
  FilterConfig,
  FilterValues,
  FilterOptions,
} from '@/components/shared';
import { useComponentList, ComponentWithBrand } from '@/hooks/useComponentList';
import { getImageUrl } from '@/lib/image-utils';

interface PhonoPreamp extends ComponentWithBrand {
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
}

const FILTERS: FilterConfig[] = [
  { key: 'model', label: 'Model Name', type: 'text', placeholder: 'Search by model name...' },
  { key: 'brand', label: 'Brand', type: 'select', allLabel: 'All Brands' },
  { key: 'type', label: 'Cartridge Type Support', type: 'select', allLabel: 'All Types' },
];

// Custom filter options for phono preamps
const getFilterOptions = (items: PhonoPreamp[]): FilterOptions => {
  const brandNames = Array.from(new Set(items.map((item) => item.brand.name)));
  return {
    brand: ['all', ...brandNames.sort()],
    type: ['all', 'MM', 'MC', 'MM/MC'],
  };
};

// Custom filter function for phono preamps (MM/MC support logic)
const customFilter = (item: PhonoPreamp, filterValues: FilterValues): boolean => {
  const modelFilter = filterValues.model || '';
  const brandFilter = filterValues.brand || 'all';
  const typeFilter = filterValues.type || 'all';

  const matchesModel =
    modelFilter === '' ||
    item.modelName.toLowerCase().includes(modelFilter.toLowerCase());

  const matchesBrand = brandFilter === 'all' || item.brand.name === brandFilter;

  const matchesType =
    typeFilter === 'all' ||
    (typeFilter === 'MM' && item.supportsMM) ||
    (typeFilter === 'MC' && item.supportsMC) ||
    (typeFilter === 'MM/MC' && item.supportsMM && item.supportsMC);

  return matchesModel && matchesBrand && matchesType;
};

export default function PhonoPreampsPage() {
  const {
    items,
    filteredItems,
    loading,
    error,
    filterValues,
    filterOptions,
    setFilterValue,
    refetch,
  } = useComponentList<PhonoPreamp>({
    endpoint: '/api/phono-preamps',
    filters: FILTERS,
    getFilterOptions,
    customFilter,
  });

  if (loading) return <LoadingState message="Loading phono preamps..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vintage Phono Preamps</h1>
          <p className="text-gray-600">
            Browse our collection of {items.length} classic phono preamps from renowned manufacturers
          </p>
        </div>

        <FilterBar
          filters={FILTERS}
          values={filterValues}
          options={filterOptions}
          onChange={setFilterValue}
        />

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} phono preamps
        </div>

        <ComponentGrid>
          {filteredItems.map((preamp) => (
            <ComponentCard
              key={preamp.id}
              href={`/phono-preamps/${preamp.id}`}
              imageUrl={getImageUrl(preamp.imageUrl)}
              imageAlt={`${preamp.brand.name} ${preamp.modelName}`}
              placeholderIcon="🎛️"
              title={`${preamp.brand.name} ${preamp.modelName}`}
              subtitle={preamp.brand.country}
              badges={[
                ...(preamp.supportsMM
                  ? [{ text: 'MM', className: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800' }]
                  : []),
                ...(preamp.supportsMC
                  ? [{ text: 'MC', className: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800' }]
                  : []),
              ]}
              specs={[
                { label: 'Type', value: preamp.amplifierType },
                { label: 'MM Gain', value: preamp.mmGain, unit: 'dB', condition: preamp.supportsMM },
                { label: 'MC Gain', value: preamp.mcGain, unit: 'dB', condition: preamp.supportsMC },
                { label: 'S/N Ratio', value: preamp.snr, unit: 'dB' },
              ]}
              dataSource={preamp.dataSource}
              dataSourceUrl={preamp.dataSourceUrl}
            />
          ))}
        </ComponentGrid>

        {filteredItems.length === 0 && (
          <EmptyState icon="🔍" title="No phono preamps found" />
        )}
      </div>
    </div>
  );
}
