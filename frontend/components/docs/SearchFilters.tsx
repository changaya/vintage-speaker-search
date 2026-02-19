'use client';

import { CategoryCount } from '@/lib/docs-api';

interface SearchFiltersProps {
  brand: string;
  category: string;
  categories: CategoryCount[];
  onBrandChange: (brand: string) => void;
  onCategoryChange: (category: string) => void;
}

const BRANDS = [
  { value: '', label: 'All Brands' },
  { value: 'Altec', label: 'Altec' },
  { value: 'JBL', label: 'JBL' },
  { value: 'Phasemation', label: 'Phasemation' },
];

// Display names for category values
const CATEGORY_LABELS: Record<string, string> = {
  catalogs: 'Catalogs',
  catalogues: 'Catalogues',
  manuals: 'Manuals',
  specs: 'Specs',
  plans: 'Plans',
  reference: 'Reference',
};

/**
 * Search Filters Component
 *
 * Provides brand and category filter buttons for document search.
 * Categories are dynamically shown based on available documents.
 */
export const SearchFilters = ({
  brand,
  category,
  categories,
  onBrandChange,
  onCategoryChange,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Brand Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand
        </label>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => onBrandChange(b.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                brand === b.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-500'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter - dynamically rendered from API data */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {/* All Categories button */}
          <button
            type="button"
            onClick={() => onCategoryChange('')}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              category === ''
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-500'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.category}
              type="button"
              onClick={() => onCategoryChange(c.category)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                category === c.category
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-500'
              }`}
            >
              {CATEGORY_LABELS[c.category] || c.category}
              <span className="ml-1.5 text-xs opacity-70">({c.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
