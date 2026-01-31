'use client';

import { useEffect, useState } from 'react';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  FilterBar,
  ComponentCard,
  ComponentGrid,
  RichTextEditor,
  FilterConfig,
} from '@/components/shared';
import { useComponentList, ComponentWithBrand } from '@/hooks/useComponentList';
import { getImageUrl } from '@/lib/image-utils';

interface Turntable extends ComponentWithBrand {
  modelName: string;
  modelNumber: string | null;
  driveType: string;
  motorType: string | null;
  platterMaterial: string | null;
  platterWeight: number | null;
  speeds: string;
  wowFlutter: number | null;
  weight: number | null;
  imageUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
}

const FILTERS: FilterConfig[] = [
  { key: 'model', label: 'Model Name', type: 'text', placeholder: 'Search by model name...' },
  { key: 'brand', label: 'Brand', type: 'select', allLabel: 'All Brands' },
  { key: 'driveType', label: 'Drive Type', type: 'select', allLabel: 'All Drive Types' },
];

export default function TurntablesPage() {
  const {
    items,
    filteredItems,
    loading,
    error,
    filterValues,
    filterOptions,
    setFilterValue,
    refetch,
  } = useComponentList<Turntable>({
    endpoint: '/api/turntables',
    filters: FILTERS,
  });

  // Page description editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageDescription, setPageDescription] = useState(
    '<p>Browse our collection of classic turntables from renowned manufacturers</p>'
  );

  // Load saved description and update with count
  useEffect(() => {
    const saved = localStorage.getItem('turntables_page_description');
    if (saved) {
      setPageDescription(saved);
    }
  }, []);

  useEffect(() => {
    if (!isEditMode && !localStorage.getItem('turntables_page_description') && items.length > 0) {
      setPageDescription(
        `<p>Browse our collection of ${items.length} classic turntables from renowned manufacturers</p>`
      );
    }
  }, [items.length, isEditMode]);

  const handleSaveDescription = () => {
    localStorage.setItem('turntables_page_description', pageDescription);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    const saved = localStorage.getItem('turntables_page_description');
    if (saved) {
      setPageDescription(saved);
    } else {
      setPageDescription(
        `<p>Browse our collection of ${items.length} classic turntables from renowned manufacturers</p>`
      );
    }
    setIsEditMode(false);
  };

  if (loading) return <LoadingState message="Loading turntables..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-900">Vintage Turntables</h1>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Editable Page Description */}
          <div className="mb-8">
            {isEditMode ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-primary-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edit Page Description
                </label>
                <RichTextEditor
                  value={pageDescription}
                  onChange={setPageDescription}
                  placeholder="Enter page description..."
                  className="mb-3"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="text-gray-600 [&_p]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_a]:text-primary-600 [&_a]:hover:underline [&_strong]:font-bold [&_em]:italic"
                dangerouslySetInnerHTML={{ __html: pageDescription }}
              />
            )}
          </div>

          <FilterBar
            filters={FILTERS}
            values={filterValues}
            options={filterOptions}
            onChange={setFilterValue}
          />

          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} turntables
          </div>

          <ComponentGrid>
            {filteredItems.map((turntable) => (
              <ComponentCard
                key={turntable.id}
                href={`/turntables/${turntable.id}`}
                imageUrl={getImageUrl(turntable.imageUrl)}
                imageAlt={`${turntable.brand.name} ${turntable.modelName}`}
                placeholderIcon="🎚️"
                title={`${turntable.brand.name} ${turntable.modelName}`}
                subtitle={turntable.brand.country}
                badges={[{ text: turntable.driveType, className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 opacity-50' }]}
                specs={[
                  { label: 'Motor', value: turntable.motorType },
                  { label: 'Wow & Flutter', value: turntable.wowFlutter, unit: '%' },
                  { label: 'Weight', value: turntable.weight, unit: ' kg' },
                ]}
              />
            ))}
          </ComponentGrid>

          {filteredItems.length === 0 && (
            <EmptyState icon="🔍" title="No turntables found" />
          )}
        </div>
      </div>
    </>
  );
}
