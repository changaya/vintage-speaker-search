'use client';

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

interface Tonearm extends ComponentWithBrand {
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
}

const FILTERS: FilterConfig[] = [
  { key: 'model', label: 'Model Name', type: 'text', placeholder: 'Search by model name...' },
  { key: 'brand', label: 'Brand', type: 'select', allLabel: 'All Brands' },
  { key: 'armType', label: 'Arm Type', type: 'select', allLabel: 'All Arm Types' },
];

export default function TonearmsPage() {
  const {
    items,
    filteredItems,
    loading,
    error,
    filterValues,
    filterOptions,
    setFilterValue,
    refetch,
  } = useComponentList<Tonearm>({
    endpoint: '/api/tonearms',
    filters: FILTERS,
  });

  if (loading) return <LoadingState message="Loading tonearms..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vintage Tonearms</h1>
          <p className="text-gray-600">
            Browse our collection of {items.length} classic tonearms from renowned manufacturers
          </p>
        </div>

        <FilterBar
          filters={FILTERS}
          values={filterValues}
          options={filterOptions}
          onChange={setFilterValue}
        />

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} tonearms
        </div>

        <ComponentGrid>
          {filteredItems.map((tonearm) => (
            <ComponentCard
              key={tonearm.id}
              href={`/tonearms/${tonearm.id}`}
              imageUrl={getImageUrl(tonearm.imageUrl)}
              imageAlt={`${tonearm.brand.name} ${tonearm.modelName}`}
              placeholderIcon="🎚️"
              title={`${tonearm.brand.name} ${tonearm.modelName}`}
              subtitle={tonearm.brand.country}
              badges={[{ text: tonearm.armType }]}
              specs={[
                { label: 'Effective Length', value: tonearm.effectiveLength, unit: 'mm' },
                { label: 'Effective Mass', value: tonearm.effectiveMass, unit: 'g' },
                { label: 'Headshell', value: tonearm.headshellType },
                { label: 'Total Weight', value: tonearm.totalWeight, unit: 'g' },
              ]}
              dataSource={tonearm.dataSource}
              dataSourceUrl={tonearm.dataSourceUrl}
            />
          ))}
        </ComponentGrid>

        {filteredItems.length === 0 && (
          <EmptyState icon="🔍" title="No tonearms found" />
        )}
      </div>
    </div>
  );
}
